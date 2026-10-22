# 种子季度匹配

启用后，新种子和匹配输入发生变化的种子会在后台匹配已录入季度。本阶段只记录结果，不触发下载，也不会自动重跑历史记录。未匹配到季度属于正常结果。季度资料变更后，受影响的新种子可能等待约 30 分钟，待资料稳定后再匹配。

种子列表的「季度」列会将识别成功的结果显示为季度链接；尚未识别时保留解析出的名称标签。将鼠标移到链接上，点击红色删除图标可取消关联。取消后显示「用户主动取消关联」，后续自动匹配不会重新关联该种子。

## 配置与本机语义服务

独立 API 默认关闭匹配；本机部署建议使用独立语义 worker，API 镜像无需 Python。先使用已适配 v1 的源码构建 worker，并按匹配器说明显式下载、校验权重，以下命令在仓库根目录执行：

```bash
docker build --build-arg SEMANTIC=true -t lani-anime-matcher:semantic libs/anime-matcher
docker run --rm -p 127.0.0.1:8090:8090 \
  -v "$PWD/models:/models:ro" lani-anime-matcher:semantic --semantic
```

语义模式使用 E5-base 与 Qwen3-Reranker-0.6B，权重约 1.40 GiB；CPU FP32 建议为 worker 预留 8 GiB 内存。按[模型下载说明](../../libs/anime-matcher/README.md)准备并校验权重，旧模型目录的校验结果不能代替新版校验。

这里 `models` 是维护者准备的权重目录；worker 以非 root 用户读取它。容器间调用时使用服务网络地址，`127.0.0.1` 只适用于同一网络命名空间。worker API 应留在内部服务网络，实际环境部署由维护者配置。

API 的 `config.yaml`：

```yaml
matching:
  enabled: true
  endpoint: http://127.0.0.1:8090
  timezone: Asia/Shanghai
  previousQuarters: 0 # 前几个公历季度，0–8
  nextQuarters: 0 # 后几个公历季度，0–8
  timeoutMs: 120000 # 每次协议操作的超时，冷目录较大时可调高
```

API 只连接 HTTP worker；开启后必须提供 `endpoint`。设置 `enabled: false` 关闭匹配，重新启用不会回填关闭期间新增的种子。模型模式与权重目录由 worker 的 `--semantic`、`--model-dir` 或 `LANI_MATCHER_MODEL_DIR` 配置。

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
