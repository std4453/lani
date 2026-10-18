import {
  trimTechnicalTail,
  language,
  splitAliases,
  isAliasSeasonQualifier,
  isInventoryAnnotation,
  splitBracketAliasList,
  isClauseAnnotation,
  hasAdjacentName,
  looksLikeAlternative,
  hasTechnicalGap,
  isSeriesSearch,
} from "./nameAliases";
import { Segment, segments, pairs } from "./nameSegments";
import { cjk, technical, metadata } from "./nameMetadata";
import matchEpisode from "@/matchEpisode";
import matchSpecialEpisode from "@/matchSpecialEpisode";
import { parseTorrentOrganization } from "@/parseTorrentOrganization";
import { Organization, Title } from "@/types";

export interface TorrentNames {
  title: Title;
  organization?: Organization;
}

export interface TorrentNamesOptions {
  /** 已由剧集解析器确定的原文位置；只用于划分标题，不参与编号判断。 */
  episode?: { index: number; length: number };
}
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const groupWord =
  /(?:Raws?|Sub)$|字幕[组組社]|[汉漢]化[组組]|[发發][布佈组組]|[搬压壓]运?[组組部]|工作室|\b(?:raws?|subs?|fansub(?:ber)?s?|studio|team|group)\b|合成|压制|壓制|搬运|搬運/i;

