# 语料回放校验

## 制作组完整性验收

构建后在本包目录运行：

```sh
node scripts/check-organization-corpus.cjs baseline.ndjson.gz organization-labels.ndjson organization-report.json
```

制作组基线每行保存 `{ "id", "title", "parsed", "names" }`：`parsed` 是改动前主解析器的结果或 `null`，`names` 是同一原文的独立 `parseTorrentNames` 结果。所有基线记录均检查主解析器除 `organization` 外的完整结果不变，包含标题、剧集、字幕、来源、格式及位置字段；独立名称路径的 `title` 也必须完全不变。检查三个制作组调用路径的一致性，任何异常或不一致均失败。

标签每行包含相同 ID 类型、精确原文、`status` 和 `expected_groups`。`status` 仅接受 `ready` 或 `pending`；未标组时使用空数组，有组却未提取或联合组漏拆均整条失败。比较完整制作组集合，只归一空白和全角 ASCII，保留拼写与标点；组顺序不影响结果。`pending` 保留在分母并计错。程序拒绝重复 ID、原文不匹配、空组名及重复组名。

制作组验收不支持任何例外名单，额外排除参数和排除字段均被拒绝。整条准确率至少 99%，全库保护字段零差异、零异常才通过。报告保存分母、错误明细、带组／无组／联合组子集成绩、Wilson 95% 区间及输入和代码哈希。标签应先独立盲审并冻结，再与预测比较；开发集成绩不能替代独立样本成绩。

另以 [固定格式目录](./ORGANIZATION_FORMATS.md) 随机生成陌生组名，验证通用结构识别。CI 使用固定 seed，验收再用未用于开发的新 seed；不得为了过线删改困难模板。随机格式测试反映这些模板下的识别能力，不能代替真实语料准确率。

## 标题完整性验收

标题识别改动使用独立的严格验收入口，构建后在本包目录运行：

```sh
node scripts/check-title-corpus.cjs baseline.ndjson.gz title-labels.ndjson title-report.json
```

基线包含每条资源的 `{ "id", "title", "parsed" }`，其中 `parsed` 为旧版结果或 `null`。标注可以是基线中的随机样本，每行包含相同的 `id`、精确原文 `title`、`status` 和 `expected_titles`。`status` 使用 `ready`、`pending` 或 `out_of_domain`。标签必须独立根据原文制作，不能把当前解析器输出当作真值；用于开发的样本与最终验收样本应分开，保留抽样种子、标签修订理由及冻结哈希。

验收比较完整别名集合：多提、漏提、截短或夹带非标题内容都算整条错误，只归一化空白和全角 ASCII，不改字词、大小写或标点。仅空格连接的混合语言名称保留整体；明确分隔的别名另列。`pending` 和 `out_of_domain` 保守计作未通过，不从分母删除。程序拒绝重复 ID 和原文不匹配的标注。

经过显式授权和独立审核的特殊标题，可以通过可选的第四个参数提供例外名单。名单保存在仓库外，不能把具体作品名称写进解析或验收代码：

```sh
node scripts/check-title-corpus.cjs baseline.ndjson.gz title-labels.ndjson title-report.json exclusions.ndjson
```

名单每行包含 `{ "id", "title", "reason" }`。ID 必须唯一，ID 的值和类型以及原文标题必须与全量基线精确对应，`reason` 必须为非空字符串。名单总量不得超过全量基线的 2%，包括没有命中当前标注样本的条目；超限或任一条目无效均拒绝验收。不传名单时，所有标注样本仍保留在分母中。名单只排除标题语义评分：全部基线记录（包括例外）的原解析成功／失败状态、非标题字段和异常检查始终执行。名单外的 `pending` 和 `out_of_domain` 仍计失败，不能用标签状态代替例外审批。

报告的 `summary.population` 是全库基线数量，`eligiblePopulation` 是扣除全库例外后的数量；`sample` 是原始标注样本数量，`evaluatedSample` 是扣除命中例外后的评分数量。`excludedPopulation` 和 `excludedSample` 分别表示全库例外数量及其样本命中数量，旧字段 `excluded` 与 `excludedSample` 相同，无名单时为 0。正确率和 Wilson 95% 区间使用 `evaluatedSample` 作为分母；评分数量为 0 时正确率和区间均为 `null`，验收失败。`statuses` 统计原始样本的全部状态，便于核对原始样本组成。

