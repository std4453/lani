import { Organization } from "./types";

import {
  contextual,
  knownEntries,
  known,
  wrappedNames,
  technicalEntries,
  subtitleReleaseNames,
  videoReleaseNames,
  artistNames,
  barePrefixNames,
  knownHyphenJoints,
} from "./organizationNames";

const nameSuffix =
  /(?:字幕[组組社]|[汉漢]化[组組]|[发發]布[组組]|搬[运運][组組]|制作[组組]|工作室|压制部|手抄部|后援会|後援會|摆烂组|擺爛組|机翻组|機翻組|字幕屋|字幕團|字幕团|字幕站|字幕坊|[\w\p{Script=Han} -](?:subs?|raws?|studio|team|production|fansub)|制作)$/iu;
const joint = /\s*(?:[&＆×+、\\]|\s[xX]\s|feat\.)\s*/i;
const role =
  /(?:个人|個人)?(?:音[频頻]|视频|視頻|二次)?(?:[压壓]制|合成|封装|封裝|校[对對]|翻[译譯]|搬[运運])$/;
const roleOnly =
  /^(?:(?:个人|個人|自)?(?:音[频頻]|视频|視頻|二次)?(?:[压壓]制|合成|封装|封裝|校[对對]|翻[译譯]|搬[运運])|自[压壓]|[转轉][载載]|整理搬运|整理搬運|自购自翻自压|[转轉](?:[运運发發])?|(?:个人|個人)[汉漢]化|自[购購]|自制(?:字幕)?|个人制作合集|個人製作合集)$/;
const languageList =
  /^(?:(?:multi|dual)[-_ ]?subs?|(?:eng?|english|ger|german|jpn?|japanese|rus|russian|fre|fra|french|spa|spanish|ita|italian|por|portuguese|ara|arabic|chs|cht)[-_ ]?subs?|(?:[MD][- ]|hard[-_ ]?|soft[-_ ]?)subs?(?:\s*\([^)]*\))?|(?:CN|HK|TW|JP|EN|ENG|CHS|CHT)(?:[,，\s]+(?:CN|HK|TW|JP|EN|ENG|CHS|CHT))*(?:\s+subs?)?)$/i;
const languageDelivery =
  /^(?:eng?|english|ger|german|jpn?|japanese|rus|russian|fre|fra|french|spa|spanish|ita|italian|por|portuguese|ara|arabic|chs|cht)[-_ ]+(?:dubs?\s*(?:and|&)\s*subs?|subs?\s*(?:and|&)\s*dubs?)$/i;
const languageWord =
  /^(?:CN|HK|TW|JP|EN|ENG|CHS|CHT|eng?|english|ger|german|jpn?|japanese|rus|russian|fre|fra|french|spa|spanish|ita|italian|por|portuguese|ara|arabic|日语|日語|英语|英語|简体|簡體|繁体|繁體)$/i;
const deliveryAttribute =
  /^(?:(?:U[-_]?NEXT|NETFLIX|AMZN|AMAZON|CR|BILI(?:BILI)?|BAHA|HIDIVE|ADN|ABEMA|DSNP|DISNEY(?:PLUS)?|HULU|WETV|IQIYI)[-_ .]?(?:DL|RIP|SUBS?|DUBS?)|(?:HEVC|AVC|VVC|AV1|[XH]26[45])\d*(?:[-._](?:\d+)?bits?)?|(?:TV|OVA|OAD|SP|EP)\d+(?:[-~]\d+)?|TV|MOVIE|REMASTERED|UNCENSORED|CENSORED|HARDSUB|SOFTSUB|DUBBED|SUBBED|ORIGINAL|COMPLETE|BATCH|AUDIO|VIDEO|SUBS?|OP\d*|ED\d*|NCOP|NCED|MENU|PV|CM|SCANS?|CDS?)$/i;
// 别名和技术说明常以字幕属性结尾；这些描述不能因末尾的 Sub(s) 成为身份。
const subtitleDescription =
  /(?:^|[,，;；/]|\s)(?:multi[-_ ]?subs?|[MD]-SUB|(?:hard|soft)\s+subs?|(?:eng?|english|jpn?|japanese|spa|spanish|fre|fra|french|ger|german|ita|italian|por|portuguese|rus|russian|ara|arabic)[-_ ]subs?)(?:\b|$)|[,，]\s*subs?$|(?:^|[,，;；/]|\s)dual[-_ ]?subs?(?=\s*(?:$|[,，;；/]))/i;
// 完整职责和交付说明不因 Sub(s) 后缀成为品牌；复合品牌仍保留。
const anonymousOrDelivery =
  /^(?:OCR|(?:subs?|subtitles?)\s+only|(?:ASS|SRT)\s+scripts?|XML\s+chapter\s+files|ripped[-_ ]?subs?|honorifics|(?:english|eng|japanese|jpn|german|ger|french|fre|spanish|spa)[-_ ]+fansubs?|(?:Netflix|Daisuki)(?:\s+subs?)?|WEBSTEAM)$/i;
