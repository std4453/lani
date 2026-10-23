# Nyaa 元数据刷新

服务会自动补抓近期 Nyaa 种子的字幕元数据。管理员可通过鉴权 GraphQL 提交 `refreshNyaaMetadata(ids: [Int!]!)`，使用数据库 Torrent ID，每次 1–100 条；手动指定的旧种子也可刷新。

接口返回新入队数量，重复 ID 合并，记录不存在或来源非 NYAA 时整次请求失败。任务复用自动抓取的限速与退避，成功后才替换结果；通过 metadataFetchedAt、metadataStatus 和 metadataError 查看最终状态。手动刷新队列只在内存中保存，重启后需重新提交。

限流、恢复与证据合并的原因见[同步设计](DESIGN.md)。
