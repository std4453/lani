# 标题解析开发

名称和制作组规则按发布结构归纳，保持原始标题、别名及季集限定。规则顺序影响否定判断与递归边界，整理元信息表时仅合并连续的同类判断。

新增回归按功能归入 `names.*.test.ts` 或 `organization.*.test.ts`，同时验证集成入口与独立名称入口。真实语料不得通过特殊标题例外或回写解析输出调整真值；语料评估见 [CORPUS.md](CORPUS.md)，随机格式覆盖见 [ORGANIZATION_FORMATS.md](ORGANIZATION_FORMATS.md)。

运行 `rushx test --runInBand`，检查剧集、字幕和位置字段是否受名称规则变更影响。启发式解析的未知结果需保留，不以完整原文回填掩盖已过滤的技术信息。
