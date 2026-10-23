# `@lani/all-in-one`

将 Lani 前后端与对象存储打包为一个容器，便于自托管部署。使用 [`ghcr.io/std4453/lani-all-in-one`](https://github.com/std4453/lani/pkgs/container/lani-all-in-one)，按[用户手册](../../docs/docs/installation/deployment/docker-all-in-one.mdx)准备配置与目录。

启动时挂载 `/config/config.yaml`，持久化对象存储使用 `/storage`。启动脚本会执行数据库迁移，升级前需自行备份；迁移失败会终止启动。

季度匹配默认使用轻量词法服务，语义模式及外部 worker 配置见[种子季度匹配](../../docs/docs/torrent-matching.md)。
