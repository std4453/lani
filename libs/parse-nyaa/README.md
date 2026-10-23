# Nyaa 页面字幕解析

`@lani/parse-nyaa` 是纯解析包，不发 HTTP 请求、不调用 AI。`extractNyaaMetadata(html, expectedHash)` 从已获取的 HTML 提取标题、描述和文件名并校验详情页；`parseNyaaSubtitles(metadata)` 从字幕上下文提取 BCP 47 语言、交付方式和命中证据。

支持字幕清单、Markdown/HTML 表格、MediaInfo Text 轨道和字幕文件名后缀。按结构组织规则，不根据发布组推断语言。Chinese 保持 `zh`，只有明确证据才细分简繁。未知、缺少描述、RAW 不等于无字幕；音轨语言和未来补充字幕的说明不作为已有字幕证据。

真实语料、独立 ground truth、采集方法及已知漏报见 [语料说明](src/fixtures/subtitles/README.md)。测试只读固定样本，不访问 Nyaa。

规则维护与验证见 [AGENTS.md](AGENTS.md)。
