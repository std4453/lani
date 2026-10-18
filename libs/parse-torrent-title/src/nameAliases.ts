import { cjk, technical, metadata } from "./nameMetadata";
import { Segment, segments } from "./nameSegments";
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

export function trimTechnicalTail(text: string): string {
  const pipeParts = text.split(/(?<!\|)[|｜](?!\|)/);
  if (pipeParts.length > 1) return pipeParts.map(trimTechnicalTail).join(" | ");
  text = text
    .replace(/(?:\s+[-–]\s+|_)(?:Episode|Chapter)[_ ]+\d+(?:[.]\d+)?\s*$/i, "")
    .replace(/\s+(?:Ep(?:isode)?s?[.]?\s+#?\s*|#)\d+(?:[.]\d+)?\s*$/i, "")
    .replace(/\s+S\d+x\d+\s*$/i, "")
    .replace(/\s*[+]\s*Special\s*$/i, "");
  text = text
    .replace(/(?:\s+|_)karaoke\s+by\s+.*$/i, "")
    .replace(/\s+Picture Drama\s+\d+\s*$/i, "")
    .replace(/\s+Crossover\s+Part\s+\d+\s*$/i, "")
    .replace(/\s+OVA\s+[IVX]+\s*$/i, "");
  // 点号连接的年份只有紧接明确的发行技术字段时才是发行年。
  text = text.replace(/[.]Movie[.](?:19|20)\d{2}(?=[.]MULTi\b)/i, "");
  text = text.replace(
    /[.](?:19|20)\d{2}(?=[.](?:MULTi\b|Hybrid[.](?:[A-Z]{2}-)?DVDRip\b))/i,
    ""
  );
  // 平台代码只有紧邻明确的 WEB 来源链时才作为来源字段移除。
  text = text.replace(
    /(?:\s+|[._])(?:NF|CR|AMZN|DSNP|Baha)(?=[ ._-]+WEB[ ._-]?(?:DL|RIP)\b)/gi,
    " "
  );
  text = text.replace(/\s+[IVX]+[-~–][IVX]+(?=\s+Subs?[+]Fonts\s+for\b)/i, "");
  // 技术参数可没有外括号；只在独立词边界处截断，避免伤及标题内部数字。
  const boundary =
    /(?:\s+|[._★])(?=(?:\d{3,4}\s*[xX×]\s*\d{3,4}|(?:480|576|720|1080|2160)[pP]|[248]K(?=$|[ ._-]+(?:HEVC|AVC|x26[45]|HDR|SDR|BD|WEB|BluRay)\b)|(?:8|10|12)[ -]?bit\b|(?:WEB(?=[- ](?:\d{3,4}p\b|x26[45]\b|HEVC\b|AVC\b))|WEB[ ._-]?(?:DL|RIP)|Blu[ ._-]?Ray|Hybrid(?=[. _-]+[A-Z]{2}[-_]DVDRIP)|BD|BDRIP|UHDBDRIP|UHDRIP|(?:[A-Z]{2}[-_])?DVDRIP|HEVC|AVC|x26[45])(?=$|[\W_])))/i;
  // 非标准分辨率（如手误1090P）须由整段已知字幕/编码参数佐证。
  const parameterTail =
    /(?:\s+|[._])(?:(?:GB|BIG5|CHS|CHT)[ _-]+)?\d{3,4}P(?=$|[\s._-])/i.exec(
      text
    );
  const knownTail =
    parameterTail &&
    text
      .slice(parameterTail.index)
      .replace(/^[\s._]+/, "")
      .split(/[\s_]+/)
      .every(metadata)
      ? parameterTail
      : null;
  const regular = boundary.exec(text);
  const match =
    knownTail && (!regular || knownTail.index < regular.index)
      ? knownTail
      : regular;
  if (match) {
    const atUhd =
      /^[\s._★]+[248]K\b/i.test(text.slice(match.index)) || match === knownTail;
    text = text
      .slice(0, match.index)
      .replace(atUhd ? /\s+(?:-\s+)?0\d{2}$/ : /\s+(?:-\s+)?\d{2,3}$/, "")
      .replace(/[.](?:19|20)\d{2}$/, "")
      .replace(/\s+[-–]\s*$/, "");
  }
  return (
    text
      .replace(/^REPACK(?:\d+)?\s+/i, "")
      .replace(/\s+(?:[-–]\s*)?CUSTOM$/i, "")
      .replace(/\s+subs?\s+only$/i, "")
      .replace(/\s*[-–]\s*第番外[话話集]\s*[-–]?$/, "")
      .replace(/合集\s*全[（(][^)）]+[)）]$/, "")
      .replace(/_OVAs$/i, "")
      .replace(/(\bS\d+)\s+REMASTERED$/i, "$1")
      .replace(/\s+Subs?(?:[+]Fonts)?\s+for\s+.+$/i, "")
      .replace(/\s+Latest PV$/i, "")
      .replace(/\s+(?:Dual|Multi)[ -]Audio\s*$/i, "")
      .replace(/[._\s]+BDREMUX\s*$/i, "")
      .replace(/\s+[-–]\s*\d{1,4}\s+(?:FHD|HD)\s*$/i, "")
      .replace(
        /\s+S\d+\s*>\s*S\d+(?:\s*[+]\s*(?:FILMS?|MOVIES?|OVAs?|SPs?))*$/i,
        ""
      )
      .replace(/\s+TV\s+\d+(?:-\d+)?(?:,\d+(?:-\d+)?)+\s*$/i, "")
      .replace(/(\bS\d+)\s+cour\s*\d+\s+hq$/i, "$1")
      .replace(
        /(S\d+)\s*[+＆&]\s*(?:OVAs?|OADs?|SP)(?:\s*[+＆&]\s*(?:OVAs?|OADs?|SP))*\s*$/i,
        "$1"
      )
      .replace(/\s*[(（](?:Japanese|English|German)\s+ver[.]?[)）]\s*$/i, "")
      .replace(
        /(?:[._\s]+)(?:SUBFRENCH|TRUEFRENCH|VOSTFR|MULTi|REPACK\d*|UNCENSORED)(?=$|[._\s]).*$/i,
        ""
      )
      .replace(
        /\s+(?:(?:German|English|Japanese|French|Spanish|Italian|Russian|Portuguese)\s*[,/]\s*)+(?:German|English|Japanese|French|Spanish|Italian|Russian|Portuguese)(?:\s+.*)?$/i,
        ""
      )
      .replace(
        /\s+(?:[-–]\s*)?(?:S\d+|(?:\d+)?(?:TV|MOVIE|OVA|OAD|ONA|SP|EX|LIVE|剧场版|劇場版)(?:s|[x×]?\d+)?)(?:\s*[+＆&]\s*(?:S\d+|(?:\d+)?(?:TV|MOVIE|OVA|OAD|ONA|SP|EX|LIVE|剧场版|劇場版)(?:s|[x×]?\d+)?))+(?:\s*(?:合集|全集|FIN|END))?\s*$/i,
        ""
      )
      .replace(/(?:\s+[-–]\s*)?合集\s*$/, (ending, _offset, original) =>
        metadata(original) ? ending : ""
      )
      .replace(/\s+[-–]\s*EX\s*$/i, "")
      .replace(/(?:\s*[+]\s*|[_ ])(?:OVA|OAD)\s*$/i, "")
      .replace(/\s+TV\s+剪[辑輯]版\s*$/i, "")
      .replace(/\s+超[后後][宫宮]版\s*$/, "")
      .replace(/\s+(?:[日英中台泰越国國粤粵韩韓]+配版|普通[话話]版)\s*$/, "")
      .replace(/全集(?:无水印|無水印)(?:高清)?(?:迅雷)?下[载載]\s*$/, "")
      .replace(
        /\s+(?:[-–]\s*|TV\s+)?\d{1,4}(?:-\d{1,4})?(?:\s*,\s*\d{1,4}(?:-\d{1,4})?)+\s*$/i,
        (ending) => (/^\s+\d{1,3}(?:,\d{3})+\s*$/.test(ending) ? ending : "")
      )
      .replace(/\s+s\s+\d+\s*[-~–]\s*\d+\s*$/i, "")
      .replace(/\s+(?:NCOP|NCED)(?:\s+(?:NCOP|NCED))*\s*$/i, "")
      .replace(/\s+Seasons?\s+S\d+(?:\s*[+]\s*S\d+)+\s*$/i, "")
      .replace(/\s+S\d+\s*>\s*S\d+\s*$/i, "")
      .replace(
        /(?:[.](?:19|20)\d{2}(?:[-–](?:19|20)\d{2})?)?[._\s]+(?:-\s*)?S\d+(?:\s*[-~～–+]\s*S?\d+)+(?:[._\s]*(?:FIN|END|全集|合集))?\s*$/i,
        ""
      )
      .replace(/(?:第)?[一二三四五六七八九十\d]+季(?:全|全集|合集)\s*$/, "")
      .replace(/\s+-\s*\d+Remake\s*$/i, "")
      .replace(
        /\s+(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE)(?:\s*[+.]+\s*(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE|感谢祭|感謝祭))+(?:\s+Fin)?\s*$/i,
        ""
      )
      .replace(
        /\s+(?:S\d+\s*[-~～–+]\s*S?\d+|(?:第)?[一二三四五六七八九十\d]+\s*[-~～–+]\s*[一二三四五六七八九十\d]+季)(?:全集|合集)?\s*$/i,
        ""
      )
      .replace(/\s+(?:高清重制版|高清重製版|HDリセット版)\s*$/i, "")
      // 空白段仅从起点匹配；冒号与后续空白分开，避免失败时反复分配同一段空白。
      .replace(/(?<!\s)(?:\s*[:：])?\s+HD Remastered(?: Edition)?\s*$/i, "")
      .replace(/\s+\d{1,3}\s+ts档\s*$/i, "")
      // 配音版本可夹在名称和独立季数之间，删去标签时仍保留原来的季数。
      .replace(
        /\s+(?:Japanese|English|German|French|Spanish|Italian|Russian|Portuguese|Chinese|Korean)\s+(?:ver(?:sion)?[.]?|dub(?:bed)?|audio)(?=\s+S\d+\s*$|\s*$)/gi,
        ""
      )
      .replace(
        /\s+(?:Japanese|English|German|French|Spanish|Italian|Russian|Portuguese|Chinese|Korean)(?=\s+S\d+\s*$|\s*$)/gi,
        ""
      )
      .replace(
        /\s+(?:(?:英|日|国|國|中|粤|粵|韩|韓|德|法|俄|西|葡|意大利)(?:语|語)?(?:版|配音版)|[简簡繁中日英]+(?:字幕|中字|双字|雙字)?|典藏版|整合版)\s*$/,
        ""
      )
      .replace(/(?:19|20)\d{2}年度\s*$/, "")
      .replace(
        /[.]TV[.](?:19|20)\d{2}(?:[–-](?:19|20)\d{2})?(?=[.].*(?:语|語|字幕|DVD|BD|WEB)).*$/i,
        ""
      )
      .replace(/TV[.](?=(?:日|英|德|法|俄|意大利)(?:语|語))/, ".")
      .replace(/[.][A-Z]{2,3}DUB$/i, "")
      .replace(/\s+(?:German|English|French|Japanese)\s+DL\b.*$/i, "")
      .replace(
        /\s+[-–]\s+(?:NCOP(?:s)?[+]NCEDs?|Box\s*\d+\s+Remastered|Inédits?(?:\s+(?:canon|VF))?)\s*$/i,
        ""
      )
      .replace(
        /\s*[-–]\s*(?:OVAs?\s*[+]\s*(?:CDs?|Interviews)(?:\s*[+]\s*SCANS)?).*$/i,
        ""
      )
      .replace(/\s+[-–]\s+Episode\s+\d+$/i, "")
      .replace(/\s+[-–]{2,}\s+(?:aud|sub)\s*$/i, "")
      .replace(/\s+\d+\s+SUB\s+-\s+.*$/i, "")
      .replace(/\s+[中英日俄国國粤粵韩韓法德意西葡]+(?:文|语|語)?配音\s*$/, "")
      .replace(/\s+Complete$/i, "")
      .replace(/\s+-Part\s*\d+-$/i, "")
      .replace(/\s+CM$/i, "")
      .replace(/(?:_[-]_?|\s+-\s+)(?:Menu|Scans|OP[+]ED)$/i, "")
      .replace(/\s+[+]\s+Specials\s*&?\s*$/i, "")
      .replace(/\s+Vol[.]?\s*\d+\s*&\s*$/i, "")
      .replace(/\s+Extras\s*$/i, "")
      .replace(
        /((?:\bS\d+|\b\d+(?:st|nd|rd|th)\s+Season|\bSeason\s*\d+))\s+Part\s+\d+\s*[&+]\s*\d+$/i,
        "$1"
      )
      .replace(/\s+(?:Episodes?|EP)\s*\d+(?:\s*[-–]\s*\d+)?\s*[-–]?$/i, "")
      .replace(
        /[._ ]+(?:19|20)\d{2}[._ ]+(?:REMASTERED|CUSTOM)(?:[._ ]+(?:REMASTERED|CUSTOM))*$/i,
        ""
      )
      .replace(/(\s+S\d+)\s+Specials$/i, "$1")
      .replace(/\s+S\d+E\d+-\s*$/i, "")
      .replace(/_\d+_(?:ger|eng|fre|spa)_sub$/i, "")
      .replace(/\s+\d+\s+a\s+\d+\s+Sub\s+.*$/i, "")
      .replace(
        /\s+Subs?(?:titles)?\s+(?:valencià|español|castellano|català|Catalan|Spanish|English)(?:[-_/+](?:valencià|español|castellano|català|Catalan|Spanish|English))*\s*$/i,
        ""
      )
      .replace(/\s+-\s+Season\s+Movie\s*[+]\s*Special\s*-?$/i, "")
      .replace(
        /[._ ]+(?:19|20)\d{2}(?:[-–](?:19|20)\d{2}|[.]REMASTERED[.]CUSTOM)$/i,
        ""
      )
      .replace(/[.]Movie[.](?:19|20)\d{2}$/i, "")
      .replace(/[.](?:19|20)\d{2}(?=[.]S\d+)/i, "")
      .replace(/\s+(?:19|20)\d{2}(?=\s+S\d+[.]CUSTOM$)/i, "")
      .replace(/(?<=\bS\d+)[.]CUSTOM$/i, "")
      .replace(/[.]S\d+[.]&[.]S\d+[.](?:German|English)[.]DUBBED[.]AC3$/i, "")
      .replace(/[.](?:19|20)\d{2}-(?:19|20)\d{2}[.]TV[+]\d*SP$/i, "")
      .replace(/[.](?:GBR|UHD)(?:[.](?:GBR|UHD))*$/i, "")
      .replace(/(?<=[.]S\d+)[.]?v\d+$|\s+v\d+$/i, "")
      .replace(/[_]+-(?:_Ep)?[_]*\d*(?:~\d+)?$/i, "")
      .replace(/\s+Films\s+\d+\s+à\s+\d+\s+法语版$/i, "")
      .replace(/\s+-\s+S\d+(?:\+S\d+)+\s*$/i, "")
      .replace(/\s+生肉第[一二三四五六七八九十百\d]+集\s*$/, "")
      .replace(/\s+-\s+(?:\d+(?:[.]5)?[\d_sSpP-]*|Vol\.\d+)\s*$/i, "")
      .replace(
        /\s+(?:[-–]\s*)?Vol[.]?\s*\d+(?:-\d+)?(?:\s+S\d+)?(?:\s+(?:FIN|END))?\s*$/i,
        ""
      )
      .replace(/★(?:OVA|OAD|SP)[_ ]?\d+\s*$/i, "")
      .replace(/[.](?:19|20)\d{2}[.](?:DVD|BD).*$/i, "")
      .replace(/(?:\s*[:：]\s*)?(?:TV动画|TV動畫|日语音轨|日語音軌).*$/, "")
      .replace(/\s+(?:招募|急招|字幕修正|无水印|持续更新|更至最新).*$/, "")

      .replace(/\s*[-–]\s*(?:Movie|电影|電影|SP|OVA|OAD|ONA)\s*[,，]?$/i, "")
      .trim()
  );
}

function cleanEdges(text: string): string {
  return text
    .trim()
    .replace(/^[\s_★/\\]+|[\s★/\\]+$/g, "")
    .replace(/(?<![\p{L}_])_+$/u, "")
    .replace(/^[-–]\s+/, "")
    .replace(/^\|(?!\|)|(?<!\|)\|$/g, "")
    .replace(/^[\[【](?!.*[\]】])/, "")
    .replace(/(?<![\[【].*)[\]】]$/, "")
    .trim()
    .replace(/^「([^「」]+)」$|^『([^『』]+)』$/, (_, a, b) => a ?? b);
}

export function language(text: string): string {
  if (kana.test(text)) return "ja";
  if (/[\p{Script=Han}]/u.test(text)) return "zh";
  return "latin";
}

export function splitAliases(input: string): string[] {
  const akaParts = input.split(/[.]AKA[.]/i);
  if (akaParts.length > 1)
    return akaParts.flatMap((part) =>
      splitAliases(part.replace(/[.](?:19|20)\d{2}$/, ""))
    );
  const pipeParts = input.split(/(?<!\|)[|｜](?!\|)/);
  if (pipeParts.length > 1)
    return pipeParts.flatMap((part) =>
      isAliasSeasonQualifier(part) ||
      /^(?:Season\s*\d+\s+)?Episode\s*\d+$/i.test(part.trim())
        ? []
        : /^\s*[A-Za-z][A-Za-z'!-]*(?:,\s*[A-Za-z][A-Za-z'!-]*){2,}\s*$/.test(
            part
          )
        ? part.split(/,\s*/).flatMap(splitAliases)
        : splitAliases(part)
    );
  let text = cleanEdges(trimTechnicalTail(input)).replace(
    /^(?:搜索|检索|檢索)(?:用)?\s*[:：]\s*/,
    ""
  );
  if (/^《[^《》]+》$/.test(text)) text = text.slice(1, -1);
  text = text.replace(
    /^《([^《》]+)》(\s*(?:第[一二三四五六七八九十百\d]+[季期]|S\d+|Season\s*\d+))$/i,
    "$1$2"
  );
  if (/^「[^「」]+」$|^『[^『』]+』$/.test(text)) text = text.slice(1, -1);
  if (!text || metadata(text)) return [];
  // 「」作为作品内引用保留；整段语言发生变化时才视为名称边界。
  const quoted = text.match(/^([^「」]+)「([^「」]+)」([^「」]+)$/);
  if (
    quoted &&
    language(quoted[1]) !== language(quoted[2]) &&
    quoted[3].trim() &&
    // 尾部英文名可再带中文年份/季度限定，边界取首个文字的语种。
    language(quoted[1]) !== language(quoted[3].match(/\p{L}/u)?.[0] ?? "") &&
    !/^[／/\\|｜]/.test(quoted[3].trim())
  ) {
    return [quoted[1], quoted[2], quoted[3]].flatMap(splitAliases);
  }
  const finalQuotedAlias = text.match(/^([^「」]+)「([^「」]+)」$/);
  if (
    finalQuotedAlias &&
    language(finalQuotedAlias[1]) === "zh" &&
    (language(finalQuotedAlias[2]) === "ja" ||
      (finalQuotedAlias[2].startsWith(finalQuotedAlias[1].trim() + " ") &&
        /^[A-Za-z]/.test(
          finalQuotedAlias[2].slice(finalQuotedAlias[1].trim().length).trim()
        )))
  )
    return finalQuotedAlias.slice(1).flatMap(splitAliases);
  const plusNames = text.split(/\s+[+]\s+/);
  if (
    plusNames.length === 2 &&
    /\p{L}{2}/u.test(plusNames[0]) &&
    plusNames[1].startsWith(plusNames[0] + " ") &&
    /\p{L}/u.test(plusNames[1].slice(plusNames[0].length)) &&
    !plusNames.some(metadata)
  )
    return plusNames.flatMap(splitAliases);
  const ampersandNames = text.split(/\s+&\s+/);
  if (
    ampersandNames.length > 1 &&
    ampersandNames.every((part) => part.trim() && !metadata(part)) &&
    ampersandNames.every((part) => !cjk.test(part) || !/[A-Za-z]/.test(part)) &&
    new Set(ampersandNames.map(language)).size > 1
  )
    return ampersandNames.flatMap(splitAliases);
  const semicolonNames = splitSemicolonAliases(text);
  if (
    semicolonNames.length > 1 &&
    semicolonNames.every((part) => part.trim()) &&
    new Set(semicolonNames.map(language)).size > 1
  )
    return semicolonNames.flatMap(splitAliases);
  // 双斜杠只有跨中日文与拉丁文字时才划分别名，同文字体系内保留原符号。
  text = text.replace(
    /([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}][^\p{L}／/]*)[／/]{2,}(?=[^\p{L}／/]*\p{Script=Latin})|(\p{Script=Latin}[^\p{L}／/]*)[／/]{2,}(?=[^\p{L}／/]*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu,
    (_separator, cjkPrefix, latinPrefix) => (cjkPrefix ?? latinPrefix) + "/"
  );
  const firstSlash = text.search(/[／/\\|｜]/);
  if (
    text.includes("_") &&
    (firstSlash < 0 || text.indexOf("_") < firstSlash)
  ) {
    const underscoreNames = splitWithoutSlash(text);
    if (underscoreNames.length > 1)
      return underscoreNames.flatMap(splitAliases);
  }
  const parts = text.split(
    /\s*(?:(?<!\S[／/])[／/](?![／/]\S)|\\|(?<!\|)\|(?!\|)|｜)\s*/
  );
  const preciseVersion = /^(?:\d+[.]\d{2,}|\d+[.]\d+[+]\d+[.]\d{2,})$/;
  if (
    parts.length >= 3 &&
    /\p{L}/u.test(parts[0]) &&
    preciseVersion.test(parts[0].match(/\s+([\d.+]+)$/)?.[1] ?? "") &&
    parts.slice(1).every((part) => preciseVersion.test(part))
  )
    return parts.map(cleanEdges);
  const spaced = text.split(
    /\s+(?:(?<!\S[／/])[／/](?![／/]\S)|\\|(?<!\|)\|(?!\|)|｜)\s*|(?:(?<!\S[／/])[／/](?![／/]\S)|\\|(?<!\|)\|(?!\|)|｜)\s+/
  );
  if (spaced.length > 1) {
    return spaced.flatMap((part) => {
      const subtitle = part.match(/\s+[-–]\s+(.+)$/)?.[1];
      // 显式别名重复同一副题时，横杠属于完整标题。
      if (
        subtitle &&
        spaced.some(
          (other) =>
            other !== part &&
            other.match(/\s+[-–]\s+(.+)$/)?.[1]?.toLowerCase() ===
              subtitle.toLowerCase()
        )
      )
        return [cleanEdges(part)];
      return splitAliases(part);
    });
  }
  if (parts.length > 1) {
    // 无空格的同语言斜杠可能属于作品本身（含分数）；仅在有明确分隔证据时拆开。
    const separated =
      text.includes("｜") || /\s[／/\\|｜]|[／/\\|｜]\s/.test(text);
    const result: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const next = parts[i + 1];
      if (
        next !== undefined &&
        !separated &&
        ((/^[A-Za-z]{2,}$/.test(parts[i]) &&
          /^[A-Za-z]/.test(next) &&
          (parts[i] === next ||
            !next
              .toLowerCase()
              .split(/\s+/)
              .includes(parts[i].toLowerCase()))) ||
          (language(parts[i]) === language(next) &&
            language(next) === "latin" &&
            !/\s/.test(parts[i].trim()) &&
            !next.split(/\s+/).includes(parts[i])) ||
          (/\d$/.test(parts[i]) && /^\d/.test(next)))
      ) {
        const separators = text.match(/[／/\\|｜]/g) ?? [];
        result.push(parts[i] + separators[i] + next);
        i++;
      } else result.push(parts[i]);
    }
    return result.flatMap((part) => splitWithoutSlash(part));
  }
  return splitWithoutSlash(text);
}

