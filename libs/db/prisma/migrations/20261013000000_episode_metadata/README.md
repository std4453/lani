# 剧集编号与字幕元数据迁移

`20261013000000_episode_metadata` 增加种子解析 JSON、解析版本和查询用编号列，
剧集新增来源类型、编号、Bangumi ID / 排序及原始数据。编号使用 `numeric(10,3)`；
Bangumi 刮削跳过超出范围或精度的编号并告警，避免数据库舍入后把两个剧集混为一集。
迁移保留旧列，不重新解析种子、不回填已有剧集。会建立编号匹配和任务关联索引，
应在正常维护窗口执行，并重启 data-server / gateway 加载计算字段。

- `Torrent.episodeInfo`、`Torrent.subtitleInfo` 是独立 JSON 字段；编号以十进制字符串返回。
  只有 `parse_version IS NULL` 的历史记录兼容旧解析列；新解析失败不会复用旧编号。
- 下载候选使用 `torrents_match_number`，只匹配普通单集，保留已有 `LIKE` 匹配和 `offset` 偏移规则。
  旧的 SQL 生成列 `episode_index` 仍保留，但不再用于新任务选集。
- `Episode.numbering` 返回来源类型、编号和排序。Bangumi 本篇使用 `ep`，SP 使用 `sort`；
  原始响应保留在 `source_data`。缺日期剧集也会保存，上游缺失只告警，不删除本地剧集。
  编号被其他本地剧集占用时，仅跳过冲突集并告警，其他剧集继续同步；保留已有编号及任务关联。
  `mainEpisodes` / `latestMainEpisode` 供元数据页统计正片，特别篇不参与计数或最新集状态。
- 详情列表在前端排序；Jellyfin 编号由媒体适配器独立计算，不写入数据库。
  普通整数集沿用第 1 季编号，小数集和特别篇使用第 0 季及稳定的本地剧集 ID，
  导入文件、NFO 和媒体查询共用该映射，避免新增剧集改变已有文件编号。

迁移后可在 `libs/db` 目录下对隔离数据库运行 `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/episode-metadata.sql`
验证历史兼容、精确编号匹配和正片统计；测试数据在事务内回滚。
