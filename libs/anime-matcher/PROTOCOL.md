# 季度匹配接入协议

worker 只保存可丢弃的全目录索引，不访问数据库、不管理任务、不自行筛选季度、不持久化请求历史。每个实例服务一个目录发布者。目录事实、激活版本、待更新快照、debounce、候选计算与队列恢复由调用方负责。

## v2：可替换匹配器接口

业务侧通过同一协议使用本包或其他兼容匹配器。HTTP 提供 `GET /v2/status`、`PUT /v2/catalog` 和 `POST /v2/match`；JSONL 沿用下文的 envelope，在每次请求中传 `protocolVersion: 2`。HTTP 请求正文版本必须与路径一致。

npm 客户端导出 `MatchQueryV2`、`WorkerStatusV2`、`ConfigureRequestV2`、`MatchRequestV2` 和 `MatchResponseV2`；使用 `status(2)`，`configure()` 和 `match()` 根据请求版本选择协议。`status()` 默认 v1，保留既有调用行为。

目录上传结构为 `{ protocolVersion: 2, catalogVersion, catalog }`。目录条目沿用下文的 ID、标题、别名、年、季度与可选静态总集数字段，并允许 `premiereDate?: string | null` 表示 `YYYY-MM-DD` 首播日期。v2 无需逐集 `episodes`。本包模型忽略 `premiereDate` 和 `episodes`；它们不会进入本包推理输入。

```json
{
  "protocolVersion": 2,
  "requestId": "torrent:123:input-version",
  "catalogVersion": "caller-owned-content-version",
  "query": {
    "rawTitle": "[发布组] 示例动画 - 01.5",
    "aliases": ["示例动画"],
    "publishedAt": "2026-10-21T12:00:00+08:00",
    "episode": 1.5,
    "publisherSeason": null
  },
  "primaryCandidateIds": ["season-1"],
  "fallbackCandidateIds": ["season-1", "season-2"]
}
```

`rawTitle` 是必填字符串，最长 2048 个 Unicode 字符；API 发送未经解析的资源标题，超长时仅截取传输值，数据库保留原文。其余查询字段沿用 v1 校验。两个候选列表均须显式提供、ID 不重复；`primaryCandidateIds` 必须是目录子集，`fallbackCandidateIds` 必须与完整目录 ID 集合相等，顺序不限。后者明确授权匹配器在主要候选不足时使用全目录，具体调用策略属于匹配器。本包仅使用主要候选，主要候选为空时仍拒答，不尝试后备匹配；本包忽略 `rawTitle`，保留已有模型行为。

状态与目录成功响应为 `{ protocolVersion: 2, catalogVersion, modelVersion, mode }`，`mode` 是实现提供的非空字符串；本包仍返回 `lexical` 或 `semantic`。匹配成功响应在此基础上增加 `requestId`、`result` 和 `decision: { stage: 'primary' | 'fallback' }`。`result` 沿用 v1 结构；所选 `seasonId` 必须属于声明阶段的候选列表。拒答也必须返回实际决策阶段。本包始终返回 `stage: 'primary'`。客户端检查协议版本、请求关联、目录版本、阶段及对应候选范围，不解释实现专有的 `mode` 或诊断分数。

目录缓存、原子替换、请求大小和错误恢复规则与 v1 相同。HTTP 错误 envelope 的 `protocolVersion` 对应请求路径；JSONL 错误仍使用统一 envelope。两版接口共用当前进程的目录缓存，版本内容仍由唯一目录发布者保证一致。

## v1 类型与端点

npm 导出 `CatalogSeason`、`MatchQuery`、`WorkerStatus`、`ConfigureRequest`、`MatchRequest`、`MatchResponse`、`AnimeMatcherClient` 和 `AnimeMatcherError`。客户端方法与传输一一对应：