export function isAliasSeasonQualifier(text: string): boolean {
  return /^(?:Season\s*\d+|\d+(?:st|nd|rd|th)\s+Season|S\d+|Partie\s*\d+|第[一二三四五六七八九十百\d]+[季期])$/i.test(
    text.trim()
  );
}

/** 语言说明可标出括注别名列表；句中逗号仍保留在完整名称中。 */
export function isInventoryAnnotation(text: string): boolean {
  return /^\s*\d+\s*(?:款|个|個|部|张|張|种|種)/.test(text);
}

function splitSemicolonAliases(text: string): string[] {
  // 数字和分数符号不改变最近文字的语种；拉丁词内分号保留。
  return text.split(
    /\s+[;；]\s*|[;；]\s+|(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}][^\p{L};；]*)[;；](?=[^\p{L};；]*\p{Script=Latin})|(?<=\p{Script=Latin}[^\p{L};；]*)[;；](?=[^\p{L};；]*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/u
  );
}

/** 紧凑写法只有逐个复现前名中的完整词，才能作为可验证的缩写另名。 */
function isCompactAlias(name: string, compact: string): boolean {
  const pieces = compact.match(/[A-Z][a-z\d]+/g) ?? [];
  if (pieces.length < 2 || pieces.join("") !== compact) return false;
  const words = name.match(/[A-Za-z\d]+/g) ?? [];
  if (pieces[0] !== words[0]) return false;
  let previous = -1;
  return pieces.every((piece) => {
    const index = words.indexOf(piece, previous + 1);
    if (index < 0) return false;
    previous = index;
    return true;
  });
}

