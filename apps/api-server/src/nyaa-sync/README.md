# Nyaa 元数据同步实现

RSS 按英文、非英文、RAW 三类每 5 分钟同步，在第 0、20、40 秒执行。详情、RSS 和历史列表共用进程内串行请求队列，间隔至少 1 秒；`torrents.nyaa.qps` 可以设得更低。任意请求收到 403/429 后，共享客户端暂停 15 分钟，队列中的请求不继续访问 Nyaa。当前按单实例 API 设计，队列及暂停状态不跨实例共享。

## 内存队列

每分钟分页扫描最近 30 天的 NYAA `pending` / `failed` 记录并去重入队，每批最多处理 40 个到期任务。初次启动和重启使用同一加载流程，失败行也重新入队。分页避免前面的失败记录阻塞后面的新记录；不依赖标题是否包含 Multi-Sub。

每个任务最多请求 3 次，失败后在内存中退避 1、2 分钟；限流时至少等待 15 分钟。中间过程不写数据库。成功时保存页面及解析结果；重试耗尽后只写 `failed` 和失败原因，本次进程不再自动入队。数据库保存失败时保留待写结果，下次只重试保存，不重复抓取。关闭时停止取新任务并等待当前请求结束。

持久字段与来源无关，由 `channel` 标识来源：

- `metadata`：成功获取的页面标题、描述文本和文件列表。
- `metadataResult`：解析版本、`known` / `none` / `unknown`、字幕信息及证据。
- `metadataFetchedAt`：上次成功时间。
- `metadataStatus`：`pending` / `parsed` / `failed`。
- `metadataError`：重试耗尽的失败原因，成功后清空。

重新抓取失败保留旧页面、解析结果和成功时间。页面抓取成功但语言未知属于 `parsed`，不重复请求；标题解析继续保存在 `parseResult`。Data Server 的 `SubtitleInfoPlugin` 在同一次 SQL 中加载页面结果，并用 TypeScript 合并字幕信息，保持现有 GraphQL 字段和 UI 查询不变。页面未知时保留标题；标题具体语言优先于页面“无字幕”；简繁体证据替代笼统的 `zh`。

## 解析与验证

纯解析器和固定语料位于 [`@lani/parse-nyaa`](../../../../libs/parse-nyaa/README.md)。运行时不调用 AI，不读取评论、外部 MediaInfo 链接、图片或种子内容。扩展结构规则时同步验证精确率与召回率，不用解析器输出反向修改 ground truth。

在 API 包运行 `node ../../common/scripts/install-run-rushx.js test --runInBand nyaa-sync`；在仓库根运行 `python3 libs/db/tests/nyaa-metadata-migration.py` 验证迁移和实际 GraphQL 查询，后者需要先构建 Data Server，并提供本机 `initdb`、`pg_ctl`、`psql`。测试只用临时 Unix socket PostgreSQL，不访问共享服务。

## 迁移

保留已执行的 `20261019000000_nyaa_metadata`，新增 `20261020000000_generic_torrent_metadata` 重命名通用字段、移除持久重试字段，并恢复原有的标题计算函数。结构变更短事务提交后再转换旧 `unavailable` 状态；检查约束以 `NOT VALID` 添加，后续单独验证；索引由独立的单语句迁移 `20261020000001_metadata_queue_index` 在事务外并发建立，兼容 Prisma 整段发送 SQL 的执行方式。迁移不会触发抓取，也不重写已有成功结果。失败的并发索引构建需按 PostgreSQL/Prisma 迁移恢复流程处理，不能把整个文件包在一个事务中执行。