/** 附件说明仅用于名称清理；以等长空格保留已解析集数的原文位置。 */
function maskNameReleaseInformation(
  input: string,
  organization?: Organization
): string {
  const blank = (text: string) => " ".repeat(text.length);
  // 署名仅在明确字幕职责段剥离；独立发布者预测不作为删去裸正文的依据。
  const creditBlocks = segments(input);
  for (const block of creditBlocks) {
    const group = organization?.parts.find((part) =>
      block.text.trimStart().startsWith(part)
    );
    if (!group) continue;
    if (
      block.wrapper &&
      block.text.trim() === group &&
      creditBlocks
        .slice(0, creditBlocks.indexOf(block))
        .some(
          (piece) =>
            !piece.wrapper && /\p{L}/u.test(piece.text) && !metadata(piece.text)
        ) &&
      /^(?:\s*(?:and|&)\s*\[[^\]]+\])*\s+(?:subtitles?|subs?|scripts?|retimed)(?=\s*(?:$|for\b|only\b|[:–-]))/i.test(
        input.slice(block.end)
      )
    ) {
      input = input.slice(0, block.start) + blank(input.slice(block.start));
      break;
    }
  }
  for (const group of organization?.parts ?? []) {
    const escaped = group.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    input = input.replace(
      new RegExp(
        `(?<!\\s)\\s+(?:[-–]\\s+)?${escaped}\\s+(?=(?:(?:English|Eng)\\s+)?(?:subs?|subtitles?|scripts?)\\b)`,
        "gi"
      ),
      blank
    );
  }
  const subtitleFile =
    /[.](?:ass|ssa|srt|sup|vtt|sub)(?=\s*(?:$|[(（\[【]|Subtitle\s+(?:timed|file)\b|(?:English|Eng)\s+subtitles?\b))/i;
  const isSubtitleFile = subtitleFile.test(input);
  const documentDelivery =
    /[.]pdf\s*$/i.test(input) || /\beditor's cut\b/i.test(input);
  if (documentDelivery)
    input = input.replace(
      /(?<!\s)\s+Volume\s+\d+(?:\s*[-–]\s*[^\[\r\n]*)?/i,
      blank
    );
  input = input.replace(/(?<!\s)\s+CM\s*[(（]\s*(?=\d{3,4}[x×])/i, blank);
  input = input.replace(/(?<!\s)\s+WEB Only Special Episode\b[\s\S]*$/i, blank);
  if (/[.]xdelta\d*\s*$/i.test(input)) {
    const episode = /(?<!\s)\s+[-–]\s+\d+(?:[.]\d+)?\b/.exec(input);
    if (episode) {
      const end = episode.index + episode[0].length;
      input = input.slice(0, end) + blank(input.slice(end));
    }
  }
  input = input.replace(
    /[(（][.](?:ass|ssa|srt|sup|vtt|sub)\s+files?[)）]/gi,
    blank
  );
  input = input.replace(
    /[.](?:ass|ssa|srt|sup|vtt|sub|xdelta\d*|avi|rar|7z|pdf|mkv|mp4|ts|zip|torrent)(?=\s*(?:$|[(（\[【]|Subtitle\s+(?:timed|file)\b|(?:English|Eng)\s+subtitles?\b)|[.](?:torrent|rar)\b)/gi,
    blank
  );
  input = input.replace(
    /^(?:Subtitle\s*-\s*|Subs?\s+for\s+|(?:V\d+\s+)?Patch\s*-\s*|Subtitle Patch for\s+(?:\S+['’]s\s+)?)/i,
    blank
  );
  // 先屏蔽完整收录范围，避免其中数字被历史集号边界截开。
  for (const block of segments(input)) {
    if (
      block.wrapper &&
      metadata(block.text) &&
      /^(?:Seasons\s+\d+\s*[-~]|Season\s+\d+(?:\s+to\s+\d+|\s*[+]\s*\d+)|Series\s*[+]|Complete Series\s*[+]|Part\s+\d+\s*-\s*End|Movie\s+\d+\s+Special)/i.test(
        block.text
      )
    )
      input =
        input.slice(0, block.start) +
        blank(input.slice(block.start, block.end)) +
        input.slice(block.end);
  }
  const blocks = segments(input);
  let suffixStart = input.length;
  for (const block of blocks) {
    let text = block.text;
    if (!block.wrapper) {
      text = text.replace(/(?<!\s)\s+Dub Preview\b[\s\S]*$/i, blank);
    }
    if (!block.wrapper)
      text = text.replace(
        /^(\s*)(?:Subtitle\s*-\s*|Subtitle Patch for\s+(?:\S+['’]s\s+)?)/i,
        blank
      );
    text = text.replace(/_\d+_(?:ger|eng|fre|spa)_sub\s*$/i, blank);
    // 只清理带角色和交付说明的后缀，不删除正文中的 Sub、Script 等同形词。
    let delivery = text.match(
      /(?:(?<!\s)\s+|_)(?:(?:Unofficial|Perfect|Bad|OCR'ed)\s+|Multi[- ])?(?:(?:English|Eng|German|French|Japanese|ass|TV)[ -]+)?(?:Subtitles?|Subs?|Scripts?)(?:[+]Fonts?)?(?=\s*(?:$|for\b|only\b|files?\b|pack\b|edits?\b|Re-Synced\b|v\d+\b|\d|[+]))/i
    );
    if (delivery && /\b(?:and|or|of)\s*$/i.test(text.slice(0, delivery.index)))
      delivery = null;
    const languageDelivery = text.match(
      /(?:(?<!\s)\s+|^[.])(?:(?:Unofficial|Perfect|Bad)\s+)?(?:English|Eng)[ -]+(?:Subtitles?|Subs?|Subbed)(?=\s|$)/i
    );
    const patch = text.match(
      /(?:(?<!\s)\s+|_)(?:v\d+\s+)?Patch(?:es)?(?=\s*(?:$|[-–]|for\b|v\d+\b))/i
    );
    const script = text.match(
      /(?<!\s)\s+(?:Scripts?|Subs?)(?:[+]Fonts?)?\s+for\b/i
    );
    const subtitleFormat = text.match(
      /(?<!\s)\s+(?:[-–]\s*)?(?:English\s+)?ASS\s+(?:only|format)\b/i
    );
    const releaseNote = text.match(
      /(?<!\s)\s+(?:Batch\s+(?:ass files|fixes)|retimed\s+for|re-timed\s+for|pg-\d+\s+subs|Masterful\s+translation)\b/i
    );
    const release = [
      delivery,
      languageDelivery,
      patch,
      script,
      subtitleFormat,
      releaseNote,
    ]
      .filter((match): match is RegExpMatchArray => Boolean(match))
      .sort((a, b) => a.index! - b.index!)[0];
    if (release) {
      const start = block.start + release.index!;
      // 文件交付说明后的括号通常是校对者、原轴与兼容版本。
      if (!block.wrapper) suffixStart = Math.min(suffixStart, start);
    }
    const promo = text.match(
      /(?:(?<!\s)\s+|_)(?:[-–]_?\s*)?(?:(?:Latest|Official|English|Teaser|Short|Textless|Game|German|Dub)\s+|(?:Promo|Game)_)*(?:PV\d*(?:v\d+)?|Promo(?:_Trailer)?|Trailer|Teaser|Preview|CM|Sneak Peek|(?:NC)?(?:OP|ED)\d*|Opening)(?=$|[\s_]+(?:$|\d|[IVX]+\s*$|v\d|in\b|English\b|Sub\w*\b|PV\b|Trailer\b|[-–]\s*first\b|2hour))/i
    );
    const wrappedEpisodeTitle =
      block.wrapper &&
      /^\s*(?:[-–]\s*)?(?:[\[【(（]\s*)?\d+(?:[.]\d+)?\b/.test(
        input.slice(block.end)
      );
    if (promo && !wrappedEpisodeTitle)
      text = text.slice(0, promo.index) + blank(text.slice(promo.index));
    if (promo && !wrappedEpisodeTitle && block.wrapper)
      text = text.replace(/,\s*$/, blank);
    text = text.replace(/(?:\s+特報|ティザー映像)\s*$/, blank);
    const contentStart = block.start + (block.wrapper ? 1 : 0);
    const contentEnd = block.end - (block.wrapper ? 1 : 0);
    input = input.slice(0, contentStart) + text + input.slice(contentEnd);
  }
  if (suffixStart < input.length)
    input = input.slice(0, suffixStart) + blank(input.slice(suffixStart));
  // 字幕文件同样使用常见的下划线、点号和裸编号命名。
  if (isSubtitleFile || suffixStart < input.length)
    input = input.replace(
      /(?:_\d+(?:[.]\d+)?(?:_V\d+)?|(?<!\s)\s+[-–]\s*\d+(?:[.]\d+)?(?:v\d+)?|(?<!\s)\s+(?:\d{2,4}|\d+[.]\d+)(?:v\d+)?)\s*$/i,
      (number) =>
        /^(?:19|20)\d{2}$/.test(number.trim()) ? number : blank(number)
    );
  if (suffixStart < input.length)
    input = input.replace(
      /(?:(?<!\s)\s+[IVX]+[-~–][IVX]+|(?<!\s)\s+[-–]{1,}|_+)\s*$/i,
      blank
    );
  if (isSubtitleFile)
    input = input
      .replace(/[.](?:en|eng|ja|jp|ger|fre|spa)\s*$/i, blank)
      .replace(/(?<!\s)\s+uncut\s*$/i, blank);
  input = input.replace(
    /[.](?:sup|ass|srt)\s+(?:English|Eng)\s+subtitles?\s*$/i,
    blank
  );
  if (suffixStart < input.length)
    input = input
      .replace(/^Timed\s+/i, blank)
      .replace(/(?<!\s)\s+TV\s*$/i, blank);
  return input;
}

/** 独立提取原文中的作品名称；不推断剧集编号，也不修改字幕判断。 */
export function parseTorrentNames(
  input: string,
  options: TorrentNamesOptions = {}
): TorrentNames {
  const originalInput = input;
  const detectedOrganization = parseTorrentOrganization(originalInput);
  input = maskNameReleaseInformation(input, detectedOrganization);
  // 两侧留白的竖线才是名称边界，标题自身的符号组合保留。
  input = input.replace(/(?<=\s)│(?=\s)/g, "|");
  const videoFilename = /[.](?:mkv|mp4|ts|avi)$/i.test(originalInput.trimEnd());
  input = input.replace(/[.](?:mkv|mp4|ts|torrent|zip)\s*$/i, (extension) =>
    " ".repeat(extension.length)
  );
  // 多分辨率清单和带引用集名的重播编号仅划分名称，不改变剧集解析结果。
  input = input.replace(
    /\s+(?:240|288|480|576|720|1080|1440|2160|4320)(?:\s*[／/]\s*(?:240|288|480|576|720|1080|1440|2160|4320))+\s*$/,
    (resolutions) => " ".repeat(resolutions.length)
  );
  input = input.replace(
    /\s+R\d{1,4}「[^「」]+」(?=\s*(?:[(（\[【]|$))/g,
    (episodeCaption) => " ".repeat(episodeCaption.length)
  );
  input = input.replace(/\s+Remastered$/i, (tag) => " ".repeat(tag.length));
  // 紧接视频来源的复数季范围是收录说明，不让范围编号抢占名称边界。
  input = input.replace(
    /\bSeasons\s+\d+\s*[-~–]\s*\d+(?=\s+(?:BD\b|BD_|BDRIP\b|BluRay\b|WEB\b|DVD\b))/gi,
    (range) => " ".repeat(range.length)
  );
  const repeatedMediaQualifier = /\b(OVA|OAD)\b[^|｜]*[|｜][\s\S]*\b\1\b/i.exec(
    input
  )?.[1];
  // 竖线后的集数范围明确表示收录清单，紧前裸年份为发行说明；保留原偏移。
  input = input.replace(
    /\s+(?:19|20)\d{2}(?=\s*[|｜]\s*\d{1,4}\s*[-~–]\s*\d{1,4}\b)/g,
    (year) => " ".repeat(year.length)
  );
  // 发布说明中的富文本附件不属于资源名称。保留前缀位置，避免干扰已确定的集数偏移。
  const attachmentStart = input.search(/\[(?:img|url=)[^\]]*\]/i);
  if (attachmentStart > 0) input = input.slice(0, attachmentStart);
  const quotedRelease = input.match(
    /^([^『』\[【]+)『([^『』]*[／/][^『』]+)』(?=\s*[\[【]\d+)/
  );
  if (quotedRelease)
    input =
      " ".repeat(quotedRelease[1].length + 1) +
      quotedRelease[2] +
      " " +
      input.slice(quotedRelease[0].length);
  input = input.replace(
    /\s+[-–]\s+TV\s*[(（](?:19|20)\d{2}[)）]\s*[+]\s*MOVIE\s*[(（](?:19|20)\d{2}[)）]/gi,
    (scope) => " ".repeat(scope.length)
  );
  const backupDescription = input.match(
    /^(.*?)\s+-\s+OP[/]ED Collection Video Backup(?:\s*\[[^\]]+\])?\s*$/i
  );
  const backupPrefix = backupDescription?.[1].trim() ?? "";
  const assetCollection =
    Boolean(backupDescription) &&
    (/^https?:\/\/\S+$/i.test(backupPrefix) ||
      /^(?:[a-z\d-]+[.])+(?:com|net|org|io|moe|tv|info|xyz)$/i.test(
        backupPrefix
      ));
  if (backupDescription && !assetCollection)
    input =
      backupDescription[1] +
      " ".repeat(input.length - backupDescription[1].length);
  input = input.replace(/合集\s*全[（(][^)）]+[)）](?=\s*[／/|｜])/g, (scope) =>
    " ".repeat(scope.length)
  );
  let blocks = segments(input);
  const leadingCredit = blocks.findIndex(
    (block) =>
      (block.wrapper === "(" || block.wrapper === "（") &&
      !input.slice(0, block.start).trim() &&
      detectedOrganization?.parts.includes(block.text.trim())
  );
  if (
    leadingCredit >= 0 &&
    blocks
      .slice(leadingCredit + 1)
      .some((block) => /\p{L}/u.test(block.text) && !metadata(block.text))
  )
    blocks.splice(leadingCredit, 1);
  let organization: Organization | undefined = quotedRelease
    ? {
        raw: quotedRelease[1].trim(),
        parts: [quotedRelease[1].trim()],
      }
    : undefined;
  const first = blocks.findIndex(
    (block) =>
      block.text.replace(/[\u200b\ufeff]/g, "").trim() && !metadata(block.text)
  );
  if (first >= 0) {
    const block = blocks[first];
    const after = input.slice(block.end).trimStart();
    const firstEpisode =
      /^[\[【](?:第)?\d+(?:[-~]\d+)?(?:话|話|集)?(?:END|FIN)?[\]】]/i.test(
        after
      );
    const laterName = blocks
      .slice(first + 1)
      .some(
        (piece) =>
          !metadata(trimTechnicalTail(piece.text)) &&
          !/^[-–\s]+$/.test(piece.text)
      );
    const leadingCoverage =
      firstEpisode &&
      (/^\d{3,4}(?:-\d{3,4})?$/.test(blocks[first + 1]?.text ?? "") ||
        (/^\d{1,4}-\d{1,4}$/.test(blocks[first + 1]?.text ?? "") &&
          detectedOrganization?.parts.includes(block.text))) &&
      !blocks[first + 2]?.wrapper &&
      /\p{L}/u.test(blocks[first + 2]?.text ?? "");
    const firstSpecial = /^[\[【](?:OVA|OAD|SP)[\]】]/i.test(after);
    const leadingVersionTitle =
      /^(?:导演|導演)剪[辑輯]版[(（](?:上|下)[)）]$/.test(
        blocks[first + 1]?.text.trim() ?? ""
      );
    const remainingNames = blocks
      .slice(first + 1)
      .filter(
        (piece) => !metadata(piece.text) && !/^[-–\s]+$/.test(piece.text)
      );
    const leadingEnglishTitle =
      (/^[A-Za-z]+(?: [A-Za-z]+){2,}$/.test(block.text) ||
        (/^[A-Za-z][A-Za-z .!?'’-]+$/.test(block.text) &&
          block.text.split(/\s+/).length >= 6 &&
          /\s-\s/.test(block.text))) &&
      remainingNames.length === 1 &&
      Boolean(remainingNames[0].wrapper) &&
      cjk.test(remainingNames[0].text) &&
      (!blocks.some((piece) =>
        /^(?:第)?\d{1,4}(?:[-~]\d+)?(?:集|话|話)?$/.test(piece.text)
      ) ||
        (block.text.split(/\s+/).length >= 6 && /\s-\s/.test(block.text)));
    const leadingSoundtrackTitle =
      cjk.test(block.text) &&
      /[A-Za-z]{2,}/.test(block.text) &&
      /^(?:OST\b|原[声聲]音[乐樂])/i.test(blocks[first + 1]?.text ?? "");
    const leadingMultilingualTitle =
      block.text.length >= 12 &&
      cjk.test(block.text) &&
      remainingNames.some(
        (piece) => piece.wrapper && language(piece.text) === "latin"
      ) &&
      remainingNames.some((piece) => piece.wrapper && kana.test(piece.text));
    const leadingBilingualTitle =
      cjk.test(block.text) &&
      remainingNames.length === 1 &&
      Boolean(remainingNames[0].wrapper) &&
      language(remainingNames[0].text) === "latin" &&
      blocks.some((piece) =>
        /^(?:Movie|电影|電影|剧场版|劇場版)$/i.test(piece.text)
      ) &&
      !/[／/\\|]/.test(remainingNames[0].text);
    if (
      (block.wrapper === "[" || block.wrapper === "【") &&
      !metadata(block.text) &&
      (groupWord.test(block.text) ||
        ((!firstEpisode || leadingCoverage) &&
          !firstSpecial &&
          !leadingVersionTitle &&
          !blocks
            .slice(0, first)
            .some((piece) => /^\d{6}[-~]\d{6}$/.test(piece.text)) &&
          !leadingBilingualTitle &&
          !leadingEnglishTitle &&
          !leadingSoundtrackTitle &&
          !leadingMultilingualTitle &&
          !blocks
            .slice(0, first)
            .some((piece) =>
              /^(?:Movie|电影|電影|剧场版|劇場版)$/i.test(piece.text)
            ) &&
          laterName &&
          /[^\s]/.test(after)))
    ) {
      organization = {
        raw: block.text,
        parts: block.text.split(/\s*(?:&|＆|×|\+| x |\\)\s*/).filter(Boolean),
      };
      blocks.splice(first, 1);
      const next = blocks[first];
      const following = blocks[first + 1];
      if (
        (/搬运|搬運|压制|壓制/.test(block.text) ||
          /^[A-Z0-9]+[-_][A-Z0-9]+$/.test(next?.text ?? "")) &&
        next?.wrapper &&
        !metadata(next.text) &&
        following &&
        (!following.wrapper ||
          groupWord.test(next.text) ||
          /^[A-Z0-9]+[-_][A-Z0-9]+$/.test(next.text)) &&
        !metadata(following.text) &&
        /^[A-Za-z0-9_-]+$/.test(next.text)
      ) {
        organization.parts.push(next.text);
        blocks.splice(first, 1);
      }
    }
  }
  const versionYearRanges = blocks.filter((block, index) => {
    const previous = blocks[index - 1];
    return (
      (block.wrapper === "(" || block.wrapper === "（") &&
      /^(?:19|20)\d{2}[-–](?:19|20)\d{2}$/.test(block.text) &&
      previous &&
      !previous.wrapper &&
      /\p{L}/u.test(previous.text) &&
      !/_\s*$/.test(previous.text) &&
      !/\b(?:Specials|Extras|Collection)\b|[+＆&]|\bSeasons?\s*\d+\s*[-~–]\s*\d+|\bS\d+\s*[-~–]\s*S?\d+|\b(?:Complete|Full|Entire)\s+(?:Series|Seasons?)\b/i.test(
        previous.text
      )
    );
  });
  const origin =
    organization && input.includes(organization.raw)
      ? input.indexOf(organization.raw) + organization.raw.length + 1
      : 0;
  const ordinary = options.episode
    ? undefined
    : matchEpisode(input.slice(origin));
  const special = options.episode
    ? undefined
    : matchSpecialEpisode(input.slice(origin));
  const specialStart =
    options.episode?.index ?? (special ? special.start + origin : input.length);
  const specialEnd = options.episode
    ? specialStart + options.episode.length
    : special
    ? special.end + origin
    : input.length;
  const inlineSpecial =
    (!special || special.index === undefined) &&
    /^(?:特别篇|特別篇)$/.test(input.slice(specialStart, specialEnd)) &&
    /\S/.test(input.slice(origin, specialStart));
  const namedSpecialEpisode =
    /\S/.test(input.slice(origin, specialStart)) &&
    !/[-–]\s*$/.test(input.slice(origin, specialStart)) &&
    /^(?:特别篇|特別篇)\s+-\s+\d/.test(input.slice(specialStart, specialEnd));
  const marker =
    special &&
    !inlineSpecial &&
    special.start > 0 &&
    (!ordinary ||
      (special.start < ordinary.end && special.end > ordinary.start))
      ? special
      : ordinary;
  // 前置归档编号不代替后面正文中的本地集号，仅用于划分名称。
  const coverageBlock = blocks.find(
    (block, index) =>
      (block.wrapper === "[" || block.wrapper === "【") &&
      /^(?:\d{3,4}|\d{1,4}-\d{1,4})$/.test(block.text) &&
      ((block.start <=
        (options.episode?.index ??
          (marker ? marker.start + origin : input.length)) &&
        block.end >=
          (options.episode?.index ??
            (marker ? marker.start + origin : input.length))) ||
        (!options.episode &&
          !marker &&
          blocks.slice(0, index).every((piece) => metadata(piece.text))))
  );
  const coverageFollowing =
    coverageBlock && blocks[blocks.indexOf(coverageBlock) + 1];
  const followingEpisode =
    coverageFollowing && !coverageFollowing.wrapper
      ? matchEpisode(input.slice(coverageFollowing.start))
      : undefined;
  const coverageLocalNumber =
    coverageFollowing &&
    !coverageFollowing.wrapper &&
    metadata(blocks[blocks.indexOf(coverageFollowing) + 1]?.text ?? "")
      ? coverageFollowing.text.match(
          /^\s*\p{L}.+?\s+(\d{1,3})(?:\s+Extended)?\s*$/iu
        )
      : undefined;
  const coverageLocalStart =
    coverageLocalNumber && coverageFollowing
      ? coverageFollowing.start +
        coverageLocalNumber.index! +
        coverageLocalNumber[0].lastIndexOf(coverageLocalNumber[1])
      : undefined;
  // 数字后紧接作品名称词语而没有技术后缀时，可能是数字开头的别名。
  const detectedStart = namedSpecialEpisode
    ? specialStart + input.slice(specialStart, specialEnd).indexOf("-")
    : coverageLocalStart !== undefined
    ? coverageLocalStart
    : followingEpisode && coverageFollowing
    ? followingEpisode.start + coverageFollowing.start
    : coverageBlock &&
      coverageFollowing &&
      !followingEpisode &&
      !coverageLocalNumber &&
      blocks
        .slice(0, blocks.indexOf(coverageBlock))
        .every(
          (piece) =>
            metadata(piece.text) ||
            detectedOrganization?.parts.includes(piece.text.trim())
        )
    ? input.length
    : options.episode?.index ?? (marker ? marker.start + origin : input.length);
  const detectedEnd = namedSpecialEpisode
    ? specialEnd
    : coverageLocalStart !== undefined && coverageLocalNumber
    ? coverageLocalStart + coverageLocalNumber[1].length
    : followingEpisode && coverageFollowing
    ? followingEpisode.end + coverageFollowing.start
    : detectedStart === input.length
    ? input.length
    : options.episode
    ? detectedStart + options.episode.length
    : marker
    ? marker.end + origin
    : input.length;
  const titleNumber =
    /^[A-Za-z]{1,3}-\d{1,2}(?=\s*(?:$|[(（\[【]))/.test(
      blocks.find((block) => !metadata(block.text))?.text.trimStart() ?? ""
    ) && /^-?\d/.test(input.slice(detectedStart));
  const dubiousNumber =
    (/^(?:OVA|OAD|ONA)$/i.test(
      input.slice(detectedStart, detectedEnd).trim()
    ) &&
      /[|｜][^|｜]*\p{L}/u.test(input.slice(origin, detectedStart))) ||
    versionYearRanges.some(
      (block) => detectedStart >= block.start && detectedStart < block.end
    ) ||
    titleNumber ||
    (/^\d{3,4}\s+[A-Za-z]/.test(input.slice(detectedStart)) &&
      !technical.test(input.slice(detectedEnd)));
  const namedEventSpecial =
    /\b\d{4}\s+$/.test(input.slice(origin, detectedStart)) &&
    /Special\b/.test(input.slice(detectedStart));
  const prefixSpecial =
    /^[\s\[【]*$/.test(input.slice(origin, detectedStart)) &&
    /^(?:(?:OVA|OAD|SP)\b|特别篇|特別篇)/i.test(input.slice(detectedStart));
  // 小节目可用倒序的主集号-子集号，后接剧情标题和播出日期；只用于名称边界。
  const subEpisode = blocks.find((block, index) => {
    const number = block.text.match(/^(\d{2,4})-([1-9])$/);
    return (
      block.wrapper &&
      number &&
      Number(number[1]) > Number(number[2]) &&
      cjk.test(blocks[index + 1]?.text ?? "") &&
      /^\d{4}[.\/-]\d{1,2}[.\/-]\d{1,2}$/.test(blocks[index + 2]?.text ?? "")
    );
  });
  // 剧情说明内的编号或明显误写的宽度范围也可划分名称，不重写剧集结果。
  const captionEpisode = blocks.find((block, index) => {
    const wideRange = block.text.match(/^(\d{2,4})-(\d{5,})$/);
    return (
      index > 0 &&
      block.wrapper &&
      ((/^\d{1,4}\s+[\p{Script=Han}]/u.test(block.text) &&
        metadata(blocks[index + 1]?.text ?? "")) ||
        (wideRange && cjk.test(blocks[index + 1]?.text ?? "")))
    );
  });
  // 超长季号只在完整 S…E… 字段后紧接含清晰度的技术包装时划分名称，不推断其编号含义。
  const longSeasonEpisode = blocks
    .map((block, index): Segment | undefined => {
      const following = blocks[index + 1];
      if (
        block.wrapper ||
        !following?.wrapper ||
        !metadata(following.text) ||
        !technical.test(following.text) ||
        !/\b(?:\d{3,4}[pi]|[248]K|\d{3,4}[x×]\d{3,4})\b/i.test(following.text)
      )
        return undefined;
      const code = /\bS\d{5,}E\d{1,4}(?:v\d+)?(?=\s*$)/i.exec(block.text);
      if (!code || !/\p{L}/u.test(block.text.slice(0, code.index)))
        return undefined;
      const start = block.start + code.index;
      return { text: code[0], start, end: start + code[0].length };
    })
    .find((block) => block !== undefined);
  const localEpisode = [subEpisode, captionEpisode, longSeasonEpisode]
    .filter((block): block is Segment => Boolean(block))
    .sort((a, b) => a.start - b.start)[0];
  const episodeStart =
    localEpisode && localEpisode.start < detectedStart
      ? localEpisode.start
      : dubiousNumber || prefixSpecial || inlineSpecial || namedEventSpecial
      ? input.length
      : detectedStart;
  const episodeEnd =
    localEpisode && localEpisode.start < detectedStart
      ? localEpisode.end
      : dubiousNumber || prefixSpecial || inlineSpecial || namedEventSpecial
      ? input.length
      : detectedEnd;
  const aliases: string[] = [];
  for (const block of blocks) {
    let text = block.text;
    const trailingNames: string[] = [];
    if (!text || block === coverageBlock) continue;
    if (
      !block.wrapper &&
      aliases.length &&
      hasTechnicalGap(blocks, blocks.indexOf(block))
    ) {
      const extraAliases = text.match(
        /^\s*[-–]\s+(.+?)\s+[-–]\s+(.+?)\s+[-–]\s+VOSTFR\s*$/i
      );
      if (
        extraAliases &&
        extraAliases.slice(1).every((name) => !metadata(name))
      ) {
        aliases.push(...extraAliases.slice(1).flatMap(splitAliases));
        continue;
      }
    }
    if (
      block.wrapper &&
      detectedOrganization?.parts.includes(text.trim()) &&
      blocks
        .slice(blocks.indexOf(block) + 1)
        .some(
          (piece) =>
            !piece.wrapper && /\p{L}/u.test(piece.text) && !metadata(piece.text)
        ) &&
      blocks
        .slice(0, blocks.indexOf(block))
        .every(
          (piece) =>
            !piece.text.trim() ||
            metadata(piece.text) ||
            detectedOrganization?.parts.includes(piece.text.trim())
        )
    )
      continue;
    if (versionYearRanges.includes(block) && aliases.length) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
      continue;
    }
    if (
      block.wrapper &&
      (/^Seasons?\s+\d+\s*[-&+~]\s*\d+$/i.test(text) ||
        /^(?:Episodes?|Seasons?)\s+\d+(?:\s*[-~–]\s*\d+)?(?:\s*[,，]\s*\d+(?:\s*[-~–]\s*\d+)?)+(?:\s*[+&]\s*(?:Movies?|OVAs?|OADs?|SPs?))*$/i.test(
          text
        ))
    )
      continue;
    if (
      !block.wrapper &&
      /^\s*[-–]\s+/.test(text) &&
      /\bBox\s*\d+\s+Remastered\b/i.test(input.slice(0, block.start)) &&
      hasTechnicalGap(blocks, blocks.indexOf(block))
    )
      continue;
    const languageAlias = text.match(/\bVOSTFR\s+(\p{L}.+)$/u);
    if (
      languageAlias &&
      technical.test(text.slice(0, languageAlias.index)) &&
      !metadata(languageAlias[1])
    )
      trailingNames.push(languageAlias[1]);
    if (
      block.start < episodeEnd &&
      block.end > episodeStart &&
      episodeStart < input.length
    ) {
      if (block.start >= episodeStart) continue;
      const pipeAliases = input
        .slice(episodeEnd, block.end - (block.wrapper ? 1 : 0))
        .split(/(?<!\|)[|｜](?!\|)/)
        .slice(1);
      trailingNames.push(...pipeAliases.flatMap(splitAliases));
      const trailingAlias = input
        .slice(episodeEnd, block.end - (block.wrapper ? 1 : 0))
        .match(/[／/]\s*((?:「|『).+(?:」|』))\s*$/);
      const companion = input
        .slice(episodeEnd, block.end - (block.wrapper ? 1 : 0))
        .match(/^\s*[＆&]\s*([\p{L}].+)$/u);
      if (companion && !metadata(companion[1]))
        trailingNames.push(trimTechnicalTail(companion[1]));
      else if (trailingAlias) trailingNames.push(trailingAlias[1]);
      else if (/[集话話]$/.test(input.slice(episodeStart, episodeEnd))) {
        const tail = input.slice(episodeEnd, block.end).trim();
        if (
          /^[A-Za-z][A-Za-z0-9 .:!?'’&-]+$/.test(tail) &&
          tail.split(/\s+/).length >= 2 &&
          !metadata(tail)
        )
          trailingNames.push(trimTechnicalTail(tail));
      }
      const independentSeason = input
        .slice(episodeStart, episodeEnd)
        .match(/^(S\d+)\s+(?=E\d+)/i)?.[1];
      const titleEnd =
        episodeStart +
        (/^Special\b/i.test(input.slice(episodeStart)) &&
        /\b(?:be|is|are|was|were)\s+$/i.test(input.slice(origin, episodeStart))
          ? "Special".length
          : input[episodeStart] === "-" &&
            /\s-[^-]+$/.test(input.slice(block.start, episodeStart))
          ? 1
          : 0);
      text = input
        .slice(block.start + (block.wrapper ? 1 : 0), titleEnd)
        .replace(/\s+-\s*$|(?<![\p{L}])_\s*$|[：:]\s*$/u, "")
        .replace(/[.]\s*$/, (ending) =>
          /^(?:EP?|Episode|全|第)/i.test(input.slice(episodeStart)) ||
          /[.]S\d+E\d+/i.test(input.slice(block.start, episodeEnd))
            ? ""
            : ending
        )
        .replace(/\bTV\s*$/, "");
      // 下划线紧贴编号包装时是结构分隔符；词尾下划线不统一清除。
      if (
        /_[\[【]?\s*$/.test(input.slice(block.start, episodeStart)) &&
        /^[\[【]?\d/.test(input.slice(episodeStart))
      )
        text = text.replace(/_\s*$/, "");
      if (independentSeason) text = text.trimEnd() + " " + independentSeason;
      if (/^第\s*\d+[集话話]/.test(input.slice(episodeStart))) {
        text = text
          .replace(/(?<=[\p{Script=Han}])0\d\s*$/u, "")
          .replace(/合集\s*$/, "");
        if (!/(?:^|\s)([-–])\S.*\1\s*$/.test(text))
          text = text.replace(/[-–]\s*$/, "");
      }
    }
    // 混合块仅清理由明确分隔符隔开的完整元信息，不把整个标题块丢弃。
    if (block.wrapper === "(" || block.wrapper === "（") {
      text = splitBracketAliasList(text).join(" / ");
      let comma = Math.max(text.lastIndexOf(","), text.lastIndexOf("，"));
      while (comma >= 0 && metadata(text.slice(comma + 1))) {
        text = text.slice(0, comma);
        comma = Math.max(text.lastIndexOf(","), text.lastIndexOf("，"));
      }
    }
    if (text.includes(".") && cjk.test(text)) {
      const pieces = text.split(".");
      text = pieces
        .filter(
          (piece) =>
            !(
              /^(?:[248]K|\d{3,4}[pPiI]|AI.*(?:修复|修復|画质|畫質).*)$/i.test(
                piece
              ) && metadata(piece)
            )
        )
        .join(".");
    }
    const attachedWork = text.match(
      /^\s*(?:附(?:赠|贈)?|付|赠|贈)『([^』]+)』(?:剧中歌|劇中歌|原声|原聲|OST|歌集)/i
    );
    if (attachedWork) text = attachedWork[1];
    const soundtrackWork = text.match(
      /^(?:TV)?アニメ[「『]([^」』]+)[」』]\s*オリジナルサウンドトラック$/
    );
    if (soundtrackWork) text = soundtrackWork[1];
    if (block.wrapper && /^(?:-\d+|Episodes?\s*)$/i.test(text.trim())) continue;
    const afterEpisode = block.start >= episodeEnd && episodeEnd < input.length;
    if (
      block.wrapper &&
      /^(?:Fixed|NoLogo|Honorific|Repair|new stream)$/i.test(text.trim()) &&
      aliases.length &&
      (afterEpisode || hasTechnicalGap(blocks, blocks.indexOf(block)))
    )
      continue;
    if (
      block.wrapper &&
      (/^(?:导演|導演)剪[辑輯]版[(（](?:上|下)[)）]$/.test(text.trim()) ||
        (/^[\p{Script=Han}]{1,8}(?:解放|开放|開放)版$/u.test(text.trim()) &&
          !/^(?:全|完全|规制|規制)(?:解放|开放|開放)版$/.test(text.trim()) &&
          hasAdjacentName(blocks, blocks.indexOf(block)))) &&
      aliases.length &&
      !hasTechnicalGap(blocks, blocks.indexOf(block))
    ) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
      continue;
    }
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      /^\d+[.]\d{2,}$/.test(text.trim()) &&
      aliases.length &&
      /\s+\d+[.]\d+$/.test(aliases[aliases.length - 1]) &&
      hasAdjacentName(blocks, blocks.indexOf(block)) &&
      !hasTechnicalGap(blocks, blocks.indexOf(block))
    ) {
      const following = blocks[blocks.indexOf(block) + 1];
      if (
        following &&
        !following.wrapper &&
        following.start < episodeStart &&
        /^\s+\p{L}/u.test(following.text) &&
        !metadata(following.text)
      ) {
        const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
        const combined =
          aliases.pop()! +
          gap +
          block.wrapper +
          text +
          block.closer +
          input
            .slice(following.start, Math.min(following.end, episodeStart))
            .trimEnd();
        aliases.push(...splitAliases(combined));
        if (following.end > episodeEnd)
          aliases.push(
            ...input
              .slice(episodeEnd, following.end)
              .split(/(?<!\|)[|｜](?!\|)/)
              .slice(1)
              .flatMap(splitAliases)
          );
        following.text = "";
        continue;
      }
    }
    // 俄语名称字段中的编号电视版本保留原文，只绑定紧邻的前名。
    if (
      (block.wrapper === "[" || block.wrapper === "【") &&
      /^(?:ТВ|TV)-\d+$/i.test(text.trim()) &&
      aliases.some((name) => /\p{Script=Cyrillic}/u.test(name))
    ) {
      const previous = blocks
        .slice(0, blocks.indexOf(block))
        .reverse()
        .find((piece) => piece.text.trim());
      if (
        previous &&
        !metadata(previous.text) &&
        !/^[\s|｜│/\\]+$/.test(previous.text) &&
        !/(?:[／/\\｜│;；]|(?<!\|)\|(?!\|))\s*$/.test(previous.text) &&
        !(
          previous.wrapper &&
          detectedOrganization &&
          (previous.text.trim() === detectedOrganization.raw.trim() ||
            previous.text
              .trim()
              .split(/\s*(?:[&＆+×／/]| x )\s*/)
              .every((name) => detectedOrganization.parts.includes(name)))
        ) &&
        !hasTechnicalGap(blocks, blocks.indexOf(block))
      ) {
        const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
        aliases[aliases.length - 1] +=
          gap + block.wrapper + text + block.closer;
      }
      continue;
    }
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      aliases.length &&
      !hasTechnicalGap(blocks, blocks.indexOf(block))
    ) {
      const seasonWithExtras = text
        .trim()
        .match(/^(S\d+|Season\s*\d+)(?:\s*[+]\s*(?:OVAs?|OADs?|SPs?))+$/i);
      if (seasonWithExtras) {
        const previous = blocks
          .slice(0, blocks.indexOf(block))
          .reverse()
          .find((piece) => piece.text.trim());
        // 独立收录说明不能跨过别名分隔符或语言等元信息绑定到旧名称。
        if (
          !previous ||
          metadata(previous.text) ||
          /(?:[／/\\｜│;；]|(?<!\|)\|(?!\|))\s*$/.test(previous.text)
        )
          continue;
        text = seasonWithExtras[1];
      }
    }
    if (/^\s*[.](?:ts|mkv|mp4|torrent|zip)\s*$/i.test(text)) continue;
    if (
      block.wrapper &&
      isAliasSeasonQualifier(text) &&
      hasTechnicalGap(blocks, blocks.indexOf(block))
    )
      continue;
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      /^(?:台|臺|港|中|日|美|英)$/.test(text)
    )
      continue;
    if (afterEpisode && !block.wrapper) {
      const wasTsArchive = /\bts[档檔]\s*$/i.test(text);
      text = text
        .replace(/\s+\d{1,3}\s+ts[档檔]\s*$/i, "")
        .replace(/\s*ts[档檔]\s*$/i, "");
      const repeatedNumber = text.match(/\s+(\d{2,3})\s*$/)?.[1];
      const originalNumber = input
        .slice(episodeStart, episodeEnd)
        .match(/\d+/)?.[0];
      const repeatedAlias =
        cjk.test(text) &&
        repeatedNumber &&
        originalNumber &&
        Number(repeatedNumber) === Number(originalNumber);
      const quotedAlias = text.match(/^\s*<([^<>]+)>\s*$/);
      if (quotedAlias) text = quotedAlias[1];
      const pipeAlias = Boolean(quotedAlias) || /^\s*[|｜](?![|｜])/.test(text);
      const tailAlias =
        pipeAlias ||
        (hasTechnicalGap(blocks, blocks.indexOf(block)) &&
          /^[A-Za-z][A-Za-z0-9:;!? '\-]+$/.test(text.trim()) &&
          text.trim().split(/\s+/).length >= 3 &&
          !/^[-–]/.test(text.trim())) ||
        Boolean(attachedWork) ||
        repeatedAlias ||
        /^[.][A-Za-z]/.test(text.trim()) ||
        kana.test(text) ||
        (/[／/]/.test(text) && cjk.test(text));
      if (!tailAlias && (!cjk.test(text) || !wasTsArchive)) continue;
      text = text.replace(/^\s*[.]/, "").replace(/\s*ts[档檔]\s*$/i, "");
      if (repeatedAlias) text = text.replace(/\s+\d{2,3}\s*$/, "");
    }
    // 归档清单的冒号之后是媒介范围，不是另外的作品标题。
    const archiveStart = input.search(/[：:_]TV[动動]画/);
    if (archiveStart >= 0 && block.start >= archiveStart) continue;
    const search = text.match(
      /^(?:检索(?:用)?|檢索(?:用)?|备用搜索|備用搜索)[：:]\s*(.+)$/
    );
    if (search) {
      // 斜杠开头的检索列表通常是同系列其他作品，不能当作当前作品的译名。
      if (!search[1].startsWith("/") && search[1].length > 0) {
        const names = splitAliases(
          search[1].replace(/\s+附(?:NCOP|NCED|NCOPED).*$/i, "")
        );
        if (!isSeriesSearch(names, aliases, true)) aliases.push(...names);
      }
      continue;
    }
    if (
      block.wrapper &&
      isAliasSeasonQualifier(text) &&
      /^\s*[|｜]\s*$/.test(blocks[blocks.indexOf(block) - 1]?.text ?? "")
    )
      continue;
    if (
      block.wrapper &&
      /^(?:S\d+|Season\s*\d+(?:\s+pt[.]?\s*\d+)?|Partie\s*\d+|\d+(?:st|nd|rd|th)\s+Season|第[一二三四五六七八九十\d]+[季期])$/i.test(
        text
      ) &&
      aliases.length &&
      !hasTechnicalGap(blocks, blocks.indexOf(block)) &&
      !/^\s*[|｜]\s*$/.test(blocks[blocks.indexOf(block) - 1]?.text ?? "") &&
      (!afterEpisode ||
        /[|｜]/.test(
          input.slice(
            blocks[blocks.indexOf(block) - 1]?.start ?? block.start,
            block.start
          )
        ))
    ) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      const previous = blocks[blocks.indexOf(block) - 1];
      const separator =
        !previous?.wrapper && /^\s*[-–]\s*$/.test(previous?.text ?? "")
          ? " -"
          : "";
      aliases[aliases.length - 1] +=
        separator + gap + block.wrapper + text + block.closer;
      continue;
    }
    if (
      /[（(]/.test(block.wrapper ?? "") &&
      /^Part\s+\d+$/i.test(text) &&
      /[|｜]\s*\d+(?:[-~～]\d+)?\s*$/.test(
        blocks[blocks.indexOf(block) - 1]?.text ?? ""
      )
    )
      continue;
    if (
      /[（(]/.test(block.wrapper ?? "") &&
      /^Part\s+\d+$/i.test(text) &&
      aliases.length &&
      /[|｜]/.test(blocks[blocks.indexOf(block) - 1]?.text ?? "")
    ) {
      aliases[aliases.length - 1] += " " + block.wrapper + text + block.closer;
      continue;
    }
    if (/^(?:19|20)\d{2}$/.test(text) && block.wrapper) {
      const previousBlock = blocks
        .slice(0, blocks.indexOf(block))
        .reverse()
        .find((piece) => piece.text.trim());
      if (previousBlock?.wrapper && metadata(previousBlock.text)) continue;
    }
    if (
      (!afterEpisode ||
        (/^(?:19|20)\d{2}$/.test(text) &&
          /[.](?:ass|ssa|srt|sub|sup|vtt)\s*$/i.test(originalInput) &&
          /^(?:OVA|OAD|SP|Special)$/i.test(
            input.slice(episodeStart, episodeEnd).trim()
          ) &&
          /^\s*$/.test(input.slice(episodeEnd, block.start)) &&
          !hasTechnicalGap(blocks, blocks.indexOf(block))) ||
        (/^(?:19|20)\d{2}$/.test(text) &&
          /(?<=\d)\s*[-~～]\s*\d/.test(input.slice(episodeStart, episodeEnd)) &&
          /^\s*$/.test(input.slice(episodeEnd, block.start)) &&
          !hasTechnicalGap(blocks, blocks.indexOf(block))) ||
        /[|｜]/.test(blocks[blocks.indexOf(block) - 1]?.text ?? "")) &&
      !/\(Movie\)\s*$/i.test(input.slice(0, block.start)) &&
      (block.wrapper === "(" || block.wrapper === "（") &&
      aliases.length > 0 &&
      /^(?:19|20)\d{2}$|^TV(?: Special)?$|^第[一二三四五六七八九十0-9]+[季期]$/i.test(
        text
      )
    ) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] +=
        gap + block.wrapper + text + pairs[block.wrapper];
      const following = blocks[blocks.indexOf(block) + 1];
      const continuation = following
        ? trimTechnicalTail(
            input
              .slice(following.start, Math.min(following.end, episodeStart))
              .replace(/\s+-\s*$/, "")
          )
        : "";
      if (
        following &&
        !following.wrapper &&
        following.start < episodeStart &&
        (/^\s*(?:\d+(?:st|nd|rd|th)\s+Season|Season\s*\d+)/i.test(
          following.text
        ) ||
          (/^(?:19|20)\d{2}$/.test(text) &&
            /^\s+\p{L}/u.test(following.text) &&
            /^[\p{L}\p{M}][\p{L}\p{M} '’!?-]*$/u.test(continuation) &&
            !metadata(continuation) &&
            !detectedOrganization?.parts.includes(continuation) &&
            !/[／/\\|｜;；]/.test(following.text) &&
            language(continuation) === language(aliases[aliases.length - 1])))
      ) {
        const suffix = input
          .slice(following.start, Math.min(following.end, episodeStart))
          .replace(/\s+-\s*$/, "")
          .trimEnd();
        const gap = suffix.match(/^\s*/)?.[0] ?? "";
        aliases[aliases.length - 1] += gap + trimTechnicalTail(suffix);
        following.text = "";
      }
      continue;
    }
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      /^(?:19|20)\d{2}$/.test(text) &&
      aliases.length > 1
    ) {
      const previous = blocks[blocks.indexOf(block) - 1];
      if (
        previous &&
        previous.start < episodeStart &&
        previous.end > episodeEnd &&
        /[A-Za-z]/.test(input.slice(episodeEnd, previous.end))
      ) {
        aliases[aliases.length - 1] +=
          (input.slice(0, block.start).match(/\s*$/)?.[0] ?? "") +
          block.wrapper +
          text +
          block.closer;
        continue;
      }
    }
    if (
      block.wrapper &&
      groupWord.test(text) &&
      aliases.length &&
      (/^[A-Za-z0-9._-]+-(?:Raws?|Subs?)$/i.test(text) ||
        blocks
          .slice(0, blocks.indexOf(block))
          .some((piece) => technical.test(piece.text) && metadata(piece.text)))
    )
      continue;
    if (!block.wrapper && !afterEpisode && aliases.length) {
      const seasonPrefix = text.match(
        /^(\s*)(第[一二三四五六七八九十\d]+[季期]|S\d+)\s*[／/]\s*(.+)$/i
      );
      if (seasonPrefix) {
        aliases[aliases.length - 1] += seasonPrefix[1] + seasonPrefix[2];
        text = seasonPrefix[3];
      }
    }
    if (
      block.wrapper &&
      /Box$/i.test(text) &&
      /\b\d+xDVD[59]\b/i.test(input.slice(0, block.start))
    )
      continue;
    if (block.wrapper && metadata(text)) {
      if (
        /^ONA$/i.test(text) &&
        /[（(]/.test(block.wrapper) &&
        aliases.length >= 2 &&
        language(aliases[aliases.length - 1]) === "latin" &&
        aliases.some((name) => language(name) !== "latin") &&
        !afterEpisode &&
        !hasTechnicalGap(blocks, blocks.indexOf(block))
      ) {
        const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
        aliases[aliases.length - 1] +=
          gap + block.wrapper + text + block.closer;
      }
      const following = blocks[blocks.indexOf(block) + 1];
      // 名称中夹入地区说明时去掉说明，保留两侧连续名称；紧贴正文的特别篇括注保留。
      if (
        !afterEpisode &&
        aliases.length &&
        following &&
        !following.wrapper &&
        following.start < episodeStart &&
        /^\s+\p{L}/u.test(following.text) &&
        (/^(?:仅限|僅限)/.test(text) || /^(?:特别篇|特別篇)$/.test(text))
      ) {
        const suffix = input
          .slice(following.start, Math.min(following.end, episodeStart))
          .replace(/\s+-\s*$/, "");
        const annotation = /^(?:特别篇|特別篇)$/.test(text)
          ? block.wrapper + text + pairs[block.wrapper]
          : "";
        const combined = aliases.pop()! + annotation + suffix.trimEnd();
        aliases.push(...splitAliases(combined));
        following.text = "";
      }
      continue;
    }
    if (afterEpisode && /\bCASE[.：:]/i.test(text)) continue;
    if (
      afterEpisode &&
      block.wrapper &&
      aliases.length &&
      !soundtrackWork &&
      !/^(?:搜索|检索|檢索)(?:用)?[：:]/.test(text) &&
      ((block.wrapper !== "(" && block.wrapper !== "（") ||
        /^.{1,8}[篇编編]$/.test(text)) &&
      cjk.test(text) &&
      blocks
        .slice(blocks.indexOf(block) + 1)
        .some((piece) => technical.test(piece.text) && metadata(piece.text)) &&
      !blocks
        .slice(0, blocks.indexOf(block))
        .some(
          (piece) =>
            piece.start >= episodeEnd &&
            technical.test(piece.text) &&
            metadata(piece.text)
        )
    ) {
      const coveredLanguages = new Set(aliases.map(language));
      const candidateNames = splitAliases(text);
      if (
        candidateNames.length &&
        candidateNames.every((name) => coveredLanguages.has(language(name)))
      )
        continue;
    }
    if (
      afterEpisode &&
      /^[\p{Script=Han}+]+$/u.test(text) &&
      text.includes("+")
    )
      continue;
    if (
      block.wrapper === "[" &&
      aliases.length &&
      !blocks[blocks.indexOf(block) - 1]?.wrapper &&
      /\s+[-–]\s*$/.test(blocks[blocks.indexOf(block) - 1]?.text ?? "") &&
      /\s+[-–]\s*$/.test(aliases[aliases.length - 1]) &&
      !metadata(text) &&
      !groupWord.test(text) &&
      !detectedOrganization?.parts.includes(text.trim()) &&
      !(
        blocks[blocks.indexOf(block) + 1] &&
        !blocks[blocks.indexOf(block) + 1].wrapper &&
        !/^\s*[／/\\|｜]/.test(blocks[blocks.indexOf(block) + 1].text) &&
        /\p{L}/u.test(
          input.slice(
            block.end,
            Math.min(blocks[blocks.indexOf(block) + 1].end, episodeStart)
          )
        ) &&
        !metadata(blocks[blocks.indexOf(block) + 1].text)
      )
    ) {
      aliases[aliases.length - 1] = aliases[aliases.length - 1].replace(
        /\s+[-–]\s*$/,
        ""
      );
      aliases.push(...splitAliases(text));
      continue;
    }
    if (
      (!afterEpisode ||
        /[|｜]/.test(
          input.slice(
            blocks[blocks.indexOf(block) - 1]?.start ?? block.start,
            block.start
          )
        )) &&
      block.wrapper === "[" &&
      /^[A-Za-z][A-Za-z -]*$/.test(text) &&
      block.start > 0 &&
      /\s/.test(input[block.start - 1]) &&
      aliases.length &&
      !/\bBox\s*\d+\s+Remastered\b/i.test(input.slice(0, block.start)) &&
      (language(aliases[aliases.length - 1]) === "latin" ||
        (/[A-Za-z]/.test(aliases[aliases.length - 1]) &&
          blocks[blocks.indexOf(block) + 1] &&
          !blocks[blocks.indexOf(block) + 1].wrapper &&
          blocks[blocks.indexOf(block) + 1].start < episodeStart &&
          !metadata(blocks[blocks.indexOf(block) + 1].text)))
    ) {
      aliases[aliases.length - 1] += " [" + text + "]";
      const following = blocks[blocks.indexOf(block) + 1];
      if (
        following &&
        !following.wrapper &&
        (following.start < episodeStart || afterEpisode) &&
        !metadata(following.text)
      ) {
        const suffix = input
          .slice(
            following.start,
            afterEpisode ? following.end : Math.min(following.end, episodeStart)
          )
          .replace(/\s+[-–]\s*$/, "");
        const combined = aliases.pop()! + suffix.trimEnd();
        aliases.push(...splitAliases(combined));
        if (!afterEpisode && following.end > episodeEnd)
          aliases.push(
            ...input
              .slice(episodeEnd, following.end)
              .split(/(?<!\|)[|｜](?!\|)/)
              .slice(1)
              .flatMap(splitAliases)
          );
        following.text = "";
      }
      continue;
    }
    if (
      afterEpisode &&
      block.wrapper &&
      block.wrapper !== "(" &&
      block.wrapper !== "（" &&
      !kana.test(text) &&
      !/[A-Za-z][A-Za-z0-9].*[A-Za-z][A-Za-z0-9]/.test(text)
    )
      continue;
    if (!block.wrapper) {
      const following = blocks[blocks.indexOf(block) + 1];
      const nextAfterFollowing = blocks[blocks.indexOf(block) + 2];
      if (
        aliases.length >= 2 &&
        following?.wrapper &&
        /^(?:前篇|后篇|後篇|前编|后编|後編)$/.test(following.text) &&
        nextAfterFollowing?.wrapper &&
        /^\d{4}[.\/-]\d{2}[.\/-]\d{2}$/.test(nextAfterFollowing.text) &&
        !/[／/\\|]/.test(text)
      ) {
        following.text = "";
        continue;
      }
      if (
        aliases.length >= 2 &&
        following?.wrapper &&
        /^\d{4}[.\/-]\d{2}[.\/-]\d{2}$/.test(following.text) &&
        !/[／/\\|]/.test(text)
      )
        continue;
      text = text.replace(
        /^\s*[「『]?(?:[^\s★」』]+字幕[组組社])[」』]?\s*[★:：]?/,
        ""
      );
      text = text
        .replace(/^\s*★(?:SP|OVA|OAD)★\s*/i, "")
        .replace(/^\s*[★♦◆](?:剧场版|劇場版)[★♦◆]?\s*/, "")
        .replace(/^\s*★?(?:\d{1,2}月(?:新)?番)★?\s*/, "")
        .replace(/^\s*(?:OVA|OAD)\s+/i, "");
    }
    if (/\b(?:2160p|UHD)\b/i.test(text))
      text = text.replace(/(?<=[\p{Script=Han}])4K(?=[.][A-Za-z])/u, "");
    text = text
      .replace(/[\u200b\ufeff]/g, "")
      .replace(/高清修复版[.]?|高清修復版[.]?/g, "");
    const followingBlock = blocks[blocks.indexOf(block) + 1];
    // 两侧下划线包住的尾部编号，须由紧随的发行标签或校验码作证。
    if (
      !block.wrapper &&
      followingBlock?.wrapper &&
      metadata(followingBlock.text) &&
      /_\d{2,4}_+$/.test(block.text)
    )
      text = text.replace(/_((?:\d){2,4})_+$/, (ending, number) =>
        /^(?:19|20)\d{2}$/.test(number) ? ending : ""
      );
    if (
      !block.wrapper &&
      followingBlock?.start === block.end &&
      followingBlock.wrapper &&
      /_+$/.test(block.text) &&
      !(
        /^(?:19|20)\d{2}$/.test(followingBlock.text) &&
        /\p{L}_\p{L}/u.test(block.text)
      )
    )
      text = text.replace(/_+$/, "");
    if (
      !block.wrapper &&
      followingBlock?.wrapper &&
      metadata(followingBlock.text)
    )
      text = text.replace(/\s+[\[【]\d{1,3}\s*$/, "");
    if (
      followingBlock &&
      block.end <= episodeStart &&
      /[（(]/.test(followingBlock.wrapper ?? "") &&
      /^\d{1,3}$/.test(followingBlock.text)
    )
      text = text.replace(/\s+\d{1,3}\s*$/, "");
    if (
      block.wrapper &&
      aliases.length &&
      /^0\d\s+[\p{Script=Han}]/u.test(text)
    )
      continue;
    if (
      !block.wrapper &&
      episodeStart === input.length &&
      (videoFilename ||
        /\bsubs? only\b|\bsubtitle file only\b/i.test(originalInput) ||
        (followingBlock?.wrapper &&
          metadata(followingBlock.text) &&
          technical.test(followingBlock.text)))
    ) {
      const captionText = trimTechnicalTail(text);
      const episodeCaption =
        captionText.match(/^(.+?)\s+\d{2,3}\s+[-–]\s+(.+)$/) ??
        captionText.match(/^(.+?)\s+[-–]\s+\d{2,3}[-–](\p{L}.+)$/u);
      if (
        episodeCaption &&
        !/\b(?:Movie|Film|Season|Part|Vol[.]?)\s*$/i.test(episodeCaption[1])
      )
        text = episodeCaption[1];
    }
    text = trimTechnicalTail(text);
    if (
      !block.wrapper &&
      followingBlock?.wrapper &&
      followingBlock.start === episodeStart &&
      /^\d+(?:\s*[-~–]\s*\d+)?$/.test(followingBlock.text) &&
      !/\s+[-–].+[-–]\s*$/.test(text)
    )
      text = text.replace(/\s+[-–]\s*$/, "");
    if (!block.wrapper && videoFilename) {
      text = text.replace(/_\d{2,4}_?\s*$/, "");
      if (/^[.]?[A-Za-z][A-Za-z.]+[.]\d{1,4}[.]\s*$/.test(text.trim()))
        text = text.trim().replace(/^[.]|[.]\d{1,4}[.]\s*$/g, "");
    }
    if (
      !block.wrapper &&
      /(?:\s+(?:Specials|Shorts)|_Special)\s*$/i.test(text) &&
      episodeStart < input.length
    )
      text = text.replace(/(?:\s+(?:Specials|Shorts)|_Special)\s*$/i, "");
    if (
      !block.wrapper &&
      episodeStart === input.length &&
      followingBlock?.wrapper &&
      metadata(followingBlock.text) &&
      !/^(?:19|20)\d{2}(?:[-–](?:19|20)\d{2})?$/.test(followingBlock.text)
    )
      text = text.replace(/\s+(?:The\s+)?Complete (?:Series|Season)$/i, "");
    if (!block.wrapper && /^\s*\d+(?:\s*[,，]\s*\d+)*\s*$/.test(text)) continue;
    if (!block.wrapper) {
      const year = text.match(/\s+((?:19|20)\d{2})$/)?.[1];
      if (
        year &&
        /^S\d+E\d+/i.test(input.slice(episodeStart).trimStart()) &&
        !input.includes(year + "年版") &&
        !/(?:\d(?:[/-]\d+|\s+\d+)|\b(?:19|20)\d{2})\s+(?:19|20)\d{2}$/.test(
          text
        )
      )
        text = text.slice(0, text.length - year.length).trimEnd();
    }
    if (
      !block.wrapper &&
      episodeStart === input.length &&
      !(
        (followingBlock?.wrapper === "(" || followingBlock?.wrapper === "（") &&
        /^(?:19|20)\d{2}$/.test(followingBlock.text)
      ) &&
      !(
        /\bSeason\s+\d+$/i.test(text) &&
        !/\d+(?:st|nd|rd|th)\s+Season\s+\d+$/i.test(text)
      ) &&
      !/\s+[1-9]\d{1,2}\s+(?:(?:GB|CHS|CHT|BIG5)\s+)?(?:[248]K|\d{3,4}P)\b/i.test(
        block.text
      )
    )
      text = text.replace(/\s+(\d{2,4})(?:\.\d)?$/, (ending, number) => {
        const prefix = text.slice(0, -ending.length);
        // 构建号与版本号属于产品名称，三四位集数还需明确的视频技术块作证。
        if (
          /^(?:19|20)\d{2}$/.test(number) ||
          /\s+[-–]\s+(?:The|A|An)\s+\p{L}.+\s+\p{L}/iu.test(prefix) ||
          /\b(?:Build|Version|Ver[.]?|Revision|Rev[.]?|Release)\s*#?\s*$|(?:版本(?:号|號)?|构建(?:号|號)?)\s*$/i.test(
            prefix
          ) ||
          (number.length >= 3 &&
            !videoFilename &&
            !(
              followingBlock?.wrapper &&
              metadata(followingBlock.text) &&
              technical.test(followingBlock.text)
            ))
        )
          return ending;
        return "";
      });
    if (block.wrapper && episodeStart === input.length)
      text = text.replace(
        /^([\p{Script=Han}][^A-Za-z/]+?)\s+\d{2,4}(?:&\d{2,4})?\s+[\p{Script=Han}].*$/u,
        "$1"
      );
    if (
      episodeStart === input.length &&
      !block.wrapper &&
      /(?:第?\d+[季期]|part\d+)/i.test(text)
    ) {
      const following = blocks[blocks.indexOf(block) + 1];
      if (following && metadata(following.text))
        text = text.replace(/\s+\d{2,3}\s*$/, "");
    }
    if (
      /^\s*(?:[-–]\s*)?Season\s*\d+\s+S\d+\s*$/i.test(text) &&
      (afterEpisode ||
        blocks
          .slice(0, blocks.indexOf(block))
          .some((piece) => technical.test(piece.text) && metadata(piece.text)))
    )
      continue;
    if (
      /^(?:[-–]\s*)?(?:S\d+|Season\s*\d+(?:\s+S\d+)?|Partie\s*\d+|第[一二三四五六七八九十\d]+[季期]|\d+(?:st|nd|rd|th)\s+Season)$/i.test(
        text.trim()
      ) &&
      aliases.length
    ) {
      aliases[aliases.length - 1] +=
        (block.text.match(/^\s*/)?.[0] ?? "") + text.trim();
      continue;
    }
    if (
      /^\s*Seasons?\s*$/i.test(text) &&
      /\bS\d+\s*[+]\s*S\d+\b/i.test(block.text)
    )
      continue;
    if (!text || metadata(text)) continue;
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      aliases.length > 0 &&
      /^(?:19|20)\d{2}$|^TV$|^第?[一二三四五六七八九十百0-9]+[季期]$|^四期$/.test(
        text
      )
    ) {
      if (aliases.length) aliases[aliases.length - 1] += ` (${text})`;
      continue;
    }
    const explicitPipeField = input
      .slice(episodeEnd, block.start)
      .match(/[|｜]([^|｜]*)$/)?.[1]
      ?.trim();
    const pipeClauseAnnotation =
      afterEpisode &&
      explicitPipeField &&
      explicitPipeField === aliases[aliases.length - 1]?.trim() &&
      /\b(?:desu|masu)$/i.test(explicitPipeField) &&
      /^[A-Z]?[a-z]+$/.test(text.trim());
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      aliases.length > 0 &&
      (!afterEpisode || pipeClauseAnnotation) &&
      (!isClauseAnnotation(aliases[aliases.length - 1], text) ||
        hasAdjacentName(blocks, blocks.indexOf(block))) &&
      !/[／/|｜]/.test(text) &&
      (!/[;；]/.test(text) || isInventoryAnnotation(text)) &&
      (!hasTechnicalGap(blocks, blocks.indexOf(block)) ||
        pipeClauseAnnotation) &&
      ((language(aliases[aliases.length - 1]) === language(text) &&
        !looksLikeAlternative(aliases[aliases.length - 1], text)) ||
        /^(?:前篇|后篇|後篇|前编|后编|後編)$/.test(text) ||
        (/^[!?！？]/.test(
          blocks[blocks.indexOf(block) + 1]?.text.trimStart() ?? ""
        ) &&
          !blocks[blocks.indexOf(block) + 1]?.wrapper) ||
        (blocks[blocks.indexOf(block) + 1]?.start < episodeStart &&
          !blocks[blocks.indexOf(block) + 1]?.wrapper &&
          /^\s+[A-Za-z]/.test(blocks[blocks.indexOf(block) + 1]?.text ?? "") &&
          /[A-Za-z]\s*$/.test(aliases[aliases.length - 1]) &&
          (/^[A-Za-z]+$/.test(text) ||
            /^\s+(?:wo|ni|de|to|ga|wa|no|o)\b/.test(
              blocks[blocks.indexOf(block) + 1]?.text ?? ""
            ))))
    ) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
      const following = blocks[blocks.indexOf(block) + 1];
      if (
        following &&
        !following.wrapper &&
        following.start === block.end &&
        (following.start < episodeStart ||
          (pipeClauseAnnotation &&
            /^\s*(?:[!?！？]+\s*)?(?:[|｜／/\\]|$)/.test(following.text))) &&
        !metadata(following.text) &&
        (!/^\s*[／/\\-]/.test(following.text) ||
          (pipeClauseAnnotation && /^\s*[／/]/.test(following.text)))
      ) {
        const suffix = input
          .slice(
            following.start,
            pipeClauseAnnotation
              ? following.end
              : Math.min(following.end, episodeStart)
          )
          .replace(
            following.end > episodeStart && episodeStart < input.length
              ? /\s+[-–]\s*$/
              : /(?!)/,
            ""
          );
        const combined = aliases.pop()! + suffix.trimEnd();
        aliases.push(...splitAliases(combined));
        if (following.end > episodeEnd)
          aliases.push(
            ...input
              .slice(episodeEnd, following.end)
              .split(/(?<!\|)[|｜](?!\|)/)
              .slice(1)
              .flatMap(splitAliases)
          );
        following.text = "";
      }
      continue;
    }
    if (
      episodeStart === input.length &&
      block.wrapper !== "(" &&
      block.wrapper !== "（"
    ) {
      const year = text.match(/\s+((?:19|20)\d{2})$/)?.[1];
      if (year && input.split(year).length < 3)
        text = text.replace(/\s+(?:19|20)\d{2}$/, "");
    }
    const decorated = text.includes("⯎")
      ? text
          .split("⯎")
          .map((part) => part.trim())
          .filter(Boolean)
      : [text];
    if (
      decorated.length > 1 &&
      /^S\d+$/i.test(decorated[decorated.length - 1])
    ) {
      const season = decorated.pop()!;
      decorated[decorated.length - 1] += " " + season;
    }
    const names = decorated.flatMap((part) =>
      block.wrapper === "(" || block.wrapper === "（"
        ? splitBracketAliasList(part).flatMap(splitAliases)
        : splitAliases(part)
    );
    if (
      afterEpisode &&
      block.wrapper &&
      !/[;；]/.test(block.text) &&
      isSeriesSearch(names, aliases)
    )
      continue;
    aliases.push(...names, ...trailingNames.flatMap(splitAliases));
  }
  // 上面的历史分段仍只服务名称识别；发布者字段采用独立的制作组判定。
  const productionCredit = originalInput.match(
    /(?:^|[\]】]\s*)([\p{L}\p{N}][\p{L}\p{M}\p{N} .'-]{0,80} Animation Study Group)\s+[-–]\s+(?=\S)/iu
  );
  const groups = detectedOrganization?.parts ?? [];
  const originalBlocks = segments(originalInput);
  const trailingOrganizationBlock =
    detectedOrganization &&
    originalBlocks.find((block, index) => {
      const credit = block.wrapper
        ? block.text.trim()
        : block.text.trim().replace(/^[-–]\s+/, "");
      return (
        (block.wrapper || /^[-–]\s+/.test(block.text.trim())) &&
        (credit === detectedOrganization.raw.trim() ||
          credit
            .split(/\s*(?:[&＆+×／/]| x )\s*/)
            .every((name) => groups.includes(name))) &&
        hasTechnicalGap(originalBlocks, index)
      );
    });
  const restoreMediaQualifier =
    repeatedMediaQualifier &&
    aliases
      .filter(
        (name) =>
          !groups.includes(name) &&
          name !== trailingOrganizationBlock?.text.trim()
      )
      .every((name) => {
        const base = name
          .replace(/\s*[(（](?:19|20)\d{2}[)）]$/, "")
          .replace(new RegExp(`\\s+${repeatedMediaQualifier}$`, "i"), "");
        return originalInput.includes(base + " " + repeatedMediaQualifier);
      });
  if (assetCollection) aliases.length = 0;
  const unique = [
    ...new Set(
      aliases
        .map((name) => {
          const pipeMedia = originalInput.match(
            /[|｜]\s*([^|｜]+?)\s+(OVA|OAD|ONA)\s*$/i
          );
          if (
            pipeMedia &&
            name === pipeMedia[1].trim() &&
            aliases.some((alias) => /\bSeason\s+\d+/i.test(alias))
          )
            name += " " + pipeMedia[2];
          if (/_v\d+$/i.test(name) && originalInput.includes(name + "_("))
            name = name.replace(/_v\d+$/i, "");
          if (
            name === trailingOrganizationBlock?.text.trim() ||
            (trailingOrganizationBlock &&
              !trailingOrganizationBlock.wrapper &&
              name ===
                trailingOrganizationBlock.text.trim().replace(/^[-–]\s+/, ""))
          )
            return "";
          if (restoreMediaQualifier) {
            const version = name.match(/^(.*?)(\s*[(（](?:19|20)\d{2}[)）])$/);
            const base = version ? version[1] : name;
            if (
              !new RegExp(`\\s+${repeatedMediaQualifier}$`, "i").test(base) &&
              originalInput.includes(base + " " + repeatedMediaQualifier)
            )
              name = base + " " + repeatedMediaQualifier + (version?.[2] ?? "");
          }
          for (const group of groups) {
            if (
              (name === "-" + group &&
                originalInput.trimEnd().endsWith(name)) ||
              (name === group &&
                productionCredit?.[1] === group &&
                !originalBlocks.some(
                  (block) => block.wrapper && block.text.trim() === group
                ))
            )
              return "";
            const groupPosition = Math.max(
              originalInput.lastIndexOf("[" + group + "]"),
              originalInput.lastIndexOf("【" + group + "】")
            );
            if (
              name === group &&
              ((groupPosition >= episodeEnd && episodeEnd < input.length) ||
                Boolean(trailingOrganizationBlock) ||
                (groupPosition > 0 &&
                  (/[.](?:ass|ssa|srt|sup|vtt|sub)\s*$/i.test(originalInput) ||
                    originalBlocks.some(
                      (piece) =>
                        piece.start < groupPosition &&
                        /\b(?:Subtitle|Scripts?)\b/i.test(piece.text) &&
                        metadata(piece.text)
                    )) &&
                  aliases.length > 1 &&
                  !/\s*[／/|｜]\s*$/.test(
                    originalInput.slice(0, groupPosition)
                  )))
            )
              return "";
            const suffix = " [" + group + "]";
            if (name.endsWith(suffix) && groupPosition > 0)
              name = name.slice(0, -suffix.length);
          }
          return name;
        })
        .filter(Boolean)
    ),
  ];
  return {
    title: { raw: unique.join(" / "), aliases: unique },
    ...(detectedOrganization ? { organization: detectedOrganization } : {}),
  };
}
