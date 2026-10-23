# Nyaa 解析开发

规则按页面结构和字幕证据归纳，保持音轨语言、未知与明确无字幕之间的区别。扩充语料时保存相关原文和独立标注，同时检查精确率、召回率及未知分类；有限样本的结果不能外推到全站。

在本包运行 `node ../../common/scripts/install-run-rushx.js test --runInBand`。测试只读固定样本，来源、采集方法及已知限制见[语料说明](src/fixtures/subtitles/README.md)。
