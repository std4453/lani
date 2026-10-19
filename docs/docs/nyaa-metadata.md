# Nyaa 字幕元数据

Nyaa RSS 按英文、非英文和 RAW 三个分类每 5 分钟同步一次，分别在第 0、20、40 秒执行。详情抓取、RSS 和历史列表共用 API 进程内的串行请求队列，间隔至少 1 秒；`torrents.nyaa.qps` 可设为更低值，高于 1 时按 1 执行。沿用单实例 API 的部署方式，多副本不能将进程内限速视为跨实例限速。

## 异步补全

每分钟从数据库选取发布于最近 30 天、尚未成功抓取的 NYAA 种子，按发布时间从新到旧处理，每批最多 40 条。不依赖标题是否写了 Multi-Sub，也不访问外部 MediaInfo 链接、图片或下载种子文件。

数据库充当持久队列，单条记录通过条件更新获得 5 分钟租约。进程重启后会继续处理到期任务；失败按指数退避重试，最长间隔 24 小时。HTTP 403/429 中止当前批次，当前记录至少 15 分钟后重试；404/410 标记为不可用。成功获取但没有可识别语言的页面同样视为已抓取，不反复请求。

- `nyaaMetadata`：页面标题、描述文本及文件列表。保留段落和表格边界，供重新分析。
- `nyaaMetadataResult`：解析版本、`known` / `none` / `unknown` 状态、规范化 `subtitleInfo` 及命中证据。
- `nyaaMetadataStatus`：`pending` / `parsed` / `failed` / `unavailable`，独立于语言是否已知。
- `nyaaMetadataFetchedAt`、`nyaaMetadataFailures`、`nyaaMetadataRetryAt`：成功抓取时间、连续失败次数和重试或租约时间。

标题解析仍保存在原来的 `parseResult`。PostGraphile 的 `subtitleInfo` 计算字段合并标题与页面证据，沿用现有字幕标签和悬浮语言列表。页面识别出简繁体后，Multi-Sub 种子即可显示中文字幕信息。更新数据库字段后，再次查询列表即可看到结果；抓取不会阻塞列表查询和现有下载流程。

## 确定性抽取

运行时仅使用 HTML/文本结构、字幕上下文及语言别名表，不调用模型或 AI 服务，也不根据发布者推断语言。支持常见 Markdown/HTML 清单、表格、MediaInfo Text 轨道和字幕文件名后缀。语种映射为 BCP 47；Chinese 保持 `zh`，只有明确简繁证据时才细分为 `zh-Hans` / `zh-Hant`。

只在字幕字段中识别语言，忽略音轨、评论、请求字幕或未来补充字幕的说明。“没有描述”、RAW 和未匹配的新格式表示未知，不等同无字幕。只有明确无字幕的说明才产生 `none`。遇到不支持的格式允许漏报，避免猜测中文；页面提取失败不会覆盖已保存的标题解析。

解析器按结构而非发布组模板组织。扩展新格式时，应保留原始相关片段及独立标注，增加边界用例，并同时检查已识别语言的精确率和召回率。有限样本集不代表全站分布，也不能保证未来格式全部可识别。

## 验证与发布

新增迁移 `20261019000000_nyaa_metadata` 包含元数据列、队列索引和 `torrents_subtitle_info` 合并逻辑。发布时先按现有迁移流程应用，再启动新版 API/Data Server；不用修改前端 GraphQL 查询。迁移不批量抓取页面，后台任务启动后自然补全近 30 天记录。

在仓库根目录运行隔离数据库测试：

```bash
python3 libs/db/tests/nyaa-metadata-migration.py
```

测试要求本机可用 `initdb`、`pg_ctl`、`psql`，只创建临时 Unix socket PostgreSQL，结束后删除数据目录。在 `apps/api-server` 中运行：

```bash
node ../../common/scripts/install-run-rushx.js test --runInBand nyaa-sync torrent-sync parse-torrent
```

真实语料及独立 ground truth 位于 `apps/api-server/src/nyaa-sync/fixtures/subtitles/`；采集方法与限制见该目录的 README。测试只读固定样本，不在 CI 中访问 Nyaa。
