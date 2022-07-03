import escapeStringRegexp from "@/escapeStringRegexp";
import {
  Index,
  KeywordMap,
  KeywordMatch,
  Organization,
  ParseTorrentTitleOptions,
  ParseTorrentTitleResult,
  PositionalItem,
  PositionalItemType,
  Subtitle,
  Title,
} from "@/types";

interface Positional<T> {
  index: number;
  length: number;
  content: T;
}

function findRightSeparator(
  separator: string,
  separators: [string, string][]
): string | undefined {
  return separators.find(([left]) => left === separator)?.[1];
}

function parseOrganization(
  raw: string,
  organizationSeparators: string[]
): Organization {
  let parts = [raw];
  for (const separator of organizationSeparators) {
    if (raw.indexOf(separator) >= 0) {
      parts = raw.split(separator);
      break;
    }
  }
  return {
    raw,
    parts: parts.map((part) => part.trim()),
  };
}

function extractPair(
  content: Positional<string>,
  separators: [string, string][],
  matchContent?: (content: string) => boolean
): [Positional<string> | undefined, Positional<string>] {
  const leftSeparator = content.content[0];
  const rightSeparator = findRightSeparator(leftSeparator, separators);
  if (!rightSeparator) {
    return [undefined, content];
  }
  const endIndex = content.content.indexOf(rightSeparator, 1);
  if (endIndex < 0) {
    return [undefined, content];
  }
  const pairContent = content.content.substring(1, endIndex);
  if (matchContent && !matchContent(pairContent)) {
    return [undefined, content];
  }
  return [
    {
      index: 1,
      length: endIndex - 1,
      content: content.content.substring(1, endIndex),
    },
    {
      index: endIndex + 1,
      length: content.content.length - endIndex - 1,
      content: content.content.substring(endIndex + 1),
    },
  ];
}

function matchOrganization(
  content: Positional<string>,
  { separatorPairs, organizationSeparators }: DefaultedOptions
): [Positional<Organization> | undefined, Positional<string>] {
  const [orgnization, rest] = extractPair(content, separatorPairs);
  return [
    orgnization
      ? {
          index: orgnization.index,
          length: orgnization.length,
          content: parseOrganization(
            orgnization.content,
            organizationSeparators
          ),
        }
      : undefined,
    rest,
  ];
}

function positionalTrimStart(content: Positional<string>): Positional<string> {
  const trimStart = content.content.trimStart();
  return {
    index: content.length - trimStart.length,
    length: trimStart.length,
    content: trimStart,
  };
}

function positionalTrim(content: Positional<string>): Positional<string> {
  const trimStart = content.content.trimStart();
  const trim = trimStart.trimEnd();
  return {
    index: content.length - trimStart.length,
    length: trim.length,
    content: trim,
  };
}

function skipMatch(
  content: Positional<string>,
  pattern: RegExp
): Positional<string> {
  const match = content.content.match(pattern);
  if (!match) {
    return content;
  }
  return {
    index: content.index + match[0].length,
    length: content.length - match[0].length,
    content: content.content.substring(match[0].length),
  };
}

function parseIndex(content: string, options: DefaultedOptions): Index {
  const match = content.match(options.episodeInnerRegex);
  if (!match?.[0]) {
    throw new Error(`Invalid index string "${content}"`);
  }
  const indexStr = match[0];
  const connectorMatch = indexStr.match(options.episodeConnectorRegex);
  if (connectorMatch?.index) {
    return {
      from: parseInt(indexStr.substring(0, connectorMatch.index)),
      to: parseInt(indexStr.substring(connectorMatch.index + 1)),
    };
  } else {
    return parseInt(indexStr);
  }
}

function matchIndex(
  content: Positional<string>,
  options: DefaultedOptions
): [Positional<string>, Positional<Index>, Positional<string>] | undefined {
  const { episodePrefixSeparators, episodeRegexes, fixUnmatchedEpisodePrefix } =
    options;

  content = positionalTrimStart(content);
  let pair: Positional<string> | undefined;
  [pair, content] = extractPair(
    content,
    episodePrefixSeparators,
    (pair: string) => /^\d+月新番$/.test(pair.trim())
  );
  // 特殊情况：极影字幕社开头的「X月新番」只有一个「★」不成对，强行跳过
  if (!pair && fixUnmatchedEpisodePrefix) {
    content = skipMatch(content, /^★\d+月新番/);
  }
  content = positionalTrimStart(content);

  for (const regex of episodeRegexes) {
    const result = content.content.match(regex);
    if (!result) {
      continue;
    }
    const totalIndex = result.index;
    const totalMatch = result[0];
    const groupMatch = result[1];
    if (typeof totalIndex !== "number" || !totalMatch || !groupMatch) {
      continue;
    }
    const deltaIndex = totalMatch.indexOf(groupMatch);
    if (deltaIndex < 0) {
      continue;
    }

    return [
      {
        index: content.index,
        length: totalIndex,
        content: content.content.substring(0, totalIndex),
      },
      {
        index: totalIndex + deltaIndex,
        length: groupMatch.length,
        content: parseIndex(groupMatch, options),
      },
      {
        index: totalIndex + totalMatch.length,
        length: content.length - totalIndex - totalMatch.length,
        content: content.content.substring(totalIndex + totalMatch.length),
      },
    ];
  }
  return undefined;
}

