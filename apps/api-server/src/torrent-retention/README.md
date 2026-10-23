# 种子保留与清理

为 Lani 已提交的下载种子设置保留期，到期后从 qBittorrent 删除条目并保留下载文件。在 API 配置中启用：

```yaml
downloadClient:
  kind: qbittorrent
  qbittorrent:
    # 连接、鉴权和路径配置沿用现有值。
    retention:
      enabled: true
      afterFinish: 7d
      afterSeeding: 30d
```

省略 retention 时默认关闭。时长使用英文单位，支持 `1 hour 20 minutes` 等组合，必须大于零；无单位数字按秒解释。更新配置后重启 API。

暂停或停止的已完成种子使用 afterFinish，做种中的种子使用 afterSeeding。两者均从完成时间起算，缺失时回退添加时间；手动暂停也按 afterFinish 处理。其他状态暂不清理，仍被活动下载使用的种子会保留。

服务定期扫描，管理员可通过鉴权 GraphQL 调用 `mutation { scanTorrentRetention }` 提前入队，返回候选数量。执行日志记录接受删除的 hash 或失败批次。具体恢复语义见[设计笔记](DESIGN.md)。