报告保存例外文件原始字节的 SHA-256（`summary.exclusionsHash`，无名单时为 `null`），并在 `exclusions` 中保留名单的 ID、精确标题和审核理由，以便追踪和复现。

生产路径使用主解析器的标题，主解析器失败时使用独立的 `parseTorrentNames`。所有基线记录都检查原有成功／失败状态及 `index`、`episodeInfo`、`subtitle`、`subtitleInfo`、`source`、`format` 的严格不变性。任何差异或异常，或标注样本的整条正确率低于 98%，都会让命令失败。报告包含失败明细、代码与输入哈希、样本正确率及 Wilson 95% 区间；抽样成绩不等于逐条验证了全库语义正确性。

## 剧集及其他字段的变更审核

构建此包后，使用三个本地 NDJSON 文件运行回放校验：

```sh
node scripts/check-corpus.cjs /path/to/baseline.ndjson /path/to/eligibility.ndjson /path/to/reviewed-changes.ndjson
```

请在 `libs/parse-torrent-title` 目录下运行。基线文件中的每行对应一个输入标题，结构为 `{ "id", "title", "parsed" }`；`parsed` 是旧解析器的结果或 `null`。适用范围文件包含相同的 ID 和标题，以及事先确定、不随解析结果调整的布尔值 `eligible`。已审核变更文件为每项认可的差异保存一条记录：

```json
{
  "id": "example",
  "title": "[Group] Series S01E03",
  "path": "index",
  "old": 2,
  "new": 3,
  "reason": "已核对季度与剧集编号的对应关系",
  "status": "accepted"
}
```

校验覆盖标题、发布组、集数、来源、格式及旧版字幕输出。已存在的来源和格式键必须保留原值，允许增加新识别出的键。旧版字幕布尔值只检查原值为 `true` 的信息是否丢失；字幕类型变化及其他旧版字幕值的变化均需审核。旧解析失败而新解析成功，或原有解析结果丢失时，通过精确的 `index` 变化进行审核；结果丢失必须明确使用 `new: null`。审核记录中的 ID、标题、字段路径、旧值和新值必须与当前差异完全一致，并提供原因。缺失、过时、重复或不精确的审核记录都会使校验失败。

适用范围文件必须与基线中的 ID 和标题一一对应。适用标题的解析失败率必须低于 3%；解析器抛出异常时，校验总是失败。报告会输出所有输入文件和包内 `dist` 目录的 SHA-256 哈希。语料和审核文件应保存在仓库之外。

适用范围必须独立于解析是否成功来确定：不能仅因为新解析器无法处理某个标题就将其排除。编号含义不确定的候选仍应计入分母。排除标题需要提供不含剧集标识的证据，例如只有技术参数，或明确限定为日历年份的数字。分类规则和排除依据应与本地语料一起保存，以便复现和审计统计比例。

校验通过只说明这份语料相对于已审核基线满足要求，不代表对未见过的标题也有相同准确率。尤其是接受输出变更前，需要审核其实际含义：解析器的输出本身不能证明某个数字就是集数。

可通过第四个参数提供经过独立审核的预期集数：

```sh
node scripts/check-corpus.cjs baseline.ndjson eligibility.ndjson reviewed-changes.ndjson expected-indices.ndjson
```

每条标注包含 `id`、精确的 `title`、`index`（数字、区间，或不应返回普通集数时使用的 `null`）和非空的 `reason`。与基线比较不同，这项检查可以发现新旧解析器都给出同一个错误答案的情况。重复标注、未知 ID、标题不匹配、成功解析但集数错误，以及遗漏预期集数，都会使校验失败。报告会注明已标注的行数；除非每行都有独立标注，否则不能将其视为整个语料库的准确率估计。改动范围之外的已知失败应保留在单独的审计报告中，不能为了迎合解析器结果而修改标注。

无编号的特别篇可以返回有用的 `episodeInfo`，但仍计入适用标题中的集数解析失败。有编号的特别篇可以恢复带类型的编号，但不会恢复旧版的普通集数 `index`。特别篇信息的变化需要精确审核；新增加的普通剧集 `episodeInfo` 只是重复表达原有集数约定。预期集数标注检查的是旧版 `index`，包括特别篇不应具有该字段的情况；特别篇类型与编号的含义还由单元测试覆盖。
