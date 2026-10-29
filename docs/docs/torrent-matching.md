# 种子季度匹配

启用后，新种子和匹配输入发生变化的种子会在后台匹配已录入季度。本阶段只记录结果，不触发下载，也不会自动重跑历史记录。未匹配到季度属于正常结果。季度资料变更后，受影响的新种子默认可能等待约 30 分钟（可配置），待资料稳定后再匹配。

种子列表的「季度」列会将识别成功的结果显示为季度链接；尚未识别时保留解析出的名称标签。将鼠标移到链接上，点击红色删除图标可取消关联。取消后恢复名称标签，后续自动匹配不会重新关联该种子。

## 配置与匹配服务

独立 API 默认关闭匹配，支持使用本机模型或外部大模型服务，API 镜像无需 Python。两个实现都使用 v2 协议，升级时需同步更新 API 与 matcher。

本机模型的成品镜像 tag 使用 `fp-<fingerprint>-<variant>`，fingerprint 可从对应提交的 `build-manifest.json` 中读取 `images.anime-matcher.fingerprint`。

| 变体后缀 | 默认行为 | 内置模型 |
| --- | --- | --- |
| `lexical` | 词法匹配，无神经推理依赖 | 无 |
| `semantic-cpu` | CPU、float32 | 固定版本 E5-base 和 Qwen3-Reranker-0.6B |
| `semantic-cu126` | CUDA、float32 | 同上 |

将下面 `<fingerprint>` 替换为所需版本：

```bash
docker run --rm -p 127.0.0.1:8090:8090 \
  ghcr.io/std4453/lani-anime-matcher:fp-<fingerprint>-semantic-cpu

# 需要宿主机 NVIDIA 驱动及已配置的容器 GPU 运行环境。
docker run --rm --gpus all -p 127.0.0.1:8090:8090 \
  ghcr.io/std4453/lani-anime-matcher:fp-<fingerprint>-semantic-cu126
```

语义镜像已含校验过的权重，运行时不会隐式下载。CPU 推理建议预留 8 GiB 内存。CUDA 镜像可添加 `--device cpu` 在无 GPU 机器运行，也可添加 `--no-semantic` 使用词法模式。显式选择 CUDA 而设备不可用会报错。

cu126 使用 PyTorch 2.14.1，支持 Pascal。CUDA 12.x 的 Linux 小版本兼容最低驱动要求为 525.60.13，但部分功能要求较新驱动，需验证实际硬件；驱动和 NVIDIA Container Toolkit 由宿主机独立管理，镜像不会升级驱动。Kubernetes 还需 GPU device plugin 和匹配的 RuntimeClass。

默认无需挂载模型。使用外部模型时显式添加 `-v /path/to/models:/external-models:ro` 和 `--model-dir /external-models`；该目录必须通过当前模型清单校验，且容器用户可读。HTTP 服务应留在内部网络；跨容器使用服务地址，`127.0.0.1` 仅适用于同一网络命名空间。

API 的 `config.yaml`：

```yaml
matching:
  enabled: true
  endpoint: http://127.0.0.1:8090
  timezone: Asia/Shanghai
  previousQuarters: 1 # 首轮包含前一公历季度，可设 0–8
  nextQuarters: 0 # 后几个公历季度，0–8
  catalogDebounceMs: 1800000 # 目录静默窗口，毫秒；默认 30 分钟，0 表示不额外等待
  timeoutMs: 120000 # 每次协议操作的超时，冷目录较大时可调高
```

修改 `catalogDebounceMs` 后重启 API，对随后检测到的目录变化生效；正在等待的窗口保留原截止时间。首次初始化不等待，目录检测仍每分钟执行一次。

API 只连接 HTTP worker；开启后必须提供 `endpoint`。设置 `enabled: false` 时停止接收和消费匹配任务，新种子保持未识别状态；已有关联仍可展示、取消。重新启用不会自动回填关闭期间新增的种子。模型模式与权重目录由 worker 的 `--semantic`、`--model-dir` 或 `LANI_MATCHER_MODEL_DIR` 配置。

## 外部大模型服务

外部 matcher 的镜像使用 `ghcr.io/std4453/lani-llm-matcher:fp-<fingerprint>`，对应 `images.llm-matcher.fingerprint`。在服务中配置兼容 Chat Completions 的端点、模型和密钥，再把 API 的 `matching.endpoint` 指向该服务；API 无需额外选择后端类型。供应商特定参数、并发和重试预算在外部 matcher 中配置。

该服务先处理近期候选，必要时在全部已录入季度中复核，因此可识别旧季补档。远端故障会保留为任务错误；正常未匹配与网络错误分别记录。作品声明集数和首播日期来自作品元数据同步，已有目录可重新同步作品资料补齐；单集同步不会改变这两个字段。

配置示例与参数见[外部 matcher README](https://github.com/std4453/lani/tree/next/libs/llm-matcher)。调用外部模型会产生供应商费用，并向配置的服务发送资源标题及候选作品名称。

## all-in-one

默认包含词法推理依赖与小型树模型，不安装 ONNX Runtime、不下载神经模型权重。容器独立运行本地 worker，API 默认连接 `http://127.0.0.1:8090`。`/config/config.yaml` 可设置 `matching.enabled: false` 关闭匹配，或配置外部 worker 的 `endpoint`；这两种情况下不启动内置 worker。

需要内置语义推理时，从源码构建。按常规构建流程准备 `common/deploy`，随后指定构建参数：

```bash
node common/scripts/install-run-rush.js install
NODE_OPTIONS=--openssl-legacy-provider node common/scripts/install-run-rush.js build --to @lani/all-in-one
node common/scripts/install-run-rush.js deploy --project @lani/all-in-one --overwrite
docker build --build-arg MATCHER_SEMANTIC=true \
  -f apps/all-in-one/Dockerfile -t lani-all-in-one:semantic .
```

`MATCHER_SEMANTIC` 只安装语义依赖，不下载模型。依赖下载慢时可通过构建参数 `PIP_INDEX_URL` 指定自己的 Python 包索引，默认使用 PyPI；Torch 使用 CPU 索引，可通过 `TORCH_INDEX_URL` 配置。运行容器时额外挂载已校验的权重目录，并为容器设置环境变量 `ANIME_MATCHER_MODE=semantic`、`LANI_MATCHER_MODEL_DIR=/models`。若使用独立 HTTP worker，则无需重建 all-in-one 语义镜像。
