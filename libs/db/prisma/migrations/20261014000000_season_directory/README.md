# 季度目录与 Jellyfin 关联

迁移新增可空的 `seasons.directory` 和 `last_write_directory`，并约束同一媒体库内的非空目录名唯一。没有数据库函数、触发器或旧数据回填，也不会移动现有媒体文件。

API 在新季度首次写盘、保存季度或执行「同步元数据」时，用标题清洗结果更新 `directory`。标题本身保持不变。旧季度在操作前继续使用 `last_write_title` 对应的目录；操作时按需移动目录，并记录 `last_write_directory`，供导入、删除及失败重试使用。目标目录已存在时不覆盖，标题清洗后重名会报冲突。下载任务中的已导入文件和 NFO 路径随目录移动更新。

新写入的 `tvshow.nfo` 使用小写 `uniqueid`。显式写盘时移除旧 `uniqueId` 标签；不启动全库 NFO 重写。Jellyfin 按媒体库分页读取 `ProviderIds` 和 `Path`，优先关联 Lani ID，无对应 ID 时兼容没有 Lani ID 的准确路径匹配。多个匹配取返回的第一项并记录警告；ID 匹配后的路径差异也会警告，不按展示名称猜测。

发布需要执行 Prisma 迁移，并让 Data Server、Gateway 重新加载 schema。两个目录字段在 PostGraphile 中只读，由 API 维护。回滚代码前保留新列和已移动的目录记录，不能通过删除字段恢复文件系统位置。