| 客户端 | HTTP | JSONL method |
| --- | --- | --- |
| `status()` | `GET /v1/status` | `status` |
| `configure(payload)` | `PUT /v1/catalog` | `configure` |
| `match(payload)` | `POST /v1/match` | `match` |

目录条目为 `{ id, title, aliases, year, quarter, declaredEpisodeCount?, episodes? }`。ID 是不透明字符串；`year` 为 1 至 9999 的整数或 null，`quarter` 为公历 1/2/3/4 或 null。`declaredEpisodeCount` 是可选的作品级静态总集数，取正整数或 null；不得根据当前已同步剧集数填充，也不要求随每集更新目录。适配层将 `title` 和 `aliases` 合并去重并忽略空字符串，完整保留其他字符串的季数、分部和副标题，不补造逐集日期或推断集数 offset。未知可选字段忽略。

查询另支持可选的 `publisherSeason`，取非负整数或 null，表示发布者标题中解析出的季数；它与 `episode`、公历季度分别传入，不互相替代。省略或 null 均表示未知。HTTP 与 JSONL 共用字段；旧调用方可继续省略，旧接收方按 v1 约定忽略未知可选字段。

`episodes` 仅保留 v1 输入兼容，类型为 `{number, airDate}[]`，编号允许小数，日期必须带时区。**当前静态模型不读取该字段，调用方应省略，也无需随每集更新目录。** 运行模型联合使用标题、发布时间、解析编号和静态季度；默认小语义配置不使用总集数，其他显式模型配置可以使用静态 `declaredEpisodeCount`。这些信号不改变调用方的 `candidateIds`，也不引入硬性时间窗口。

`configure` 接收 `{ protocolVersion: 1, catalogVersion, catalog }`。目录版本由调用方计算并保存，worker 不实现跨语言内容规范化；相同版本应代表相同内容。完整索引构建成功后才替换旧缓存，失败保留旧版本；相同版本再次上传不会重建。

`status` 和 `configure` 成功响应均为 `{ protocolVersion: 1, catalogVersion: string | null, modelVersion: string, mode: 'lexical' | 'semantic' }`。未加载目录时状态查询正常返回 null，不加载数值库／神经模型。`modelVersion` 包含模式、适配／推理代码、固定模型清单／树权重、设备与精度配置及相关依赖版本；相同环境跨进程重启稳定。目录刷新复用已经加载的语义模型及可丢弃的标题缓存。

`match` 接收：

```json
{
  "protocolVersion": 1,
  "requestId": "torrent:123:input-version",
  "catalogVersion": "caller-owned-content-version",
  "query": { "aliases": ["示例动画"], "publishedAt": "2026-10-21T12:00:00+08:00", "episode": 1.5 },
  "candidateIds": ["season-1"]
}
```

`publishedAt` 必填并带时区；`episode` 可省略，提供时必须是非负有限数字，允许普通小数编号。查询 aliases 中的空字符串忽略。`candidateIds` 必填；空数组合法并返回拒答，缺失不回退到全目录，不存在或重复的候选 ID 报错。目录全量用于索引，但输出不能越过单次候选范围。

成功响应包含实际使用的版本及关联 ID：

```json
{
  "protocolVersion": 1,
  "requestId": "torrent:123:input-version",
  "catalogVersion": "caller-owned-content-version",
  "modelVersion": "matcher-static-v1-lexical-content-digest",
  "mode": "lexical",
  "result": { "seasonId": "season-1", "reason": "static_lexical", "score": 0.99 }
}
```

`seasonId: null` 是正常拒答（HTTP 200）。`reason`、`score` 仅用于诊断，可省略或 null；树分数没有通过 99% 精度校准，不能把 0.99 解读为 99% 正确率。requestId 只用于关联，重复提交会重新推理；幂等落库由工程侧负责。

## 错误与恢复

HTTP 错误响应为 `{ protocolVersion, error: { code, message } }`：

