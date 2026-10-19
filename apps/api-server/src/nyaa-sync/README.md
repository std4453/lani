# Nyaa 元数据同步实现

RSS 按英文、非英文、RAW 三类每 5 分钟同步，在第 0、20、40 秒执行。详情、RSS 和历史列表共用进程内串行请求队列，间隔至少 1 秒；`torrents.nyaa.qps` 可以设得更低。任意请求收到 403/429 后，共享客户端暂停 15 分钟，队列中的请求不继续访问 Nyaa。当前按单实例 API 设计，队列及暂停状态不跨实例共享。

## 内存队列

每分钟分页扫描最近 30 天的 NYAA `pending` / `failed` 记录并去重入队，每批最多处理 40 个到期任务。初次启动和重启使用同一加载流程，失败行也重新入队。分页避免前面的失败记录阻塞后面的新记录；不依赖标题是否包含 Multi-Sub。

每个任务最多请求 3 次，失败后在内存中退避 1、2 分钟；限流时至少等待 15 分钟。中间过程不写数据库。成功时只保存最终解析结果；重试耗尽后只写 `failed` 和失败原因，本次进程不再自动入队。数据库保存失败时保留待写结果，下次只重试保存，不重复抓取。暂停期间请求正常排队；关闭模块时取消等待计时器和在途请求，并拒绝后续任务。

持久字段与来源无关，由 `channel` 标识来源：

- `metadata`：解析版本、`known` / `none` / `unknown`、字幕信息及证据。
- `metadataFetchedAt`：上次成功时间。
- `metadataStatus`：`pending` / `parsed` / `failed`。
- `metadataError`：重试耗尽的失败原因，成功后清空。

HTML、提取的描述和文件列表仅存在于内存，不写入数据库。重新抓取失败保留旧解析结果和成功时间。页面抓取成功但语言未知属于 `parsed`，不重复请求；标题解析继续保存在 `parseResult`。API 的 `TorrentSubtitleResolver` 使用 Federation `@requires` 取得标题解析、旧字段和最终 metadata，并合并字幕信息。Gateway 在原有列表查询中读取这些字段，不逐行查询数据库；保持现有 `subtitleInfo` 字段和 UI 查询不变。Data Server 无需业务插件，数据库也不提供字幕兼容函数。页面未知时保留标题；标题具体语言优先于页面“无字幕”；简繁体证据替代笼统的 `zh`。

## 解析与验证

纯解析器和固定语料位于 [`@lani/parse-nyaa`](../../../../libs/parse-nyaa/README.md)。运行时不调用 AI，不读取评论、外部 MediaInfo 链接、图片或种子内容。扩展结构规则时同步验证精确率与召回率，不用解析器输出反向修改 ground truth。

在 API 包运行 `node ../../common/scripts/install-run-rushx.js test --runInBand nyaa-sync admin/torrent-subtitle`；在仓库根运行 `python3 libs/db/tests/nyaa-metadata-migration.py` 验证迁移、锁范围及真实 Federation 查询，需要先构建 API，并提供本机 `initdb`、`pg_ctl`、`psql`。测试只用临时 Unix socket PostgreSQL，不访问共享服务。

## 迁移

本需求只保留 `20261021000000_torrent_metadata` 一个迁移，删除 PR 开发阶段的三个迁移文件。新名称确保已执行旧版迁移的数据库仍会执行这次结构调整；不修改数据库中的历史迁移记录。

迁移支持从 `next` 和本 PR 的两个旧结构升级：保留并重命名最终解析结果，删除原始响应列、持久重试列、旧约束/索引及字幕计算函数。新结构仅增加四个 metadata 字段；不新建索引或执行约束验证扫描，按既有主键分页加载任务。结构变更提交后，才单独把旧 `unavailable` 转为 `failed`，不延长结构变更的排他锁。迁移不抓取页面、不清空成功结果。
