# 镜像发布与验证

## 产物身份

独立 matcher 发布 `lexical`、`semantic-cpu`、`semantic-cu126` 三个 linux/amd64 成品；两个语义变体内置固定权重。tag 为 `fp-<fingerprint>-<variant>`，不另建语义版本号。构建 manifest 新增 `images.anime-matcher`；包内 Dockerfile、依赖、模型 revision/SHA256 清单、许可和应用代码均参与 fingerprint。三个变体共享源码 fingerprint，复用查询按 fingerprint 与 variant 分别执行。

主流水线并行构建缺失变体，全部应用与变体成功后才通知部署。OCI labels 包含 `dev.lani.fingerprint`、`dev.lani.variant`、`dev.lani.bundled-models`、构建源码 SHA 和 run/attempt。部署方必须读取目标源码的 manifest，解析带后缀 tag 后校验这些身份，再保存不可变 digest；改变变体即使没有改变源码，也必须更新工作负载。

## 分层与源码构建

基础层为 Python 3.11 / Debian Bookworm；先根据 pyproject 安装固定直接依赖。语义层先从指定 CPU/cu126 索引安装 `torch==2.14.1+cpu` 或 `torch==2.14.1+cu126`，然后通过约束安装其他语义依赖，断言版本及 CUDA 构建，防止 resolver 替换 Torch。应用层使用 `--no-deps` 安装并执行 `pip check`。Transformers 保持 4.57.6。

独立下载阶段只复制下载器与模型清单，下载并校验固定 revision/SHA256；模型 COPY 位于最终镜像的最后一层。业务代码变化可复用模型下载缓存与稳定依赖层，三种构建分别使用 BuildKit cache。模型默认路径 `/opt/lani/models`；不应在部署模板中默认挂载覆盖它。运行时启用离线环境变量，模型加载仍使用本地文件校验。

```bash
# 在仓库根目录运行；发布流水线对两个语义变体设置 WITH_MODELS=true。
docker build --build-arg VARIANT=semantic-cu126 --build-arg WITH_MODELS=true \
  -t lani-anime-matcher:local libs/anime-matcher
# 源码特殊部署可不内置权重，运行时显式提供经过校验的模型目录。
docker build --build-arg VARIANT=semantic-cpu --build-arg WITH_MODELS=false \
  -t lani-anime-matcher:external-models libs/anime-matcher
```

默认构建仍是 lexical。all-in-one 默认行为独立保持词法轻量方案，其 `MATCHER_SEMANTIC=true` 仅用于源码构建，不增加独立 matcher 的发布组合。

## 设备兼容

`semantic-cu126` 默认 CUDA + float32，`--device cpu` 可以无 GPU 运行，`--no-semantic` 可以切换词法。显式 CUDA 不可用时在服务监听前失败，不降级。当前 E5 仍由 CPU ONNX Runtime 执行，CUDA 用于 Qwen reranker。模型分数受 Torch、设备及数值实现影响；modelVersion 包含依赖版本、device 和 dtype。升级不重训树、不调整阈值，也不自动回填业务结果。

核对依据（2026-10-23）：[PyTorch CUDA 支持矩阵](https://github.com/pytorch/pytorch/blob/main/RELEASE.md)、[官方 cu126 wheel 索引](https://download.pytorch.org/whl/cu126/torch/)、[NVIDIA 小版本兼容](https://docs.nvidia.com/deploy/cuda-compatibility/minor-version-compatibility.html)。PyTorch 2.14.1 的 cu126 包仍包含 Pascal；CUDA 12.x 小版本兼容不保证所有 PTX/JIT 或新功能在旧驱动上可用，必须实际推理验证。宿主驱动、容器 GPU runtime 和 Kubernetes device plugin 独立维护。

## 验证

单元测试覆盖默认模式、CLI 覆盖、显式 CUDA 不可用失败；发布规划测试覆盖按变体复用。容器验证需在断网环境检查三种默认值、包版本、模型 SHA256、CUDA 镜像 CPU 推理及关闭语义；有 GPU 的环境还需验证实际推理并与旧组合对照，记录耗时、分数和最终决策差异。大小应同时报告压缩传输体积与本地解包体积，部署端应为归档、内容存储和解包预留空间。

第三方模型和运行依赖再分发说明见 [NOTICE.md](NOTICE.md) 及 `licenses/`。