function matchTitle(
  content: Positional<string>,
  {
    separatorPairs,
    titleSeparatorChars,
    titleNonEnglishRegex,
  }: DefaultedOptions
): Positional<Title> {
  content = positionalTrim(content);

  // 标题匹配总体有三种模式：
  // 将多种版本分别用括号（[]或【】）包裹
  // 使用斜杠「/」或下划线「_」或反斜杠「\」分隔
  // 使用斜杠「/」或下划线「_」分隔的同时外层用括号包裹
  // 最后还有一种情况是完全没有分隔符号，只能使用heuristic区分
  // 注意，由于我们匹配的是季度标题，因此不主动解析季度编号，保留即可

  const leftSeparator = content.content[0];
  const rightSeparator = findRightSeparator(leftSeparator, separatorPairs);
  if (
    rightSeparator &&
    content.content[content.content.length - 1] === rightSeparator
  ) {
    const removeOuter = content.content.substring(
      1,
      content.content.length - 1
    );
    // 如果中间还有其他括号，则基于括号进行分段
    if (
      removeOuter.indexOf(leftSeparator) >= 0 &&
      removeOuter.indexOf(rightSeparator) >= 0
    ) {
      const segments = removeOuter
        .split(
          RegExp(
            `\\s*${escapeStringRegexp(rightSeparator)}\\s*${escapeStringRegexp(
              leftSeparator
            )}\\s*`
          )
        )
        .filter((segment) => Boolean(segment))
        .map((segment) => segment.trim());
      return {
        content: {
          raw: content.content,
          aliases: segments,
        },
        index: content.index,
        length: content.length,
      };
    } else {
      // 没有找到其他括号，移除左右两个括号，继续解析
      content = {
        index: 1,
        length: content.content.length - 2,
        content: content.content.substring(1, content.content.length - 1),
      };
    }
  }

  // 为了找到分隔符，我们寻找分割最均匀的分隔符
  const result = titleSeparatorChars
    .map((separator) => ({
      separator,
      parts: content.content
        .split(separator)
        .map((part) => part.trim())
        .filter((part) => Boolean(part)),
    }))
    .filter(({ parts }) => parts.length > 1 && parts.length <= 4)
    .map(({ separator, parts }) => ({
      separator,
      parts,
      score: parts
        .map((part) => part.length / content.content.length)
        .reduce((a, b) => a * b, 1.0),
    }))
    .sort((a, b) => b.score - a.score); // 从大到小排序
  if (result.length > 0) {
    const parts = result[0].parts;
    return {
      index: content.index,
      length: content.length,
      content: {
        raw: content.content,
        aliases: parts,
      },
    };
  }

  // 不存在分隔符时采用最后的手段，找到从右到左最后一个可以划分中/英文的位置
  // 注意动画名称里经常有特殊字符，因此我们主要检测分割的后半部分是否存在中文字符，
  // 因为英语名称里不可能有中文字符，反之则不然
  let i = content.content.length;
  while (i >= 0) {
    const nextSpace = content.content.substring(0, i).lastIndexOf(" ");
    const afterNext = content.content.substring(nextSpace + 1);
    if (afterNext.match(titleNonEnglishRegex)) {
      break;
    }
    i = nextSpace;
  }
  // 成功找到分割点
  if (i >= 0 && i < content.content.length) {
    return {
      index: content.index,
      length: content.length,
      content: {
        raw: content.content,
        aliases: [
          content.content.substring(0, i),
          content.content.substring(i + 1),
        ].map((part) => part.trim()),
      },
    };
  }

  // 均为匹配成功时，当作没有重名
  return {
    index: content.index,
    length: content.length,
    content: {
      raw: content.content,
      aliases: [content.content],
    },
  };
}

