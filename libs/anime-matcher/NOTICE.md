# 数据与第三方资源归属

## 评测数据来源（不随包发布）

季度目录中的 Bangumi 名称及完整别名归 Bangumi 条目贡献者所有，来源为 [Bangumi API](https://bangumi.github.io/api/)；本地研究数据每项保留 `bangumiId`，可通过 `https://bgm.tv/subject/{bangumiId}` 查阅对应条目。按照 [Bangumi 版权声明](https://bangumi.tv/about/copyright)及其链接的 [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)，该部分整理和改编数据遵循相同协议。改动包括提取名称／别名与必要静态事实、匿名编号及结构转换，没有发布完整 API 响应、简介、封面、评论或用户资料。没有使用 bangumi-data、Skyhook 等额外标题库。

查询名称、原始资源标题、发布时间和集数来自 [Mikan](https://mikanani.me/) 与 [Nyaa](https://nyaa.si/) 的公开信息，经项目 `parse-torrent-title` 提取；作品名称权利归各自权利人。仅保留匹配评测所需的标题和事实字段，不包含作品内容、磁力链接或 torrent 文件。标注、数据分区、人工／模型辅助审计与预测由本项目研究整理；不将其宣称为独立认证的人工金标。

研究整理截至 2026-10-22。运行目录只含数据库已有标题、完整 Bangumi 别名及可靠静态季度信息，不带逐集发布日期；原版监督、修订版、待定冲突和修订证据分别保留。历史季度元数据不等于官方逐集放送日程。本机数据库导出、连接配置、采集脚本及私人环境信息不随包分发。

## 预训练模型

神经权重不存储在 Git 或 npm 包中；下载器固定上游 revision 并验证 SHA256。下列链接和 [models.json](python/lani_anime_matcher/assets/models.json) 记录来源；再分发下载后的权重时应保留上游许可与声明。

| 模型 | 上游声明的许可证 | 用途 |
| --- | --- | --- |
| [intfloat/multilingual-e5-base](https://huggingface.co/intfloat/multilingual-e5-base) | MIT | 跨语言标题向量与检索特征；使用固定 int8 ONNX 产物 |
| [Qwen/Qwen3-Reranker-0.6B](https://huggingface.co/Qwen/Qwen3-Reranker-0.6B) | Apache-2.0 | 完整查询／候选别名的匹配分数 |

默认交付语义模型使用预训练权重，没有微调。项目拟合的两棵 LightGBM 树位于 `python/lani_anime_matcher/assets/static-*.txt.gz`；训练数据、复现入口及实验记录保留在本地，不随本 PR、wheel 或 npm 包发布。对照研究的失败方案及其权重不作为运行依赖分发。

## 运行库

日语读音由可选依赖 pykakasi 生成，简繁转换由 OpenCC Python 实现提供；这些是通用文本特征，不是外部动画别名来源。各 Python／Node 依赖适用自身许可证，通过标准包管理器安装，未将其源代码或二进制复制入本仓库。语义依赖包含 GPL 许可的 pykakasi；重新分发完整运行环境时应保留该依赖所需的许可及源码提供信息。本目录公开可重建环境的包清单与 Dockerfile。
