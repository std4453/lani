# 种子保留与清理

仅清理当前 Lani 数据库中已越过提交阶段的 DOWNLOAD / BATCH_DOWNLOAD 对应种子；不依赖可被用户修改的分类或标签。支持下载器实际 hash 及 hybrid 的 v1/v2 hash。未确认提交、导入任务、无关联种子不参与；同 hash 仍被未完成且未失败／取消的下载使用时暂缓。删除下载历史后无法确认归属的种子也不会清理。

在 API 配置中加入：

```yaml
downloadClient:
  kind: qbittorrent
  qbittorrent:
    # 保留已有连接、鉴权及路径配置
    retention:
      enabled: true
      afterFinish: 7d
      afterSeeding: 30d
```

省略 retention 时默认关闭；两个时长的默认值分别为 7d、30d，使用 [parse-duration](https://github.com/jkroso/parse-duration) 的英文单位及组合格式（如 `1 hour 20 minutes`），直接按秒解析并要求结果大于零；支持小数秒，无单位数字按秒解释。无法解析或结果不大于零会阻止启动。更改配置后重启 API；一期没有前端入口。

## 状态与时间

要求 qBittorrent 的 progress 为 1。pausedUP（4.x）／stoppedUP（5.x）按 afterFinish，uploading、stalledUP、forcedUP、queuedUP 按 afterSeeding。校验中、移动中、缺失文件、错误和未完成状态均跳过。

qBittorrent 没有独立的“达到分享率后停止时间”。两种规则都从 completion_on 计算，缺失或非正数才回退 added_on，使用下载器 Unix 秒时间；非法或未来时间跳过。手动暂停与分享率停止无法由该状态区分，两者都按 afterFinish。seeding_time 是累计完成状态时长，不是状态切换时间，因此不据此推导停止日期。规则判断不使用 Lani 任务创建时间，不将做种中的任务套用较短的 afterFinish。

## 调度与执行

每 6 小时检查一次，不启动即扫描。管理员可通过现有 Gateway 鉴权调用 `mutation { scanTorrentRetention }`，返回入队候选数；配置关闭或已有任务时返回 0。此 mutation 只检查和入队，不同步执行删除。扫描与 DownloadAtom 的短周期刷新分开，避免历史种子增加下载进度轮询开销。

复用 [PR #84](https://github.com/std4453/lani/pull/84) 的[单实例后台队列](../background-queue/README.md)，单次扫描合并为一个持久化任务，新输入写入 `version: 1`；无版本的历史输入按 v1 兼容，未知版本失败保留。任务归属及活跃使用由 `DownloadJobService.getTorrentOwnership()` 提供，清理模块不读取任务内部状态。队列不并行消费同一通道，不为清理注册重试策略。执行时每批重新查询归属、下载器状态和时间，最多 100 个 hash，串行调用 `/torrents/delete`，固定 `deleteFiles=false`。成功日志表示下载器接受请求，不表示文件被移除。已删除种子在重启恢复时自然跳过。

单批查询或删除失败记录英文日志，继续后续批次，整轮结束后确认任务；不立即重试（删除请求的 401/403 也不重放）。失败候选仍存在时由下一次扫描重新入队。队列数据库故障或损坏 payload 使用通用失败屏障，需按队列文档检查恢复。关闭配置不会消费旧任务，再开启时执行前仍重新验证。仅支持单 API 消费实例。

扫描日志记录 hash、状态、规则、时钟字段、起算秒数和到期秒数；执行日志记录接受删除的 hash 或失败批次，不输出凭据。不会删除下载文件、媒体文件、Lani 下载历史或媒体关联，也不调用媒体资产回收。

## 请求大小依据

qBittorrent [4.6.7 的 RequestParser](https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/base/http/requestparser.h) 限制请求正文为 64 MiB；[connection.cpp](https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/base/http/connection.cpp) 对超过缓冲上限的未完成请求返回 413。[删除接口](https://github.com/qbittorrent/qBittorrent/blob/release-4.6.7/src/webui/api/torrentscontroller.cpp) 支持竖线分隔的 hashes 和 deleteFiles 参数。

执行层固定每批 100 个合法 hash；即使全部为 64 位，URL 编码后的表单仍小于 8 KiB，也避免反向代理常见的更小限制。扫描不拼接全部历史 hash 到 URL，执行查询也按同样上限分批。遇到 413 不拆分重试该批，下一轮再扫描，需检查代理是否有更严格限制。

## 数据库

迁移 `20261025000000_torrent_retention_queue` 只创建与 PR #84 一致的 background_jobs 表，PostGraphile 用 @omit 隐藏；无历史回填，无媒体字段变更。若 PR #84 已安装，IF NOT EXISTS 保留既有任务。PR #84 尚未合并时，本 PR 可独立安装；之后合并其迁移时必须将同表创建收敛为共享迁移或幂等创建，避免在已安装本 PR 的数据库重复建表。不要改写已经发布的迁移校验和。