const versionLabel = /^(?:TV|全遮|(?:轻微|輕微)?修正|(?:完全)?[无無]修)版$/i;
const compactCredit =
  /^[\p{Script=Latin}\p{N}][\p{Script=Latin}\p{M}\p{N}._'’\-]*$/u;
// 只匹配完整的编码、声道与位深字段，不按编码前缀排除含数字的品牌。
const technicalCompound =
  /^(?:(?:AAC|FLAC|OPUS|LPCM|PCM|ATMOS|AC-?3|E-?AC-?3|DDP?|DTS(?:[._-]?HD)?(?:[._-]?(?:MA|HRA))?)(?:[._-]?[1-9](?:\.[01])?(?:ch)?)?(?:[._-]?(?:8|16|24|32)[._-]?bits?)?|(?:HEVC|AVC|VVC|AV1|[XH][._-]?26[45])(?:[._-]?(?:8|10|12|16)[._-]?bits?)?)$/i;

function isVersionCombination(text: string): boolean {
  const parts = text.split(joint).map((part) => part.trim());
  return (
    parts.length > 1 &&
    parts.some((part) => versionLabel.test(part)) &&
    parts.every((part) => /^[^\s&＆×+、\\]{1,20}版$/.test(part))
  );
}

const creditLabel = /^(?:collected|encoded|released|translated|subbed)_by_/i;
const promotion =
  /(?:新年|新春|春[节節]|(?:[一二三四五六七八九十百]+|\d+)周年)(?:[献獻][礼禮]|[纪紀]念)?$/;
const subtitleSource =
  /^(?:(?:采用|採用|使用)(?=.+字幕$)|字幕(?:来源|來源)[:：])\s*/;
const personalCredit = /(?:个人|個人)(?:[汉漢]化|翻[译譯]|[压壓]制)$/;
const explicitLabel =
  /^(?:字幕[组組]?|制作[组組]?|[发發]布[组組]?|压制[组組]?|壓制[组組]?|[汉漢]化[组組]?|fansub|release(?:\s+by)?|encoded\s+by|subtitles?\s+by)\s*[:：]\s*/i;

interface Block {
  text: string;
  start: number;
  end: number;
  open: number;
  close: number;
  round: boolean;
}

// Dual-Subs之后仅有完整技术或语言字段时仍为交付属性，未知品牌尾部不吞。
function isDualSubtitleField(text: string): boolean {
  const field = text.match(/^dual[-_ ]?subs?(?:[-_ .]([\s\S]*))?$/i);
  if (!field) return false;
  const suffix = field[1]?.replace(/^[-_ .]+/, "").trim();
  if (!suffix) return true;
  if (technicalCompound.test(suffix) || languageWord.test(suffix)) return true;
  // 点号可分隔字段；编码声道与位深中的数字点号仍留在同一字段。
  const attributes = suffix
    .split(/[-_+\s]+|(?<!\d)\.|\.(?!\d)/)
    .filter(Boolean);
  return (
    attributes.length > 0 &&
    attributes.every(
      (attribute, index) =>
        technicalCompound.test(attribute) ||
        languageWord.test(attribute) ||
        (/^HD$/i.test(attribute) &&
          /^DTS$/i.test(attributes[index - 1] ?? "")) ||
        (/^(?:MA|HRA)$/i.test(attribute) &&
          /^HD$/i.test(attributes[index - 1] ?? "") &&
          /^DTS$/i.test(attributes[index - 2] ?? "")) ||
        /^(?:\d{3,4}[pi]|\d{3,4}[x×]\d{3,4}|[248]K|(?:8|10|12|16|24|32)bits?|BD(?:RIP|REMUX)?|WEB(?:DL|RIP)?|DL|RIP|BLURAY|BLU|RAY|DVD(?:RIP)?|UHD|HDR\d*|SDR|MKV|MP4|REMUX|SUBS?|SUBTITLES?|DUBS?)$/i.test(
          attribute
        )
    )
  );
}

function isSubtitleDestination(text: string): boolean {
  const destination = text.match(/^subtitle[-_](.+)$/i);
  return !!destination && videoReleaseNames.has(destination[1].toLowerCase());
}

function isMetadata(text: string): boolean {
  const fragments = text.split(joint);
  if (
    fragments.length > 1 &&
    fragments.every((part) => isMetadata(part.trim()))
  )
    return true;
  return (
    !text ||
    anonymousOrDelivery.test(text) ||
    deliveryAttribute.test(text) ||
    /^Hi(?:8|10|12)p$/i.test(text) ||
    isSubtitleDestination(text) ||
    isDualSubtitleField(text) ||
    /^\/?(?:img|url)(?:=.*)?$/i.test(text) ||
    /^[网網][盘盤](?:下载|下載)$/.test(text) ||
    isVersionCombination(text) ||
    /^(?:全集|(?:剩|余|餘)[一二三四五六七八九十\d]+[集话話]完[结結]|恭喜[复復]播)$/.test(
      text
    ) ||
    /^(?:国|國|英|日|中|简|簡|繁|粤|粵|韩|韓){1,8}(?:双语|雙語|多语|多語|中字|字幕)$/.test(
      text
    ) ||
    /^(?:台|臺|中|国|國|粤|粵|港|日|英|韩|韓)配(?:版)?$/.test(text) ||
    /^(?:ViuTV|TVB|Baha|代理商)(?:粤语|粵語|国语|國語)$/i.test(text) ||
    /^(?:v(?:er\.?)?\d+(?:\.\d+)*|BDMV|全\d+[集话話]|[网網][盘盤](?:[资資]源)?|(?:TV|全遮|(?:轻微|輕微)?修正|(?:完全)?[无無]修)版|CUSTOM|PROPER|REPACK|INTERNAL|BATCH)$/i.test(
      text
    ) ||
    /^(?:ANZX|ANZB)[-_]?\d{4,6}(?:[-~]\d{1,6})?$/i.test(text) ||
    /\bver\.$/i.test(text) ||
    languageList.test(text) ||
    languageDelivery.test(text) ||
    /^JPN$/i.test(text) ||
    /^Vol\.?\s*\d+(?:\s*[-~]\s*\d+)?(?:\s+FIN)?$/i.test(text) ||
    (subtitleDescription.test(text) &&
      (/[,，;；]/.test(text) ||
        /^(?:(?:multi|dual)[-_ ]?|[MD]-|hard\s+|soft\s+)/i.test(text))) ||
    /^(?:RAW|DVDISO|\d+DVDISO|[0-9A-F]{8})$/i.test(text) ||
    /^(?:(?:fixed|corrected|repaired)[-_ ](?:audio|video|subs?|subtitles?)|(?:audio|video|subs?|subtitles?)[-_ ](?:fix|fixed|corrected|repaired))$/i.test(
      text
    ) ||
    /^(?:BT|磁力|种子|種子|迅雷)[\s_-]?(?:下载|下載)(?:$|[\s:：])/i.test(
      text
    ) ||
    roleOnly.test(text) ||
    /^(?:简|簡|繁|日语|日語|粤语|粵語|国语|國語|中文|中字|多国|多國|英语|英語|内封|内嵌|内挂|外挂|外掛)/.test(
      text
    ) ||
    /^(?:国漫$|國漫$|日漫$|动漫$|動畫$|动画$|剧场版$|劇場版$|电影$|電影$|合集$|整理搬[运運]|無字幕|无字幕|无水印|高清|持续更新|招聘|招募)/.test(
      text
    ) ||
    /^(?:\d{1,4}[月年]|\d{4}[.年/-]|新番|完结|完結|先行|重[发發]|招募|招[聘收]|广告|廣告|公众号|公眾號|https?:|www\.)/i.test(
      text
    ) ||
    /^(?:(?:第)?\d+(?:\.\d+)?(?:\s*[-~～–]\s*\d+)?(?:[集话話]|END|FIN)?|(?:S\d+)?E(?:P)?\d+|OVA|OAD|SP|END|FIN)$/i.test(
      text
    ) ||
    /^(?:\d{3,4}[pi+]?|\d{3,4}[x×]\d{3,4}|[248]K)(?:\b|_|$)/i.test(text) ||
    /^(?:WEB(?:[-_. ]?(?:DL|RIP))?|BLU[-_. ]?RAY|BD(?:RIP|REMUX)?|DVD(?:RIP)?|UHD|HDR\d*|HEVC|AVC|[HX][ ._-]?26[45]|AAC|FLAC|OPUS|ATMOS|AC3|EAC3|DDP|MKV|MP4|10[- ]?bit|8[- ]?bit|CHS|CHT|GB|BIG5|简|簡|繁|日语|日語|粤语|粵語|国语|國語|中[文日]|多国|多國|英语|英語|ENG(?:SUB)?|内[封嵌挂掛]|外[挂掛]|Baha|Bilibili|B-Global|B-THM|ViuTV|TVB|ABEMA|AMZN|Netflix|IQIYI|CR|NF|AT-X)(?:[-+]|_|\s|$)/i.test(
      text
    )
  );
}

function cleanPart(text: string, roleContext: boolean): string {
  let value = text
    .trim()
    .replace(explicitLabel, "")
    .replace(creditLabel, "")
    .trim();
  // “个人”明确引出职责；“压制”等独立署名后缀仍按完整身份保留。
  value = value
    .replace(/(?:个人|個人)(?:[汉漢]化|翻[译譯]|[压壓]制)$/, "")
    .trim();
  const withoutPromotion = value.replace(promotion, "").trim();
  if (withoutPromotion && strongName(withoutPromotion))
    value = withoutPromotion;
  if (roleOnly.test(value)) return "";
  // 职责后缀与组名分开；词典中本来以“压制”命名的发布者保留原名。
  const withoutRole = value
    .replace(/自[购購]$/, "")
    .replace(role, "")
    .trim();
  if (
    !known.has(value.toLowerCase()) &&
    (roleContext || /自[购購]$/.test(value) || strongName(withoutRole))
  )
    value = withoutRole;
  return value;
}

function strongName(text: string): boolean {
  return (
    known.has(text.toLowerCase()) ||
    (/^[^\s@\[\]【】]+@[A-Za-z0-9][A-Za-z0-9._-]*$/.test(text) &&
      !/^\d{3,4}[pi]?@\d+(?:\.\d+)?fps$/i.test(text)) ||
    (!deliveryAttribute.test(text) &&
      !isSubtitleDestination(text) &&
      !anonymousOrDelivery.test(text) &&
      !languageList.test(text) &&
      !languageDelivery.test(text) &&
      !subtitleDescription.test(text) &&
      nameSuffix.test(text.replace(/\s*[（(][^）)]*[）)]$/, "")) &&
      !/^(?:\d{3,4}(?:[pi]|(?=\s|_|$))|[248]K|WEB(?:[-_. ]?(?:DL|RIP))?|BLU[-_. ]?RAY|BD(?:RIP|REMUX)?|DVD(?:RIP)?|UHD|HDR\d*|HEVC|AV1|AVC|AAC|FLAC|OPUS|LPCM|PCM|ATMOS|[HX][ ._-]?26[45])(?:\b|_|\s|$)/i.test(
        text
      ))
  );
}

