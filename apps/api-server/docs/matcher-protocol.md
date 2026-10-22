# 季度匹配通信协议 v1

本协议定义 API 与匹配 worker 的边界；词法／语义模型共用接口，不要求重新训练。API 管理数据库、候选范围、目录更新与任务队列；worker 只执行推理。协议中的季度 ID 是不透明字符串。

## 状态归属与重启

API 数据库保存目录事实、已激活快照、待更新快照、30 分钟 debounce 截止时间及任务状态。worker 的索引与向量只是可丢弃的派生缓存；无需数据库连接、任务队列或持久化目录。worker 可以实现磁盘缓存加速重启，但缓存丢失不影响正确性。

一个 worker 实例服务一个目录发布者。v1 不要求负载均衡、多副本或缓存亲和性。目录采用 API 提供的内容版本；同版本表示相同规范化内容。worker 只有成功构建完整索引后才能原子替换当前目录，失败保留旧目录。所有响应报告实际使用的版本，不能把未知版本悄悄当成当前目录。

API 每分钟检测实际匹配字段的变化，连续 30 分钟无变化再上传；初次初始化立即上传。重启不重新计时。目录待生效且影响队头种子的候选范围时，FIFO 暂停，目录成功激活后继续。目录更新独立于匹配队列。已经完成的匹配或拒答不因目录更新自动重跑。

## 数据结构

```typescript
interface CatalogSeason {
  id: string;
  title: string;
  aliases: string[];
  year: number | null;
  quarter: 1 | 2 | 3 | 4 | null; // 公历季度，不是 Lani 旧 semester 编码
  episodes?: { number: number; airDate: string }[];
}
interface MatchQuery {
  aliases: string[];
  publishedAt: string; // 带时区的 ISO 8601
  publisherSeason?: number | null; // 可选的发布者季数；当前工程输入缺失时省略
  episode?: number; // 实际单集编号，保留小数；不推断 offset
}
interface WorkerStatus {
  protocolVersion: 1;
  catalogVersion: string | null;
  modelVersion: string;
  mode: "lexical" | "semantic";
}
```

输入使用数据库中的标题、别名和可用元数据，不限制来源。缺失日期不补造，未知季度用 null。`episodes` 为兼容字段；当前静态模型不使用，工程侧不发送，也不因逐集日期变化重建目录。时间与集数如何组合属于模型实现。新增可选字段不应要求业务端重训模型，接收方忽略不认识的可选字段。

API 按种子发布时间对应的公历年／季度筛选已录入季度，可配置相邻季度及业务时区，不按逐集日期或 [-45,+15] 天过滤。worker 必须严格使用 `candidateIds`；空数组是合法的无候选，不能回退到全目录。目录全量传入，以便模型构建全局索引；候选筛选只作用于单次请求。

## HTTP

所有端点使用 JSON、UTF-8、内部网络。请求及响应上限 16 MiB，单次操作有超时；客户端不自动重试失败请求。

### GET /v1/status

返回 `WorkerStatus`。目录尚未加载时 `catalogVersion: null`，仍应正常回答；就绪查询不能隐式构建目录。`modelVersion` 是模型／推理策略的稳定标识，不是每次启动生成的随机值。

### PUT /v1/catalog

请求：`{ protocolVersion: 1, catalogVersion: string, catalog: CatalogSeason[] }`。

成功返回新的 `WorkerStatus`。API 使用规范化快照的 SHA-256 十六进制摘要作为 `catalogVersion`；worker 将它视为调用方版本，不重新实现跨语言规范化算法。同版本重传需幂等复用。`title` 与 `aliases` 均可用于模型；模型适配层应合并去重，不要求调用方伪造别名。

### POST /v1/match

请求：

```json
{
  "protocolVersion": 1,
  "requestId": "torrent:123:input-version",
  "catalogVersion": "64-character-sha256",
  "query": {
    "aliases": ["示例动画"],
    "publishedAt": "2026-10-21T12:00:00+08:00",
    "episode": 3
  },
  "candidateIds": ["season-1"]
}
```

成功响应：

```json
{
  "protocolVersion": 1,
  "requestId": "torrent:123:input-version",
  "catalogVersion": "64-character-sha256",
  "modelVersion": "matcher-v1-lexical",
  "mode": "lexical",
  "result": { "seasonId": "season-1", "reason": "lexical", "score": 0.99 }
}
```

`result.seasonId` 只能是请求候选之一或 null。null 是正常拒答，HTTP 200、任务完成，无需业务判断合理性；`reason` 和 `score` 可省略或为 null，仅作诊断，分数不是概率。请求 ID 只用于关联与幂等落库，不要求 worker 保存请求历史。

### 错误

响应格式：`{ protocolVersion: 1, error: { code: string, message: string } }`。

| HTTP      | code                         | 含义                       |
| --------- | ---------------------------- | -------------------------- |
| 400       | INVALID_REQUEST              | 参数、候选 ID 或输入无效   |
| 409       | CATALOG_MISSING              | 缓存为空，API 应先恢复目录 |
| 409       | CATALOG_MISMATCH             | 请求版本与当前目录不同     |
| 422       | PROTOCOL_UNSUPPORTED         | 不支持此协议版本           |
| 500 / 503 | INTERNAL_ERROR / UNAVAILABLE | worker 故障                |

API 启动或消费前通过 status 对齐目录；缓存丢失时可执行一次明确的目录同步。失败不进入任务级自动重试；暂停队列并保存错误，由显式恢复操作继续。目录缓存缺失不是业务拒答。

## JSONL 子进程

与 HTTP 共用全部 payload／响应结构。每行请求为 `{ id: number, method: 'status' | 'configure' | 'match', ...payload }`，`configure` 对应 PUT /v1/catalog。成功响应 `{ id, result: <HTTP 成功响应> }`；失败响应 `{ id, error: { code, message } }`。仅 stdout 输出协议，日志走 stderr。顺序执行，一条请求对应一条响应，限制每行 16 MiB。

JSONL 为独立客户端和工具保留，由 worker 包的契约测试覆盖。项目 API 只使用 HTTP，不负责启动 Python 或管理模型目录；本机服务管理器和 all-in-one 的 PM2 负责 worker 进程。

## 双方验收

- 无目录 status；目录同版本复用、失败不替换旧目录、版本不符明确报错。
- 仅传目录一次后可连续匹配，输出 ID 不越过候选范围；空候选正常拒答。
- 标题和别名均接收，不限定来源；缺失日期、可选字段与小数编号可处理。
- HTTP 与 JSONL 结构一致；语义关闭不加载神经模型。
- worker 重启丢缓存后 API 能恢复；超时／故障不产生任务级请求重试风暴。
- 本协议不改变现有算法的权重或效果承诺；季度级候选及新输入口径的效果另行评估。
