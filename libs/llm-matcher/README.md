# 外部大模型季度匹配器

通过兼容 Chat Completions 的外部接口，将种子标题匹配到精确的作品季度或分部。首轮判断近期候选，拒答、技术失败或显式季数与编号冲突时，在调用方提供的完整目录内独立复核。它与 [anime-matcher](../anime-matcher/PROTOCOL.md) 共用 v2 HTTP／JSONL 接口，可直接替换 API 的 `matching.endpoint`。

API 保存权威目录、计算候选并负责队列和结果；本服务只缓存已发布目录，不连接业务数据库、不自动读取额外作品、不处理下载或定位单集。all-in-one 继续打包本机 anime-matcher。

## 运行

需要 Python 3.11 或以上，无第三方运行依赖。模型和端点必须显式提供：

```bash
export LLM_ENDPOINT=https://your-provider.example/v1/chat/completions
export LLM_MODEL=your-model
# 用部署环境的 Secret 注入 LLM_API_KEY，避免写入 shell 历史。
python -m lani_llm_matcher.worker --http --host 0.0.0.0 --port 8090
```

从本目录运行；省略 `--http` 使用 stdin/stdout JSONL。容器构建为 `docker build -t lani-llm-matcher .`，容器默认以非 root 用户监听 8090。接口仅提供给内部服务网络。

| 环境变量 | 默认值 | 用途 |
| --- | --- | --- |
| `LLM_ENDPOINT` | 必填 | 完整 Chat Completions URL |
| `LLM_MODEL` | 必填 | 供应商模型名称 |
| `LLM_API_KEY` | 必填 | Bearer 密钥 |
| `LLM_CONCURRENCY` | `2` | 同时处理的两阶段请求数 |
| `LLM_DEADLINE_SECONDS` | `100` | 含并发等待、重试及两个阶段的总期限 |
| `LLM_ATTEMPT_SECONDS` | `45` | 单次外部调用期限，不得超过总期限 |
| `LLM_FALLBACK_ENABLED` | `true` | 允许全目录复核；关闭用于首轮对照 |
| `LLM_FIRST_PARAMETERS` | `{}` | 合并到首轮请求的 JSON 参数 |
| `LLM_REVIEW_PARAMETERS` | `{}` | 合并到复核请求的 JSON 参数 |

首轮默认 `temperature=0,max_tokens=128`，复核默认 `max_tokens=8192`；两阶段固定 `stream=false,response_format={"type":"json_object"}`。供应商必须支持这两项及 JSON 返回；阶段扩展参数不能覆盖模型、消息、stream 或 response_format。API 超时应大于服务总期限，并为网络传输留出余量。

例如 DeepSeek 官方兼容端点可设置：

```bash
export LLM_ENDPOINT=https://api.deepseek.com/chat/completions
export LLM_MODEL=deepseek-flash
export LLM_FIRST_PARAMETERS='{"thinking":{"type":"disabled"}}'
export LLM_REVIEW_PARAMETERS='{"thinking":{"type":"enabled"},"reasoning_effort":"high"}'
```

模型名和扩展参数以供应商合同为准；本包不默认选择供应商。远端模型别名可能更换权重，`modelVersion` 标识本服务代码、提示词和有效配置，不保证远端模型不可变。

## 协议与数据

`GET /v2/status` 查询状态；`PUT /v2/catalog` 原子发布目录；`POST /v2/match` 匹配。JSONL 使用相同 payload，另加安全整数 `id` 和 `method`。公共字段、错误和客户端见 [v2 协议](../anime-matcher/PROTOCOL.md)。本服务只接受 v2；旧版客户端需升级。

每次请求提供 `primaryCandidateIds` 和覆盖整份目录的 `fallbackCandidateIds`，前者必须是后者的子集。正常结果包含 `decision.stage`，调用方按实际阶段验证候选归属。空首轮直接复核，空目录返回正常 null。只返回季度 ID，无精确剧集、offset 或校准置信度。

`rawTitle` 必须是完整原标题，`publishedAt` 是资源发布时间，不能使用重跑时间。`declaredEpisodeCount` 与 `premiereDate` 必须来自独立作品元数据；未知为 null，不能用已同步集数或最早单集日期推算。API 的 Bangumi 元数据同步保存这些字段；已有作品需重新同步作品元数据才能补齐，迁移不会猜测回填。逐集同步不改变目录投影。

首轮提示词只包含 ID、完整名称、年份与季度；复核增加声明集数与开播日期。原始查询放在最后一条 user 消息。两阶段分别计算提示词摘要，相同首轮投影不因其他季度或辅助元数据变化而失去前缀缓存机会；实际缓存能力与计费由供应商决定。

## 失败与观测

每阶段最多重试一次连接、429、5xx 或格式错误；鉴权、配置及其他不可重试 HTTP 错误立即返回。复核最终故障返回 502／504，不会伪装成 null。有效拒答不重试；正常上限为两次逻辑判断、四次物理调用。API／队列不得另加自动重试来放大调用次数。

严格接受正常结束的 `{"s":"候选ID"}` 或 `{"s":null}`，额外字段、重复键、目录外 ID、截断及字符串 `"null"` 都是格式错误。编号超过声明集数本身不会硬拒绝；同时有发布者季数或显式季数标记时才触发复核。复核不接收首轮答案。

stderr 输出结构化 `llm_attempt` 事件，记录关联 ID、阶段、尝试序号、耗时、实际模型和供应商返回的 token／缓存使用量。响应 `diagnostics` 保存相同用量和提示词摘要供业务验收；没有提供的计量字段保持缺失，不估作零。不记录密钥、原始提示词、模型解释或思考正文。账单余额与价格应从供应商核对，token 使用量不能直接当作最终扣款。

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
```

测试使用合成目录和本机 HTTP，无付费调用。覆盖两阶段路由、故障与重试、范围校验、原子目录和缓存投影；实际模型准确率需在冻结样本或部署验收中单独核验。