function plausibleName(text: string): boolean {
  return (
    text.length > 0 &&
    text.length <= 64 &&
    (!isMetadata(text) ||
      strongName(text) ||
      wrappedNames.has(text.toLowerCase())) &&
    !/[\/／|｜:：<>\[\]【】]/.test(text) &&
    !/\b(?:S\d{1,2}E\d+|EP\d+|season\s+\d+|episode\s+\d+)\b/i.test(text)
  );
}

function compactIdentity(text: string): boolean {
  return (
    compactCredit.test(text) &&
    !isMetadata(text) &&
    !languageWord.test(text) &&
    !deliveryAttribute.test(text) &&
    !technicalCompound.test(text) &&
    !/^(?:DTS(?:HD)?|HD|MA|HRA|DualAudio|MultiAudio)$/i.test(text)
  );
}

function partsOf(text: string): string[] {
  // Patch 是修改职责，混流描述则明确命名两个实际素材来源。
  const patchSource = text.match(/^patch\s+for\s+(.+)$/i);
  if (patchSource && subtitleReleaseNames.has(patchSource[1].toLowerCase()))
    return [patchSource[1]];
  const patched = text.match(/^(.+?)-Patch\s+(.+)$/i);
  if (patched && strongName(patched[1]) && compactIdentity(patched[2]))
    return [...partsOf(patched[1]), ...partsOf(patched[2])];
  const muxed = text.match(/^(.+?\S)\s+muxed\s+with\s+(.+?\S)\s+raws?$/i);
  if (muxed && [muxed[1], muxed[2]].every(compactIdentity))
    return [muxed[1], muxed[2]];
  const edited = text.match(/^edited[-_ ]+(.+)$/i);
  if (edited && subtitleReleaseNames.has(edited[1].toLowerCase()))
    return partsOf(edited[1]);
  const sourceSubs = text.match(/^(.+?\S)\s+subs?$/i);
  if (sourceSubs && known.has(sourceSubs[1].toLowerCase()))
    return [sourceSubs[1]];
  if (subtitleSource.test(text))
    text = text.replace(subtitleSource, "").replace(/字幕$/, "").trim();
  if (isVersionCombination(text)) return [];
  if (known.has(text.trim().toLowerCase())) return [text.trim()];
  // 空格包围的横线仅在两边都有独立身份依据时拆分，保留组名内部连字符。
  const spacedParts = text.replace(explicitLabel, "").split(/\s+[-–]\s+/);
  if (spacedParts.length > 1 && spacedParts.every(strongName))
    return spacedParts;
  // 斜杠也用于作品别名；只有两边都明确为制作身份时才拆联合署名。
  const slashParts = text.replace(explicitLabel, "").split(/\s*[/／]\s*/);
  if (slashParts.length > 1 && slashParts.every(strongName)) return slashParts;
  // 末尾的加号可能属于品牌；只有两侧都有身份时才是联合分隔符。
  const trailingDecoration = text.match(/\++$/)?.[0] || "";
  const fragments = text
    .slice(0, text.length - trailingDecoration.length)
    .split(joint);
  if (trailingDecoration && fragments.length)
    fragments[fragments.length - 1] += trailingDecoration;
  const roleContext = fragments.some((part) => roleOnly.test(part.trim()));
  return fragments
    .map((part) => cleanPart(part, roleContext))
    .flatMap((part) =>
      knownHyphenJoints.has(part.toLowerCase()) ? part.split("-") : [part]
    )
    .filter((part) => plausibleName(part));
}

