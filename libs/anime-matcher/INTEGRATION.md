# 工程接入交接

本轮替换 worker 的内部模型与依赖，HTTP／JSONL 仍为 v1。工程侧继续维护 PostgreSQL 队列、目录内容版本、debounce、候选范围和结果落库；本包不引入权威状态或业务写操作。

## 与已接入 v1 的差异

- 端点、envelope、`status → configure → match`、目录原子替换和显式恢复规则不变。`seasonId` 仍只可能是请求候选中的 ID 或 null。
- 当前模型完全不读取逐集目录。`episodes` 只为输入兼容保留，工程侧可以省略，不应随每集元数据变化刷新目录。
- `query.publisherSeason?: number | null` 是发布者标题解析出的季数，非负整数；它与单集编号、目录公历季度分开。未知则省略，不能从匹配真值推断。
- `catalog[].declaredEpisodeCount?: number | null` 是可选作品级静态总集数，正整数；默认交付的两种模型都不使用它，暂不必为此修改目录生成或刷新策略。
- `year` 接受 1–9999 或 null，`quarter` 接受公历 1–4 或 null；`episode` 提供时必须非负且有限。原有合法输入无需改动。
- 诊断 `reason` 使用 `static_lexical`／`static_semantic`／`low_confidence`／`no_candidates`。业务逻辑只应依据 `seasonId` 处理正常拒答，不依赖诊断字符串。
- `modelVersion` 改为 `matcher-static-v1-…`，绑定代码、树、预训练模型清单、依赖版本及推理设备／精度。同一个目录版本可以配合新的模型版本；业务端按自身版本策略决定是否重评。

直接调用旧 Python `Matcher` 的用户需要迁移：目录采用同一 v1 结构，明确提供 `title`、`aliases`、`year`、`quarter`，未知季度填 null；`match` 必须显式传 `candidate_ids`，省略不再表示整个目录。查询季数使用 `publisherSeason`，不再接收内部 `season` 名称作为公共合同。旧逐集权重与 `weights_dir` 选项移除，显式替换模型需使用绑定权重 SHA 和特征合同的 `profile_path`。这不改变已经接入 v1 HTTP／JSONL 的调用流程。

本 PR 不修改 `parse-torrent-title` 或业务适配层。已有单集 `episodeInfo.index` 仍映射到 `query.episode`；只有现有解析结果提供明确季数时才传 `publisherSeason`，否则省略。报告使用评测输入中已有的明确季数；线上若省略该信号，不能直接把报告数值当作该输入配置的实测结果。范围／合集不属于本轮已验证的运行口径，不能把范围对象传给数字字段；模型不输出剧集 offset。

数据库 `yearAndSemester` 的 01/02/03/04 表示春／夏／秋／同年冬，对应公历季度 2/3/4/1。`yearAndSemesterCanonical` 仅用于排序，不能代替原字段。运行 worker 不连接数据库来转换，调用方应传入公历季度。

## 部署选项

纯标题模式只需 Python 基础依赖和内置小树，默认不开启语义。语义模式需要 E5-base 与 Qwen3-Reranker-0.6B，旧版 E5-small／后备 reranker 权重不再使用；请显式执行新下载器与 `--verify-only`，不要复用旧模型目录的成功状态作为校验结果。

Python 支持 3.11–3.12。语义依赖新增 Torch／Transformers；CPU 镜像应先从 Torch CPU 索引安装 2.14.1+cpu，再安装 `.[semantic]`，避免默认额外下载 CUDA 库。本包 Dockerfile 已处理；如果工程镜像自行 `pip install '.[semantic]'`，应同步此选择。神经权重约 1.40 GiB，成品语义镜像内置，不写入 Git 或 npm 包。具体变体及设备兼容见 [IMAGES.md](IMAGES.md)。

HTTP worker 使用启动参数 `--device`、`--dtype`、`--model-dir`，默认 CPU FP32；Node 的 `device`／`dtype`／`profile` 选项仅控制本地 JSONL 子进程。HTTP 客户端不能切换远端配置。CPU 语义进程建议先预留 8 GiB 内存；GPU BF16 需要原生支持且应回归，不自动切换后端。目录刷新复用语义模型；状态查询不加载模型。

新模型的效果来自现有开发集交叉拟合，Nyaa 标题组等权仍低于 99%，不能作为自动下载的无误保证。完整指标与运行后端差异见 [README](README.md) 和 [最终报告](REPORT.md)。本轮仅更新匹配包 PR，没有部署或修改正式业务状态。