| HTTP | code | 行为 |
| --- | --- | --- |
| 400 | `INVALID_REQUEST` | 参数／候选无效、正文格式错误或超过 16 MiB |
| 409 | `CATALOG_MISSING` | 缓存丢失，显式恢复目录后再消费 |
| 409 | `CATALOG_MISMATCH` | 版本不同，不能静默使用当前目录 |
| 422 | `PROTOCOL_UNSUPPORTED` | 不支持请求中的协议版本 |
| 500 | `INTERNAL_ERROR` | 构建／推理内部故障；不泄露 traceback 或输入 |

错误时不返回虚构的匹配版本，成功响应才报告实际版本；可通过 status 核对。客户端额外用 `UNAVAILABLE` 表示传输／子进程故障，`TIMEOUT` 表示超时，`INVALID_RESPONSE` 表示响应结构或关联信息不符，`MODE_MISMATCH` 表示配置模式不符。HTTP 错误保留 `AnimeMatcherError.status`，JSONL 不携带 HTTP 状态码。

客户端不自动重试、重建目录或重放匹配。子进程退出后 `match()` 直接失败；后续显式调用 `status()` 或 `configure()` 可启动新进程。HTTP 操作超时可能发生在目录已激活但回复未送达时，恢复先查 status，再决定是否重传。调用方负责暂停队列、保存错误和显式恢复；本库没有任务级重试。

## JSONL 与资源边界

每行请求 `{ id: number, method: 'status' | 'configure' | 'match', ...payload }`，成功响应 `{ id, result: <HTTP 成功响应> }`，错误 `{ id, error: { code, message } }`。`id` 为 JS 安全整数；无法解析或没有有效 ID 时响应 `id: null`。`status` 可只传 id/method，此时返回 v1；若提供 protocolVersion 则校验并返回对应版本。其他方法必须提供 protocolVersion，当前支持 1 和 2。

UTF-8 编码，stdin/stdout 仅用于协议，日志写 stderr。每个 worker 顺序执行；请求／响应上限 16 MiB，JSONL 包含 envelope 和换行。HTTP 写请求需 Content-Length，不接受 chunked。客户端默认绝对超时 120 秒，可配置；HTTP socket 读写超时 30 秒。HTTP 客户端超时不保证取消已经开始的计算；业务侧不得据此推断目录一定未激活。实例只面向内部服务网络。

实现沿用模型输入上限：目录 10000 季、每季合并后最多 256 个名称、每季 10000 条剧集；查询最多 32 个名称，单个名称 2048 字符；季度 ID 最多 200 字符、catalogVersion 最多 256 字符、requestId 最多 2048 字符。调用方版本作为不透明字符串处理，不限定必须是十六进制，但业务约定使用 SHA-256。

语义 reranker 对完整标题对的提示上限为 2048 tokens；超过时返回故障，绝不静默截断标题。纯词法模式不加载神经依赖。HTTP worker 的设备／精度由服务端启动参数 `--device cpu|cuda`、`--dtype float32|bfloat16|float16` 决定，默认 CPU FP32；仅使用实际验证过的部署配置。JSONL 客户端可通过同名 `device`、`dtype` 选项传入，`profile` 可指定显式静态模型清单。HTTP 客户端的这些本地子进程选项不改变服务器配置。

## 从原型接口迁移

移除原型 `/health`、`/match` 和自动 configure 行为；客户端构造函数不再接收 catalog。改为 status → 显式 configure → match，match 的参数和返回值均为完整 v1 envelope。旧的 `Season`／`Query` 类型改为 `CatalogSeason`／`MatchQuery`。工程接入以此 HTTP／JSONL 契约为准。

本轮替换为静态季度特征及全开发集拟合的树权重；效果报告使用家族隔离评测，不使用最终树的训练内成绩。工程侧季度范围和数据库标题来源改变后，应另做效果评测；历史日期窗口只是一种 benchmark 候选规范，不能当成 v1 线上限制或准确率承诺。