interface MatchEntry {
  match: string | RegExp;
  onMatch: (matched: Positional<string>) => void;
}

function mapToMatchEntry<ValueType extends string>(
  entries: MatchEntry[],
  map: KeywordMap<ValueType>,
  result: ParseTorrentTitleResult,
  positionalItemType: PositionalItemType,
  setValue: (value: ValueType) => void
) {
  for (const key in map) {
    for (const match of map[key] ?? []) {
      entries.push({
        match,
        onMatch(matched) {
          setValue(key);
          result.positionalItems.push({
            index: matched.index,
            length: matched.length,
            type: positionalItemType,
          });
        },
      });
    }
  }
}

function keywordsToMatchEntry(
  entries: MatchEntry[],
  keywords: KeywordMatch[],
  result: ParseTorrentTitleResult,
  positionalItemType: PositionalItemType,
  setValue: (value: string) => void
) {
  for (const keyword of keywords) {
    entries.push({
      match: keyword,
      onMatch(matched) {
        setValue(matched.content);
        result.positionalItems.push({
          index: matched.index,
          length: matched.length,
          type: positionalItemType,
        });
      },
    });
  }
}

function matchMinimalKeyword(
  content: Positional<string>,
  entries: MatchEntry[]
): boolean {
  for (const { match, onMatch } of entries) {
    if (
      (typeof match === "string" && content.content === match) ||
      (match instanceof RegExp && match.test(content.content))
    ) {
      onMatch(content);
      return true;
    }
  }
  return false;
}

function matchOneKeyword(
  content: Positional<string>,
  entries: MatchEntry[],
  { keywordSecondarySeparators }: DefaultedOptions
) {
  const matchRegex = new RegExp(
    `${keywordSecondarySeparators
      .map((separator) => `(${escapeStringRegexp(separator)})`)
      .join("|")}|$`,
    "g"
  );
  let startIndex = 0;
  for (const match of content.content.matchAll(matchRegex)) {
    const index = match.index;
    if (typeof index !== "number") {
      continue;
    }
    if (
      matchMinimalKeyword(
        {
          content: content.content.substring(startIndex, index),
          index: content.index + startIndex,
          length: index - startIndex,
        },
        entries
      )
    ) {
      startIndex = index + 1;
    }
  }
}

function parseSubtitle(content: string): Subtitle {
  if (content === "CHS") {
    return {
      hasCHS: true,
    };
  }
  if (content === "CHT") {
    return {
      hasCHT: true,
    };
  }
  if (content === "CHT") {
    return {
      hasCHT: true,
    };
  }
  if (content === "GB") {
    return {
      hasCHS: true,
    };
  }
  if (content === "BIG5") {
    return {
      hasCHT: true,
    };
  }
  if (content === "JP") {
    return {
      hasJP: true,
    };
  }

  const subtitle: Subtitle = {};
  if (content.indexOf("简") >= 0) {
    subtitle.hasCHS = true;
  }
  if (content.indexOf("繁") >= 0) {
    subtitle.hasCHT = true;
  }
  if (content.indexOf("日") >= 0) {
    subtitle.hasJP = true;
  }

  if (content.indexOf("内嵌") >= 0) {
    subtitle.type = "内嵌";
  }
  if (content.indexOf("内封") >= 0) {
    subtitle.type = "内嵌";
  }
  if (content.indexOf("内挂") >= 0) {
    subtitle.type = "内挂";
  }
  if (content.indexOf("外挂") >= 0) {
    subtitle.type = "外挂";
  }

  return subtitle;
}