export function splitBracketAliasList(text: string): string[] {
  if (isInventoryAnnotation(text)) return [text];
  // 括号中的强调句依附同一逗号复句，尾部语言标签不构成新的名称。
  if (/[,，].*[(（][※＊*]/.test(text))
    return [text.replace(/[,，]\s*Multi[- ]Subs?\s*$/i, "")];
  const semicolonNames = splitSemicolonAliases(text);
  if (semicolonNames.length > 1)
    return semicolonNames.map((part) => part.trim());
  const parts = text.split(/[,，]/).map((part) => part.trim());
  if (parts.length === 2 && isCompactAlias(parts[0], parts[1])) return parts;
  if (parts.length > 1 && parts.some(metadata)) {
    if (parts.every((part) => cjk.test(part) && !/[A-Za-z]/.test(part)))
      return [text];
    const names: string[] = [];
    for (const part of parts) {
      if (!part || metadata(part)) continue;
      const previous = names[names.length - 1];
      const leadingMetadata = metadata(parts[0]);
      const repeatsPrefix =
        previous &&
        previous.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase() ===
          part.trim().split(/\s+/).slice(0, 2).join(" ").toLowerCase();
      // 罗马字中的助词和接续词，以及后续单个谓语，表示同一句作品名称。
      if (
        previous &&
        !repeatsPrefix &&
        !isCompactAlias(previous, part) &&
        (/\b(?:wa|ga|wo|ni|to|nanoni|nara|kedo|node|mou|doumo)$/i.test(
          previous
        ) ||
          (/\bkara$/i.test(previous) &&
            /\b(?:no|wa|ga|wo|ni|de|to|na|desu)\b/i.test(part)) ||
          /^(?:la|le|les|un|une|du|de)\s/.test(part) ||
          /(?:kedo|noni)$/i.test(previous) ||
          (language(previous) === "latin" &&
            language(part) === "latin" &&
            ((/\b(?:iie|hai|ee|uun)$/i.test(previous) &&
              /\b(?:desu|masu)\b/i.test(part)) ||
              ((previous.match(/[~～]/g)?.length ?? 0) % 2 === 1 &&
                /[~～]/.test(part)) ||
              (previous.includes(":") &&
                (previous.match(/\bno\b/gi)?.length ?? 0) >= 2 &&
                !/['’]|\b(?:the|my|your|our|at|with|of|is|are|he|she|his|her)\b/i.test(
                  previous
                )))) ||
          (/\b(?:no|sama|san|chan)\b/i.test(previous) &&
            /\b(?:ni|e)\b/i.test(part) &&
            !/\b(?:Season|S\d+|[IVX]+)\s*$/i.test(previous) &&
            previous.trim().split(/\s+/)[0].toLowerCase() !==
              part.trim().split(/\s+/)[0].toLowerCase()) ||
          (((!leadingMetadata &&
            !/['’]|\b(?:the|my|your|our|at|with|of|is|are|he|she|his|her)\b/i.test(
              previous
            )) ||
            parts.filter((piece) => piece === previous).length > 1) &&
            /\b(?:no|wa|ga|wo|ni|de|to)\b/i.test(part)) ||
          (!previous.includes(",") &&
            !/\s(?:\d+|Season\s*\d+|desu|masu|nai|da)$/i.test(previous) &&
            /\b(?:no|wa|ga|wo|ni|de|to)\b/i.test(previous) &&
            /^[A-Za-z][a-z]+$/.test(part)))
      )
        names[names.length - 1] += ", " + part;
      else names.push(part);
    }
    return names;
  }
  if (
    !/[／/|｜;；]/.test(text) &&
    parts.length > 1 &&
    parts.every((part) => /\p{L}/u.test(part)) &&
    new Set(parts.map(language)).size > 1
  )
    return parts;
  if (
    parts.length === 2 &&
    /^[\p{Script=Han}\d]+$/u.test(parts[0]) &&
    kana.test(parts[1]) &&
    /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\dー・]+$/u.test(
      parts[1]
    )
  )
    return parts;
  return [text];
}

