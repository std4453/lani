# 外部大模型季度匹配

lani 可在 API 进程内通过兼容 Chat Completions 的接口匹配资源所属季度。匹配器只接收调用方提供的完整目录快照、近期候选和标题，不读取业务数据库，不处理下载或定位单集。目录版本、刷新节流、候选计算、队列及结果落库继续由原匹配模块负责；独立 anime-matcher 与内置实现共用同一后端接口。

## 配置与运行边界

选择 `matching.backend: llm` 后，`matching.llm` 配置供应商、模型和匹配策略。所有外部模型调用经过共用的 `LlmService`：顶层 `llm.concurrency` 默认 2，`llm.timeoutMs` 默认 45000；匹配器不另建并发池。一个匹配操作默认最多 100000 ms，包含公共限流器中的排队、退避及两个阶段；达到截止时间会中止剩余调用。

```yaml
llm:
  concurrency: 2
  timeoutMs: 45000
matching:
  enabled: true
  backend: llm
  llm:
    apiBase: https://your-provider.example/v1
    apiKey: <通过部署配置注入>
    model: your-model
    deadlineMs: 100000
    fallbackEnabled: true
    firstParameters: {}
    reviewParameters: {}
```

`apiBase` 是供应商 API 基础地址，由 SDK 拼接 Chat Completions 路径。项目不默认选择供应商。DeepSeek 官方路由可使用 `apiBase: https://api.deepseek.com`、`model: deepseek-flash`，首轮参数设为 `thinking: { type: disabled }`，复核参数设为 `thinking: { type: enabled }` 与 `reasoning_effort: high`。模型名及扩展参数以供应商合同为准，凭据不写入公开配置或日志。

首轮默认 `temperature=0,max_tokens=128`，复核默认 `max_tokens=8192`。两阶段固定 `stream=false,response_format={type: json_object}`，扩展参数不能覆盖模型、消息或这些固定项。关闭 `fallbackEnabled` 可用于首轮对照。保留独立匹配器时选择 `matching.backend: external` 并配置其 `endpoint`；all-in-one 默认仍使用原 anime-matcher。

## 两阶段判断

首轮只给模型近期候选的 ID、完整名称、年份与季度。正常匹配直接返回；拒答、可重试技术故障，或明确季数与编号之间存在冲突时，使用完整目录独立复核。复核增加作品元数据声明的总集数及首播日期，不接收首轮答案。空近期候选直接复核，空完整目录返回正常拒答且不产生付费调用。

两阶段提示词位于 [prompts](../src/torrent-match/llm/prompts)，保持研究版内容和目录顺序。相同首轮投影不因辅助元数据变化而改变提示词；实际前缀缓存和计费由供应商决定。声明集数与首播日期必须来自作品级元数据，不能根据已同步剧集数或最早单集日期推算。迁移不会猜测回填这些字段。

严格接受正常结束的 `{"s":"候选ID"}` 或 `{"s":null}`；额外字段、重复键、目录外 ID、截断及字符串 `"null"` 都属于格式错误。编号超过声明集数本身不会硬拒绝；只有同时存在发布者季数或原标题显式季数时才触发复核。返回仅为季度 ID 或拒答，不给出精确剧集、offset 或校准置信度。

每阶段最多重试一次连接、429、5xx 或格式错误，完整匹配最多四次实际调用；有效拒答不作技术重试，鉴权等不可重试错误直接失败。最终技术故障保留为失败，不能伪装成拒答。业务队列不再额外自动重试放大次数。

## 观测与验证

Nest 日志记录 `llm_prompt` 提示词摘要、`llm_attempt` 阶段/次数/耗时及供应商返回的 token 和缓存用量，失败记录安全的错误详情。响应 `diagnostics` 保存用量与耗时，没有提供的计量字段保持缺失。密钥、原始提示词、模型解释和思考正文不进入日志；未知异常保留脱敏后的栈或原因，向调用方返回通用失败。

模型版本根据固定提示词和非凭据配置生成；远端模型别名可能更换权重，因此不能由该版本证明供应商权重不变。账单余额和最终扣款仍需从供应商核验。

在 `apps/api-server` 执行：

```bash
node ../../common/scripts/install-run-rushx.js test --runInBand src/torrent-match/llm/llm-matcher.spec.ts
```

回归使用合成目录和替代 `LlmService`，覆盖原提示词、两阶段、重试上限、总期限、取消、快照替换及严格结果校验，无付费调用。共用 SDK 传输和限流由 `LlmService` 的独立测试覆盖。

## 既有研究与验收

2026-10-29 的研究使用脱敏季度目录和既有标题回归集，补充 Nyaa 发布标题。目录共 879 个作品季度；默认首轮近期窗口、全目录 high 复核方案在 A 回归集正确 899/900（99.889%），B 回归集 191/191，新增 Nyaa 样本 19/19，困难开发集 115/116（99.138%）。A/B 曾用于前轮研究，困难集参与过提示词开发；这些是回归结果，不能视为独立盲测或线上准确率保证。

同日部署验收在隔离测试环境的 29 季目录下，冻结 2026-10-25 至 2026-10-27 的最近 400 条资源：379 条可明确判定样本全部正确（377 条目录外拒答、2 条命中），21 条重复目录或分部信息不足的样本单列。另经标题筛选的 22 条补充正例全部命中；它们不用于估计总体召回率。两次最终超时保留为任务失败，经人工定向恢复后共 422 条完成。此验收基于先前 Python 运行版；独立 Node 版及当前内置版迁移保留相同提示词和判断流程，以各自回归测试核验，历史实测不代表迁移版本已经重新进行真实模型验收。