function matchKeywords(
  content: Positional<string>,
  result: ParseTorrentTitleResult,
  options: DefaultedOptions
) {
  const {
    keywordSeparators,
    sourceTypeMap,
    platformMap,
    videoEncodingKeywords,
    audioEncodingKeywords,
    containerKeywords,
    resolutionMap,
    colorDepthMap,
    subtitleKeywords,
  } = options;

  const entries: MatchEntry[] = [];
  mapToMatchEntry(
    entries,
    sourceTypeMap,
    result,
    PositionalItemType.SOURCE_TYPE,
    (value) => (result.source.type = value)
  );
  mapToMatchEntry(
    entries,
    platformMap,
    result,
    PositionalItemType.PLATFORM,
    (value) => (result.source.platform = value)
  );
  keywordsToMatchEntry(
    entries,
    videoEncodingKeywords,
    result,
    PositionalItemType.VIDEO_ENCODING,
    (value) => (result.format.videoEncoding = value)
  );
  keywordsToMatchEntry(
    entries,
    audioEncodingKeywords,
    result,
    PositionalItemType.AUDIO_ENCODING,
    (value) => (result.format.audioEncoding = value)
  );
  keywordsToMatchEntry(
    entries,
    containerKeywords,
    result,
    PositionalItemType.CONTAINER,
    (value) => (result.format.container = value)
  );
  mapToMatchEntry(
    entries,
    resolutionMap,
    result,
    PositionalItemType.RESOLUTION,
    (value) => (result.format.resolution = value)
  );
  mapToMatchEntry(
    entries,
    colorDepthMap,
    result,
    PositionalItemType.COLOR_DEPTH,
    (value) => (result.format.colorDepth = value)
  );
  keywordsToMatchEntry(
    entries,
    subtitleKeywords,
    result,
    PositionalItemType.SUBTITLE,
    (value) =>
      (result.subtitle = { ...result.subtitle, ...parseSubtitle(value) })
  );
  entries.push();

  let startIndex = 0;
  let i = 0;
  while (i < content.content.length) {
    if (keywordSeparators.includes(content.content[i])) {
      if (i > startIndex) {
        matchOneKeyword(
          {
            content: content.content.substring(startIndex, i),
            index: startIndex,
            length: i - startIndex,
          },
          entries,
          options
        );
      }
      startIndex = i + 1;
    }
    ++i;
  }
  if (i > startIndex) {
    matchOneKeyword(
      {
        content: content.content.substring(startIndex, i),
        index: startIndex,
        length: i - startIndex,
      },
      entries,
      options
    );
  }
}

type DefaultedOptions = Required<ParseTorrentTitleOptions>;

function mergeOptions({
  separatorPairs = [
    ["[", "]"],
    ["【", "】"],
  ],
  organizationSeparators = ["&", " x ", "\\"],
  titleSeparatorChars = ["/", "_", "\\"],
  episodePrefixSeparators = [...separatorPairs, ["★", "★"]],
  // 匹配集数位置，其中第一个group为集数，可能包含后缀
  // 只匹配1-3位，以防错误匹配到1080p等
  // 由于safari不支持lookahead和lookbehind，ff<=77不支持named capture group，
  // 所以这里最后还是采用比较基础的正则匹配
  episodeConnectorRegex = /[-~]/,
  episodeInnerRegex = /\d{1,3}([-~]\d{1,3})?/,
  episodeRegexes = [
    // - 01
    /-\s(\d{1,3}([-~]\d{1,3})?((\s?(END|合集|Fin))|(_?[vV]\d+))?)\s/,
    // [01]
    /\[(\d{1,3}([-~]\d{1,3})?((\s?(END|合集|Fin))|(_?[vV]\d+))?)\]/,
    /【(\d{1,3}([-~]\d{1,3})?((\s?(END|合集|Fin))|(_?[vV]\d+))?)】/,
    /\[第(\d{1,3}([-~]\d{1,3})?)(话|集)\]/,
    /【第(\d{1,3}([-~]\d{1,3})?)(话|集)】/,
    /第(\d{1,3}([-~]\d{1,3})?)(话|集)/,
    // 有些情况没有分隔符，为了防止混淆，只匹配 XX-XX 的情况
    /(\d{1,3}-\d{1,3})/,
  ],
  fixUnmatchedEpisodePrefix = true,
  titleNonEnglishRegex = /[\u4e00-\u9fa5]/,
  /* */
  keywordSeparators = ["[", "]", "_", "【", "】", " ", "(", ")"],
  keywordSecondarySeparators = ["-"],
  sourceTypeMap = {
    WebDL: [/^WEB-?DL$/i],
    WebRip: [/^Web-?Rip$/i],
    BDRip: [/^BD-?Rip$/i],
    Donghua: [/^Donghua$/i],
    BD: [/^BD$/],
  },
  platformMap = {
    "B-Global": [/^B-Global$/i],
    "B-THM": [],
    Bilibili: [/^bilibili$/i],
    Baha: [/^Baha$/i, /^Bahamut$/i],
    ViuTV: [/^ViuTV$/i, /^ViuTV粤语$/i],
  },
  videoEncodingKeywords = ["AVC", "HEVC", "x264", "x265"],
  audioEncodingKeywords = ["AAC", "AACx2", "FLAC"],
  containerKeywords = ["MP4", "MKV"],
  resolutionMap = {
    "1080": [/^1080p\+?$/i, /^1920x1080$/i],
    "720": [/^720p$/i, /^1280x720$/i],
    "2160": [/^2160p$/i, /^3840x2160$/i],
  },
  colorDepthMap = {
    "8-bit": [/^8-?bit$/i],
    "10-bit": [/^10-?bit$/i],
  },
  subtitleKeywords = [
    /^简繁(内封|外挂|内嵌|内挂)?(字幕)?$/,
    /^(简|繁)体(内封|外挂|内嵌|内挂)$/,
    /^(简|繁)(中|体)(内封|外挂|内嵌|内挂)?(字幕)?/,
    /^(内封|外挂|内嵌|内挂)?(简|繁)体中文(字幕)?$/,
    /^(简|繁)日(内封|外挂|内嵌|内挂)$/,
    /^(简|繁)日(双语)?(字幕)?$/,
    /^简繁日语?(外挂)?(字幕)?$/,
    /^CHS|CHT|JP|BIG5|GB$/,
  ],
}: ParseTorrentTitleOptions = {}): DefaultedOptions {
  return {
    separatorPairs,
    organizationSeparators,
    titleSeparatorChars,
    episodePrefixSeparators,
    episodeConnectorRegex,
    episodeInnerRegex,
    episodeRegexes,
    fixUnmatchedEpisodePrefix,
    titleNonEnglishRegex,
    /* */
    keywordSeparators,
    keywordSecondarySeparators,
    sourceTypeMap,
    platformMap,
    videoEncodingKeywords,
    audioEncodingKeywords,
    containerKeywords,
    resolutionMap,
    colorDepthMap,
    subtitleKeywords,
  };
}