export function isClauseAnnotation(left: string, right: string): boolean {
  return (
    language(left) === "latin" &&
    language(right) === "latin" &&
    ((/\b(?:desu|masu)\s*$/i.test(left.trim()) &&
      /^[A-Z]?[a-z]+$/.test(right.trim())) ||
      /^(?:and|but|or)\s+\p{L}/iu.test(right.trim()))
  );
}

export function hasAdjacentName(blocks: Segment[], index: number): boolean {
  const previous = blocks
    .slice(0, index)
    .reverse()
    .find((piece) => piece.text.trim());
  return Boolean(
    previous &&
      !metadata(previous.text) &&
      !/(?:[／/\\｜│;；]|(?<!\|)\|(?!\|))\s*$/.test(previous.text)
  );
}

export function looksLikeAlternative(left: string, right: string): boolean {
  if (isInventoryAnnotation(right)) return false;
  // 问句后紧接回答式括注属于副题，逗号本身不是别名枚举证据。
  if (/[?？]$/.test(left.trim()) && /[,，].*[!！]/.test(right)) return false;
  if (/^(?:暂定|暫定|Kari|TV\s+Special)$/i.test(right.trim())) return false;
  // 括注的纯季数是当前标题限定，不构成独立译名。
  if (isAliasSeasonQualifier(right)) return false;
  if (isClauseAnnotation(left, right)) return false;
  if (/^[A-Za-z][A-Za-z '-]*\s+arc$/i.test(right.trim())) return false;
  if (
    /^[※＊*]|version$/i.test(right) ||
    (language(right) !== "latin" && /[,，].*[!?！？]/.test(right))
  )
    return false;
  // 韩文括注与其他文字体系之间的完整名称可作为另名，正文下划线不受影响。
  if (/\p{Script=Hangul}/u.test(left) !== /\p{Script=Hangul}/u.test(right))
    return true;
  if (language(left) !== language(right)) return true;
  if (/[;；|｜]/.test(right)) return true;
  if (/[,，]/.test(right) && /[A-Za-z]/.test(right))
    return !right.startsWith(left.trim().split(/\s+/)[0] + ",");
  if (
    language(right) === "latin" &&
    /^[A-Za-z][A-Za-z0-9 '!?.:’`\-]+$/.test(right)
  )
    return true;
  const a = [...new Set([...left].filter((char) => cjk.test(char)))];
  const b = [...new Set([...right].filter((char) => cjk.test(char)))];
  if (/^[\p{Script=Han}]{2}/u.test(right) && left.includes(right.slice(0, 2)))
    return true;
  if (
    /[A-Za-z]{2,}/.test(left) &&
    /[A-Za-z]{2,}/.test(right) &&
    cjk.test(right)
  )
    return true;
  return (
    b.length > 0 &&
    b.filter((char) => a.includes(char)).length >=
      Math.max(1, Math.ceil(b.length / 2))
  );
}

export function hasTechnicalGap(blocks: Segment[], index: number): boolean {
  // 只检查标题之后的技术段；标题之前的来源标签不改变其内部括注。
  for (let previous = index - 1; previous >= 0; previous--) {
    const text = blocks[previous].text;
    if (technical.test(text)) return true;
    if (text.trim() && !metadata(text)) return false;
  }
  return false;
}

function splitWithoutSlash(text: string): string[] {
  text = cleanEdges(trimTechnicalTail(text)).replace(
    /[（(](?:台|臺|港|澳)[)）]$/,
    ""
  );
  // 标题之间插入的配音/字幕说明是边界，不能并入任一作品名称。
  const audioSeparated = text.split(/\s+(?:英|日|粤|粵)配(?:中|英)字\s+/);
  if (audioSeparated.length > 1) return audioSeparated.flatMap(splitAliases);
  const embeddedAlias = text.match(/^(.+?)[(（]([^()（）]+)[)）]([^()（）]+)$/);
  if (
    embeddedAlias &&
    looksLikeAlternative(embeddedAlias[1], embeddedAlias[2]) &&
    language(embeddedAlias[1]) !== language(embeddedAlias[3]) &&
    !(
      /[A-Za-z]\s*$/.test(embeddedAlias[1]) &&
      language(embeddedAlias[2]) === "latin" &&
      language(embeddedAlias[3]) === "latin"
    )
  )
    return embeddedAlias.slice(1).flatMap(splitAliases);
  const parenthesis = text.match(/^(.+?)[(（]([^()（）]+)[)）]$/);
  if (
    parenthesis &&
    !metadata(parenthesis[2]) &&
    looksLikeAlternative(parenthesis[1], parenthesis[2])
  )
    return [parenthesis[1], ...splitBracketAliasList(parenthesis[2])].flatMap(
      splitAliases
    );
  if (!text || metadata(text)) return [];
  // 下划线只有连接不同语种时才是别名分隔符，罗马字词间下划线保留。
  const underscore = text.split(/_+/);
  // 年龄组编号与紧随的赛事类别共同限定前一个名称，不是另一语种译名。
  for (let i = 1; i < underscore.length - 1; i++) {
    if (
      /^U-\d{1,2}$/i.test(underscore[i]) &&
      /^(?:世界杯|世界盃|[亚亞][洲]?杯|[锦錦][标標][赛賽]|大会|大會)$/.test(
        underscore[i + 1]
      )
    ) {
      underscore.splice(i - 1, 3, underscore.slice(i - 1, i + 2).join("_"));
      i--;
    }
  }
  if (/^The_Final_Season$/i.test(underscore.slice(-3).join("_")))
    underscore.splice(-3, 3, underscore.slice(-3).join("_"));
  // 新版限定后只有装饰符时，连同下划线保留在前一个名称中。
  if (
    underscore.length >= 3 &&
    /^NEW$/i.test(underscore[underscore.length - 2]) &&
    /^[^\p{L}\p{N}]+$/u.test(underscore[underscore.length - 1])
  )
    underscore.splice(-2, 2, underscore.slice(-2).join("_"));
  if (underscore.length > 1) {
    const joined: string[] = [];
    for (const piece of underscore) {
      if (!piece) continue;
      const previous = joined[joined.length - 1];
      const lastLetter =
        previous
          ?.replace(/\s+S\d+$/i, "")
          .replace(/ー/g, "")
          .match(/\p{L}(?=[^\p{L}]*$)/u)?.[0] ?? "";
      const firstLetter = piece.replace(/ー/g, "").match(/\p{L}/u)?.[0] ?? "";
      const seasonSuffix =
        /^(?:第?[一二三四五六七八九十\d]+[季期]|Season\s*\d+|S\d+|The_Final_Season$)/i.test(
          piece
        );
      const mixedAlias =
        previous &&
        language(previous) !== language(piece) &&
        (/\s/.test(piece.trim()) || /[A-Za-z]\d+$/.test(previous));
      // 数字后缀不自成译名；拉丁词后紧接的数字可继续带季数与混合正文。
      const numberSuffix =
        /^\d+$/.test(piece) ||
        (previous && /[A-Za-z]$/.test(previous) && /^\d+(?:\s|$)/.test(piece));
      if (
        previous &&
        (seasonSuffix ||
          /^NEW_[^\p{L}\p{N}]+$/iu.test(piece) ||
          numberSuffix ||
          /^[A-Za-z]$/.test(piece) ||
          (!mixedAlias && language(lastLetter) === language(firstLetter)))
      )
        joined[joined.length - 1] += "_" + piece;
      else joined.push(piece);
    }
    if (joined.length > 1) return joined.flatMap(splitWithoutSlash);
  }
  const dotted = text.split(
    /(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])[.]\s*(?=[A-Za-z]|\d+\s+[A-Za-z])|(?<=[\p{Script=Han}][A-Z\d√]{1,3})[.]\s*(?=[A-Za-z])|(?<=[\p{Script=Han}][A-Za-z][A-Za-z\d√]{2,})[.]\s*(?=[A-Za-z])/u
  );
  if (dotted.length > 1) return dotted.flatMap(splitWithoutSlash);
  if (text.includes(".")) {
    const pieces = text.split(".");
    if (
      pieces.some(
        (piece) =>
          /(?:字幕|日语|日語|意大利|西班牙|全[一二三四五六七八九十\d]+季)/.test(
            piece
          ) && metadata(piece)
      )
    ) {
      const chunks: string[] = [];
      let chunk: string[] = [];
      for (const piece of pieces) {
        const season = /^第[一二三四五六七八九十\d]+[季期]$|^S\d+$/i.test(
          piece
        );
        if (metadata(piece) && !season) {
          if (chunk.length) chunks.push(chunk.join("."));
          chunk = [];
        } else chunk.push(piece);
      }
      if (chunk.length) chunks.push(chunk.join("."));
      return chunks.flatMap(splitWithoutSlash);
    }
  }
  const hashed = text.match(/^#([^#]+)#(.*)$/);
  if (hashed) return [hashed[1], hashed[2]].flatMap(splitAliases);
  const animeQuote = text.match(/^アニメ『(.+)』$/);
  if (animeQuote) return [animeQuote[1]];
  const seasonSubtitle = text.match(
    /^(.+?)\s+[-–]\s+(.+?)\s+[-–]\s+((?:First|Second|Third|Fourth|Fifth|Final|Season|\d+(?:st|nd|rd|th))\b.+)$/i
  );
  if (
    seasonSubtitle &&
    language(seasonSubtitle[1]) === "latin" &&
    cjk.test(seasonSubtitle[2])
  )
    return [seasonSubtitle[1], seasonSubtitle[2] + " - " + seasonSubtitle[3]];
  const repeatedColon = text.match(/^(.+?)\s+[:：]\s+(.+?)\s*-?$/);
  if (
    repeatedColon &&
    repeatedColon[1].trim().split(/\s+/).length >= 2 &&
    repeatedColon[1].trim().split(/\s+/).slice(-1)[0] ===
      repeatedColon[2].trim().split(/\s+/)[0]
  )
    return repeatedColon.slice(1).flatMap(splitAliases);
  const filmParts = text.split(/\s+[-–]\s+/);
  if (
    filmParts.length >= 3 &&
    /\bMovie(?:\s+\d+)?$/i.test(filmParts[0]) &&
    filmParts.slice(0, -1).every((part) => language(part) === "latin") &&
    language(filmParts[filmParts.length - 1]) !== "latin"
  )
    return [
      filmParts.slice(0, -1).join(" - "),
      filmParts[filmParts.length - 1],
    ].flatMap(splitAliases);
  const dash = text.match(/^(.+?)\s+[-–]\s+(.+)$/);
  const dashRightLanguage =
    dash && kana.test(dash[2]) && /^\s*[A-Za-z]/.test(dash[2])
      ? "latin"
      : language(dash?.[2] ?? "");
  if (
    dash &&
    !/^(?:特别|特別)[篇编編]$/.test(dash[2].trim()) &&
    !isAliasSeasonQualifier(dash[2]) &&
    ((language(dash[1]) !== dashRightLanguage &&
      !/[A-Za-z]{2,}\s*$/.test(dash[1])) ||
      (!/^[A-Z\d]{1,4}$/.test(dash[1].trim()) &&
        language(dash[1]) === "latin" &&
        dashRightLanguage !== "latin") ||
      (/^\d{3,4}\s+[A-Za-z]/.test(dash[2]) &&
        !/^\d{4}\s+(?:Spring|Summer|Fall|Autumn|Winter)$/i.test(dash[2]))) &&
    !/\s-\s*$/.test(dash[2])
  )
    return [dash[1], dash[2]].flatMap(splitWithoutSlash);
  if (dash && dash[1].trim() === dash[2].trim()) return [dash[1].trim()];
  if (
    dash &&
    /^[A-Z]{2,8}$/.test(dash[1].trim()) &&
    dash[2]
      .match(/[A-Za-z]+/g)
      ?.map((word) => word[0].toUpperCase())
      .join("") === dash[1].trim()
  )
    return dash.slice(1).flatMap(splitWithoutSlash);
  if (
    dash &&
    dash[1].trim().replace(/[!?！？]/g, "") ===
      dash[2].trim().replace(/[!?！？]/g, "")
  )
    return dash.slice(1).map((part) => part.trim());
  return [text];
}

/** 尾部多语检索列表若只是正文中较长名称的短系列词，不作为新的作品名。 */
export function isSeriesSearch(
  names: string[],
  titles: string[],
  explicitSearch = false
): boolean {
  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[ぁ-ゖ]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) + 0x60)
      )
      .replace(/[\s_★☆!！]/g, "");
  const existing = titles.map(normalize);
  const candidates = names.map(normalize);
  if (candidates.some((name) => existing.includes(name))) return false;
  // 只在明确检索块且已有多个正文名称时识别混合短简称，不对正文名称使用此规则。
  if (
    (explicitSearch || titles.length >= 3) &&
    titles.length >= 2 &&
    names.every((name) => !/\s/.test(name) && name.length <= 8) &&
    names.some((name) => /^[A-Za-z][\p{Script=Han}]{1,2}$/u.test(name))
  )
    return true;
  if (names.length < 2) return false;
  if (names.some((name) => name.trim().split(/\s+/).length >= 4)) return false;
  return candidates.some(
    (name) =>
      name.length >= 2 &&
      name.length <= 8 &&
      existing.some(
        (title) => title.includes(name) && name.length < title.length * 0.6
      )
  );
}