/** 独立解析发布者，不参与作品名、集数和字幕解析。未标注发布者时返回 undefined。 */
export function parseTorrentOrganization(
  input: string
): Organization | undefined {
  const blocks: Block[] = [];
  const bracket =
    /\[([^\[\]]*)\]|【([^【】]*)】|\(([^()]*)\)|（([^（）]*)）|「([^「」]*)」/g;
  let match: RegExpExecArray | null;
  while ((match = bracket.exec(input))) {
    const text = match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5];
    const leading = text.length - text.trimStart().length;
    blocks.push({
      text: text.trim(),
      open: match.index,
      close: match.index + match[0].length,
      round:
        match[3] !== undefined ||
        match[4] !== undefined ||
        match[5] !== undefined,
      start: match.index + 1 + leading,
      end: match.index + 1 + text.trimEnd().length,
    });
  }
  // 明示字幕说明按角色字段扫描，避免作者文本和空白正则互相回溯。
  const subtitleFields: {
    start: number;
    end: number;
    destination: boolean;
  }[] = [];
  const subtitleHeaders: {
    open: number;
    start: number;
    role: string;
  }[] = [];
  for (const header of input.matchAll(
    /\b(?:subs?|subtitles?)(?:\s*\+\s*fonts?)?\b/gi
  )) {
    const afterHeader = header.index! + header[0].length;
    const firstRole = input
      .slice(afterHeader)
      .match(/^\s+(?:(by|from|for)\b|source\s*[:：])/i);
    if (!firstRole) continue;
    subtitleHeaders.push({
      open: header.index!,
      start: afterHeader + firstRole[0].length,
      role: firstRole[1]?.toLowerCase() ?? "source",
    });
  }
  let subtitleBlockIndex = 0;
  let subtitleClauseEnd = 0;
  for (let index = 0; index < subtitleHeaders.length; index++) {
    const { open, start, role } = subtitleHeaders[index];
    // 同一说明内的Subs可属于作者名，内部只按角色边界拆分字段。
    if (open < subtitleClauseEnd) continue;
    let end = input.length;
    const boundary = input
      .slice(start, end)
      .search(
        /\.(?:zip|7z|rar|srt|ass|mkv|mp4|torrent)(?:\.torrent)?\s*$|[;\n]/i
      );
    if (boundary >= 0) end = start + boundary;
    // 目标自身的名字包装不结束说明，完整技术块则结束其作用域。
    while (
      subtitleBlockIndex < blocks.length &&
      blocks[subtitleBlockIndex].open < start
    )
      subtitleBlockIndex++;
    for (
      let blockIndex = subtitleBlockIndex;
      blockIndex < blocks.length;
      blockIndex++
    ) {
      const block = blocks[blockIndex];
      if (block.open >= end) break;
      if (isMetadata(block.text)) {
        end = block.open;
        break;
      }
    }
    subtitleClauseEnd = end;
    const roles = [{ start, role }];
    for (const role of input
      .slice(start, end)
      .matchAll(/\s(by|from|for)(?=\s|$)/gi)) {
      const nextStart = start + role.index!;
      subtitleFields.push({
        start: roles[roles.length - 1].start,
        end: nextStart,
        destination: roles[roles.length - 1].role === "for",
      });
      roles.push({
        start: nextStart + role[0].length,
        role: role[1].toLowerCase(),
      });
    }
    subtitleFields.push({
      start: roles[roles.length - 1].start,
      end,
      destination: roles[roles.length - 1].role === "for",
    });
  }
  const subtitleDestinations = subtitleFields.filter(
    (field) => field.destination
  );
  for (const target of input.matchAll(
    /\b(?:re[- ]?timed?\s+(?:for|to)|timed?\s+to|chapters\s+for\s+DCP)\s+/gi
  )) {
    const start = target.index!;
    const boundary = input
      .slice(start)
      .search(/\.(?:ass|srt|zip|7z|rar)\b|[;\n]/i);
    let end = boundary < 0 ? input.length : start + boundary;
    const technical = blocks.find(
      (block) =>
        block.open >= start && block.open < end && isMetadata(block.text)
    );
    if (technical) end = technical.open;
    subtitleDestinations.push({ start, end, destination: true });
  }
  const discScene = input.match(
    /\[(?:JPN?|ENG?|CH[ST]|US|USA|EU)\]\s*-\s*([\p{L}\p{N}][\p{L}\p{M}\p{N}._-]*?)(?:\.(?:mkv|mp4|iso|torrent))?$/iu
  );
  const discDelivery = blocks.some((block) =>
    /^(?:BDMV|DVDISO|UHD|BDREMUX)$/i.test(block.text)
  );
  const selected: { start: number; end: number; parts: string[] }[] = [];
  let hasTitle = false;
  let cursor = 0;
  // 缺失首个左括号时，用紧邻的完整信息块恢复前署名，不跨过作品正文。
  const incompletePrefix = input.match(/^([^\[\]【】\s]{1,64})\](?=\s*\[)/);
  const incompleteFollowing = incompletePrefix
    ? input.slice(incompletePrefix[0].length).replace(bracket, "").trim()
    : "";
  if (
    incompletePrefix &&
    plausibleName(incompletePrefix[1]) &&
    ((incompleteFollowing && !isMetadata(incompleteFollowing)) ||
      blocks.some((block) => !isMetadata(block.text)))
  ) {
    selected.push({
      start: 0,
      end: incompletePrefix[1].length,
      parts: [incompletePrefix[1]],
    });
    cursor = incompletePrefix[0].length;
  }
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index];
    const before = input
      .slice(cursor, block.open)
      .replace(/^[^\[【]*[\]】]/, (prefix) =>
        roleOnly.test(prefix.slice(0, -1).trim()) ? "" : prefix
      )
      .replace(/[\u200b\ufeff★☆_\s&＆×+、]/g, "");
    if (before && !isMetadata(before) && !/^[（(][^）)]*[）)]$/.test(before))
      hasTitle = true;
    if (
      subtitleDestinations.some(
        (target) => block.start >= target.start && block.end <= target.end
      )
    ) {
      cursor = block.close;
      continue;
    }
    const blockLower = block.text.toLowerCase();
    const technicalCredit = technicalEntries.find(({ name, lower }) => {
      const offset = blockLower.indexOf(lower);
      return (
        offset > 0 &&
        /\s/.test(block.text.charAt(offset - 1)) &&
        (offset + name.length === block.text.length ||
          /\s/.test(block.text.charAt(offset + name.length))) &&
        isMetadata(block.text.slice(0, offset).trim()) &&
        isMetadata(block.text.slice(offset + name.length).trim())
      );
    });
    if (technicalCredit) {
      const start = block.start + blockLower.indexOf(technicalCredit.lower);
      const end = start + technicalCredit.name.length;
      selected.push({
        start,
        end,
        parts: [input.slice(start, end)],
      });
      cursor = block.close;
      continue;
    }
    const subtitleList = block.text.match(/\bsubs?\s+-\s+(.+)$/i);
    if (subtitleList) {
      const names = subtitleList[1].split(/\s*,\s*/);
      if (
        names.length &&
        names.every((name) => known.has(name.toLowerCase()))
      ) {
        const start = block.start + block.text.lastIndexOf(subtitleList[1]);
        selected.push({ start, end: block.end, parts: names });
        cursor = block.close;
        continue;
      }
    }
    const parts = partsOf(block.text);
    const labelled =
      explicitLabel.test(block.text) ||
      creditLabel.test(block.text) ||
      subtitleSource.test(block.text) ||
      personalCredit.test(block.text);
    const requiresLeadingContext = parts.some(
      (part) => part === "推しの子" || /^\p{Script=Han}{1,2}$/u.test(part)
    );
    const strong =
      parts.length > 0 &&
      (knownHyphenJoints.has(blockLower) ||
        parts.every(
          (part) =>
            strongName(part) ||
            (wrappedNames.has(part.toLowerCase()) &&
              ((!languageWord.test(part) && !/^NF$/i.test(part)) || !hasTitle))
        )) &&
      (!requiresLeadingContext || (!hasTitle && !selected.length));
    let followingTitle = false;
    for (let following = index + 1; following <= blocks.length; following++) {
      const previous = blocks[following - 1];
      const next = blocks[following];
      const gap = input
        .slice(previous.close, next?.open ?? input.length)
        .trim();
      if (
        gap.replace(/[★☆_\s&＆×+、]/g, "") &&
        !isMetadata(gap) &&
        !(discScene && discDelivery && previous.open === discScene.index)
      ) {
        followingTitle = true;
        break;
      }
      if (next && /^(?:19|20)\d{2}$/.test(next.text)) continue;
      if (
        next &&
        /^(?:(?:第)?\d+(?:[-~～–.]\d+)?(?:集|话|話|END|FIN)?|S\d+E\d+|EP?\d+|OVA|OAD|SP)$/i.test(
          next.text
        )
      )
        break;
      if (next && !isMetadata(next.text)) {
        followingTitle = !roleOnly.test(next.text);
        break;
      }
    }
    // 只有后面另有作品内容，才把无特征词的首部片段当作发布者；[作品][01]不满足。
    const structural =
      !block.round && !hasTitle && !selected.length && followingTitle;
    const unambiguousStrong =
      strong && (!requiresLeadingContext || followingTitle);
    // 发行信息之后的末尾方括号允许紧凑拉丁署名；中文身份仍需词典或组名后缀。
    const hyphenParts = block.text.split("-");
    // 已知大写短署名可帮助辨认复合尾签；连字符本身不足以断定成员独立。
    const anchoredCompound =
      parts.length === 1 &&
      hyphenParts.length > 1 &&
      hyphenParts.some(
        (part) => /^[A-Z0-9]{2,}$/.test(part) && known.has(part.toLowerCase())
      ) &&
      hyphenParts.every(compactIdentity);
    const trailingJoint =
      !block.round &&
      hasTitle &&
      (anchoredCompound ||
        (parts.length > 1 &&
          /[&＆+]/.test(block.text) &&
          block.text.split(joint).length === parts.length)) &&
      parts.every(
        (part) =>
          compactCredit.test(part) &&
          !languageWord.test(part) &&
          !deliveryAttribute.test(part)
      ) &&
      (/(?:\b(?:S\d+|EP?\s*\d+|\d{3,4}p|HEVC|AVC|AAC|WEB[- .]?DL|BDRIP)\b|\s-\s*\d+\b)/i.test(
        input.slice(0, block.open)
      ) ||
        blocks
          .slice(0, index)
          .some((previous) =>
            /^(?:\d{1,3}(?:[-~]\d{1,3})?|S\d+E\d+|EP?\s*\d+)$/i.test(
              previous.text
            )
          )) &&
      blocks
        .slice(index + 1)
        .every((following) => isMetadata(following.text)) &&
      /^\s*(?:\.(?:mkv|mp4|avi|torrent))*\s*$/i.test(
        input.slice(block.close).replace(bracket, "")
      );
    if (
      parts.length &&
      (labelled || unambiguousStrong || structural || trailingJoint)
    ) {
      selected.push({ start: block.start, end: block.end, parts });
    } else if (!isMetadata(block.text)) {
      hasTitle = true;
    }
    cursor = block.close;
  }

  // 无括号前缀只接受有明确组名词或已知发布者，避免吞掉普通作品标题。
  const leading = input.replace(/^[\s\u200b\ufeff]+/, "");
  const leadingLower = leading.toLowerCase();
  const knownPrefix = knownEntries.find(
    ({ name, lower }) =>
      leadingLower.startsWith(lower) &&
      /^[\s★☆『\[【-]/.test(leading.slice(name.length)) &&
      (nameSuffix.test(name) ||
        barePrefixNames.has(lower) ||
        /^\s*[★☆『\[【-]/.test(leading.slice(name.length))) &&
      (!/^\p{Script=Han}{1,2}$/u.test(name) ||
        /^[★☆『\[【]/.test(leading.slice(name.length)))
  )?.name;
  const namedPrefix = leading.match(
    /^([^\[【★☆『』]{1,64}?(?:字幕[组組社]|[汉漢]化[组組]|[发發]布[组組]|搬[运運][组組]|制作[组組]|工作室|[-_]Raws|[-_]Team|Subs?|Studio))(?=[\s★☆『\[【])/i
  );
  const prefix = knownPrefix
    ? leading.slice(0, knownPrefix.length)
    : namedPrefix?.[1];
  if (
    prefix &&
    !/\s[-–]|\b(?:S\d+|E(?:P)?\d+|\d{3,4}p|AAC|FLAC|WEB|HEVC|AVC)\b/i.test(
      prefix
    ) &&
    !/\b\d+\s+subs?$/i.test(prefix) &&
    !(
      /\s+subs?$/i.test(prefix) &&
      /^\s+(?:only|for|by|from|source)\b/i.test(leading.slice(prefix.length))
    )
  ) {
    const parts = partsOf(prefix);
    const prefixEnd = input.indexOf(prefix) + prefix.length;
    const followingText = input
      .slice(prefixEnd)
      .replace(bracket, "")
      .replace(
        /\.(?:ass|srt|zip|7z|rar|torrent|mkv|mp4)(?:\.torrent)?\s*$/i,
        ""
      )
      .replace(/^[★☆\s-]+/, "")
      .trim();
    // 多词 Sub(s) 也可能是作品加字幕说明；独立标题包装或星号、横线才提供边界。
    const separatedTitle =
      /^\s*[★☆『\[【-]/.test(input.slice(prefixEnd)) &&
      ((!!followingText && !isMetadata(followingText)) ||
        blocks.some(
          (block) =>
            block.open >= prefixEnd &&
            !isMetadata(block.text) &&
            !strongName(block.text) &&
            !wrappedNames.has(block.text.toLowerCase())
        ));
    if (
      parts.length &&
      parts.every(
        (part) =>
          strongName(part) &&
          (known.has(part.toLowerCase()) ||
            !/\s+subs?$/i.test(part) ||
            separatedTitle)
      )
    ) {
      const start = input.indexOf(prefix);
      selected.unshift({ start, end: start + prefix.length, parts });
    }
  }
  // 组织名词与后续作品有明确分隔时，保留片头已有发布者之后的制作方。
  const productionCredit = input.match(
    /(?:^|[\]】]\s*)([\p{L}\p{N}][\p{L}\p{M}\p{N} .'-]{0,80} Animation Study Group)\s+[-–]\s+(?=\S)/iu
  );
  if (productionCredit) {
    const start =
      productionCredit.index! +
      productionCredit[0].indexOf(productionCredit[1]);
    selected.push({
      start,
      end: start + productionCredit[1].length,
      parts: [productionCredit[1]],
    });
  }
  // by/from/source明确署名允许未知紧凑身份，不依赖已知名单或Sub后缀。
  for (const field of subtitleFields) {
    if (field.destination) continue;
    const raw = input.slice(field.start, field.end);
    const name = raw.replace(/[\[\]【】()（）「」]/g, "").trim();
    const parts = partsOf(name).filter((part) => !technicalCompound.test(part));
    if (
      !parts.length ||
      !parts.every((part) => strongName(part) || compactIdentity(part))
    )
      continue;
    let start = field.start + raw.length - raw.trimStart().length;
    let end = field.end - (raw.length - raw.trimEnd().length);
    // 整个名字的一层包装沿用普通署名块的原文范围。
    const wrapped = blocks.find(
      (block) => block.open === start && block.close === end
    );
    if (wrapped) {
      start = wrapped.start;
      end = wrapped.end;
    }
    for (let index = selected.length - 1; index >= 0; index--) {
      if (selected[index].start >= start && selected[index].end <= end)
        selected.splice(index, 1);
    }
    selected.push({ start, end, parts });
  }
  // 裸署名仍需职责或演出者分隔，不能把任意已知词从作品正文中抽出。
  for (const { name, lower } of knownEntries) {
    let offset = input.toLowerCase().indexOf(lower);
    while (offset >= 0) {
      const end = offset + name.length;
      const before = input.slice(0, offset);
      const after = input.slice(end);
      const boundary = !before || /[\s_\[【(#-]$/.test(before);
      const roleAfter =
        /^\s+(?:(?:english|eng|japanese|jpn)\s+)?(?:subs?|subtitles?|OCR)\b/i.test(
          after
        );
      const possessiveSource =
        subtitleReleaseNames.has(lower) &&
        /subtitles?\s+patch\s+for\s*$/i.test(before) &&
        /^['’]s\s/.test(after);
      const songContribution = /^Song\s*&\s*[A-Za-z0-9-]+Dialogue\b/.test(
        after
      );
      const namedCreatorPrefix =
        barePrefixNames.has(lower) &&
        /^\s/.test(after) &&
        (!before.trim() || /[\]】]\s*$/.test(before));
      const performer =
        artistNames.some((artist) => artist.toLowerCase() === lower) &&
        /^(?:\s+[-–]\s+)/.test(after) &&
        (!before.trim() || /[\]】]\s*$/.test(before));
      const namedHash =
        /#$/u.test(before) && /^(?:\.[a-z0-9]+)*\s*$/i.test(after);
      if (
        boundary &&
        (roleAfter ||
          possessiveSource ||
          songContribution ||
          namedCreatorPrefix ||
          performer ||
          namedHash) &&
        !subtitleDestinations.some(
          (field) => offset >= field.start && end <= field.end
        ) &&
        !selected.some((item) => item.start <= offset && item.end >= end)
      )
        selected.push({
          start: offset,
          end,
          parts: [input.slice(offset, end)],
        });
      offset = input.toLowerCase().indexOf(lower, offset + name.length);
    }
  }
  // by 明确引出卡拉OK制作人；普通作品内的 by 不提供这种身份边界。
  for (const credit of input.matchAll(
    /(?:^|[_\s])karaoke[_ ]+by[_ ]+([\p{L}\p{N}][\p{L}\p{M}\p{N}_'-]*)(?=\.(?:avi|mkv|mp4)|[\s[（(]|$)/giu
  )) {
    const start = credit.index! + credit[0].lastIndexOf(credit[1]);
    selected.push({ start, end: start + credit[1].length, parts: [credit[1]] });
  }
  // Scene 尾签紧接编码/音轨标记；其后允许独立的别名、语言括注及文件属性。
  const sceneContainers = [
    ...blocks,
    ...subtitleFields.filter((field) => !field.destination),
  ];
  const scenes = input.matchAll(
    /(?:^|[\s._\])])(?:AAC|FLAC|OPUS|LPCM|PCM|ATMOS|AC-?3|E-?AC-?3|DDP?|DTS(?:[- ._]HD)?(?:[. _-](?:MA|HRA))?|AV1|AVC|HEVC|[xXhH][ ._-]?26[45]|(?:8|10|12)[- ]?bit|(?:DUAL|MULTI)[-_. ]?AUDIO)(?:[. _]?\d(?:\.\d)?(?:ch)?)?(?:[. _]+(?:MULTi|DUAL)(?!-Audio))?(?:[- ._]+(?:8|10|12)[- ]?bits?)?\s*-\s*([\p{L}\p{N}][\p{L}\p{M}\p{N}._-]*?)(?:\.(?:mkv|mp4|avi|torrent))?(?=$|[\s\[【(（\]】)）])/giu
  );
  for (const scene of scenes) {
    // 编码后的语言列表若继续接音轨编码或字幕职责，属于语言属性。
    const languageAudio =
      /^(?:ita|italian|fra|fre|french|spa|spanish|eng?|english|jpn?|japanese|ger|german|rus|russian|por|portuguese)$/i.test(
        scene[1]
      ) &&
      /^(?:[\s._-]+(?:ita|italian|fra|fre|french|spa|spanish|eng?|english|jpn?|japanese|ger|german|rus|russian|por|portuguese))*[\s._-]+(?:AAC|FLAC|OPUS|LPCM|PCM|ATMOS|AC-?3|E-?AC-?3|DDP?|DTS|subs?|subtitles?|dubs?|dubbed)(?:\b|\d)/i.test(
        input.slice(scene.index! + scene[0].length)
      );
    if (
      !languageAudio &&
      !technicalCompound.test(scene[1]) &&
      !(
        /(?:DUAL|MULTI)[-_. ]?AUDIO|LPCM|ATMOS/i.test(scene[0]) &&
        scene[1].split(/[-_.+]/).every((part) => languageWord.test(part))
      ) &&
      (!isMetadata(scene[1]) || strongName(scene[1])) &&
      !/^(?:NOGRP|NoGroup|(?:HD(?:[.-](?:MA|HRA))?|MA|HRA)(?:[._-]?\d(?:\.\d)?(?:ch)?)?|HI|LC|HE|AC-?3|E-?AC-?3|AAC|FLAC|OPUS|LPCM|PCM|ATMOS|AV1|AVC|HEVC|Subs?|\d+(?:\.\d+)*(?:ch)?|\d+bits?|yuv\d+(?:p\d+)?|HDR\d*|SDR)$/i.test(
        scene[1]
      ) &&
      !/^(?:yuv\d+(?:p\d*)?|(?:\d+)?bits?|trellis\d+|HDMA(?:\d(?:\.\d)?(?:ch)?)?)(?:[._-](?:AAC|FLAC|OPUS|LPCM|PCM|AVC|HEVC))*$/i.test(
        scene[1]
      )
    ) {
      const start = scene.index! + scene[0].lastIndexOf(scene[1]);
      const end = start + scene[1].length;
      // 字幕交付字段内已解析出独立scene时，整块不再同时充当发布者。
      const deliveryContainer = sceneContainers.find(
        (block) =>
          block.start < start &&
          block.end >= end &&
          isDualSubtitleField(
            input
              .slice(block.start, start)
              .trim()
              .replace(/[-_\s.]+$/, "")
          ) &&
          isDualSubtitleField(`Dual-Subs ${input.slice(end, block.end)}`)
      );
      if (deliveryContainer) {
        for (let index = selected.length - 1; index >= 0; index--) {
          if (
            selected[index].start >= deliveryContainer.start &&
            selected[index].end <= deliveryContainer.end &&
            selected[index].start <= start &&
            selected[index].end >= end
          )
            selected.splice(index, 1);
        }
      }
      selected.push({ start, end, parts: [scene[1]] });
    }
  }
  // 原盘交付以地区/语言块结束时，也允许其后显式连字符引出的 scene 署名。
  if (
    discScene &&
    discDelivery &&
    plausibleName(discScene[1]) &&
    !languageWord.test(discScene[1]) &&
    !deliveryAttribute.test(discScene[1]) &&
    !/^(?:NOGRP|NoGroup)$/i.test(discScene[1])
  ) {
    const start = discScene.index! + discScene[0].lastIndexOf(discScene[1]);
    selected.push({
      start,
      end: start + discScene[1].length,
      parts: [discScene[1]],
    });
  }
  // 按已核实身份匹配有分隔的裸尾签，不把它与某个作品绑定。
  let tail = input
    .trimEnd()
    .replace(/\.(?:mkv|mp4|avi|torrent|pdf|epub)$/i, "");
  for (let index = blocks.length - 1; index >= 0; index--) {
    const block = blocks[index];
    if (
      block.close === tail.length &&
      (isMetadata(block.text) ||
        selected.some(
          (item) => item.start === block.start && item.end === block.end
        ))
    )
      tail = tail.slice(0, block.open).trimEnd();
  }
  const shortenedTail = tail.length !== input.trimEnd().length;
  const tailLower = tail.toLowerCase();
  const trailingCredit = technicalEntries.find(({ name, lower }) => {
    if (
      name === "推しの子" ||
      (name.length < 4 && !/[A-Za-z]/.test(name)) ||
      !tailLower.endsWith(lower)
    )
      return false;
    const start = tail.length - name.length;
    if (
      subtitleDestinations.some(
        (target) => start >= target.start && tail.length <= target.end
      )
    )
      return false;
    const before = tail.slice(0, tail.length - name.length);
    if (!/[.\s]$/.test(before)) return false;
    if (
      known.has(lower) &&
      (!shortenedTail || /[-–]\s*$/.test(before)) &&
      (!contextual.has(lower) || /[-–]\s*$/.test(before))
    )
      return true;
    // 无连字符时，音轨编码及完整声道字段提供技术链与署名之间的边界。
    return /(?:^|[\s._\])])(?:AAC|FLAC|OPUS|LPCM|PCM|ATMOS|AC-?3|E-?AC-?3|DDP?|DTS)(?:[ ._]?[1-9](?:\.[01])?(?:ch)?)?\s+$/i.test(
      before
    );
  })?.name;
  if (trailingCredit) {
    const start = tail.length - trailingCredit.length;
    if (
      !selected.some((item) => item.start <= start && item.end >= tail.length)
    ) {
      const item = { start, end: tail.length, parts: [tail.slice(start)] };
      const following = selected.findIndex((entry) => entry.start > start);
      if (following < 0) selected.push(item);
      else selected.splice(following, 0, item);
    }
  }
  selected.sort((left, right) => left.start - right.start);
  if (!selected.length) return undefined;
  const parts = Array.from(new Set(selected.flatMap((item) => item.parts)));
  return {
    raw: selected.map((item) => input.slice(item.start, item.end)).join(" & "),
    parts,
  };
}