export default function parseTorrentTitle(
  input: string,
  inputOptions?: ParseTorrentTitleOptions
): ParseTorrentTitleResult | undefined {
  const options = mergeOptions(inputOptions);

  // 首先列举几种典型标题：
  // 【幻樱字幕组】【4月新番】【间谍过家家 / 间谍家家酒 SPY×FAMILY】【12】【END】【BIG5_MP4】【1280X720】
  // [猎户随缘发布组] 女忍者椿的心事 Kunoichi Tsubaki no Mune no Uchi [12] [1080p] [简中内封] [2022年4月番]
  // 【喵萌奶茶屋】★04月新番★[夏日重现/Summer Time Rendering][12][1080p][繁日双语][招募翻译片源]
  // [Lilith-Raws] 川尻小玉的懒散生活 / Atasha Kawajiri Kodama Da yo - 22 [Baha][WEB-DL][1080p][AVC AAC][CHT][MP4]
  // [千夏字幕组&LoliHouse] 测不准的阿波连同学 / 不会拿捏距离的阿波连同学 / Aharen-san wa Hakarenai - 11 [WebRip 1080p HEVC-10bit AAC][简繁内封字幕]
  //
  // 首先，几乎所有的标题中，字幕组名称都在最前面、且具有明显的分隔符；其次，所有标题都有集数（而且之前已有比较可靠的集数提取方法）。因此我们可以简单地将
  // 整个标题拆分成四个部分： 【字幕组】【（X月新番）标题】【集数】【来源/格式/字幕信息/额外内容】
  // 注意到：
  // - 字幕组包含联合发布的情况，一般使用「&」分隔
  // - 标题前面可能带有「X月新番」
  // - 集数可能包含「v2」、「END」等，需要分辨
  // - 对于集数后的信息，有些标题将每一类信息分在不同的段中，有些则连在一起，顺序不总是确定的
  // - 格式信息有时会混在一起
  // - 最后可能会包含额外的附加内容

  const positionalItems: PositionalItem[] = [];

  const [organization, rest] = matchOrganization(
    {
      content: input,
      index: 0,
      length: input.length,
    },
    options
  );
  if (organization) {
    positionalItems.push({
      index: organization.index,
      length: organization.length,
      type: PositionalItemType.ORGANIZATION,
    });
  }

  const indexResult = matchIndex(rest, options);
  if (!indexResult) {
    return undefined;
  }

  const [beforeIndex, index, afterIndex] = indexResult;
  const title = matchTitle(beforeIndex, options);
  positionalItems.push(
    {
      index: title.index,
      length: title.length,
      type: PositionalItemType.TITLE,
    },
    {
      index: index.index,
      length: index.length,
      type: PositionalItemType.INDEX,
    }
  );

  const result: ParseTorrentTitleResult = {
    organization: organization?.content,
    title: title.content,
    index: index.content,
    source: {},
    format: {},
    subtitle: {},
    raw: input,
    positionalItems,
  };

  matchKeywords(afterIndex, result, options);

  return result;
}
