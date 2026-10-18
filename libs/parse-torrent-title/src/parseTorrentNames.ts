import matchEpisode from "@/matchEpisode";
import matchSpecialEpisode from "@/matchSpecialEpisode";
import { parseTorrentOrganization } from "@/parseTorrentOrganization";
import { Organization, Title } from "@/types";

interface Segment {
  text: string;
  start: number;
  end: number;
  wrapper?: string;
  closer?: string;
}

export interface TorrentNames {
  title: Title;
  organization?: Organization;
}

export interface TorrentNamesOptions {
  /** 已由剧集解析器确定的原文位置；只用于划分标题，不参与编号判断。 */
  episode?: { index: number; length: number };
}

const pairs: Record<string, string> = {
  "[": "]",
  "【": "】",
  "(": ")",
  "（": "）",
  "{": "}",
};
const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const technical =
  /(?:\b(?:WEB[ ._-]?(?:DL|RIP)?|BD[ ._-]?RIP|UHD[ ._-]?BDRIP|DVD[ ._-]?RIP|HDTV|REMUX|HEVC|AVC|AV1|x26[45]|H[ .]?26[45]|AAC|FLAC|OPUS|AC3|EAC3|DTS(?:-HD)?|MP4|MKV|SRT|ASS|PGS|HDR10|DOLBY|DV|CR|Baha(?:mut)?|ABEMA|B-Global|Bilibili|ViuTV|TVB|NF)\b|\d{3,4}\s*[xX×]\s*\d{3,4}|\b(?:240|288|480|576|720|1080|1440|2160|4320)[piP]|\b[248]K\b|\b(?:8|10|12)[ -]?bit\b)/i;
const groupWord =
  /(?:Raws?|Sub)$|字幕[组組社]|[汉漢]化[组組]|[发發][布佈组組]|[搬压壓]运?[组組部]|工作室|\b(?:raws?|subs?|fansub(?:ber)?s?|studio|team|group)\b|合成|压制|壓制|搬运|搬運/i;

function segments(input: string): Segment[] {
  const result: Segment[] = [];
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const close = pairs[input[i]];
    if (!close) continue;
    // 紧贴正文的方括号是标题内引用，不能拆成多个作品名称。
    if (
      (input[i] === "[" || input[i] === "【") &&
      i > 0 &&
      cjk.test(input[i - 1]) &&
      (cjk.test(input[input.indexOf(close, i + 1) + 1] || "") ||
        /(?:篇|章|编|編)$/.test(
          input.slice(i + 1, input.indexOf(close, i + 1))
        ) ||
        /^\s*[A-Za-z]\s*=/.test(
          input.slice(i + 1, input.indexOf(close, i + 1))
        ))
    )
      continue;
    let depth = 1;
    let end = i + 1;
    for (; end < input.length && depth; end++) {
      if (input[end] === input[i]) depth++;
      else if (
        input[end] === close ||
        (/[)）]/.test(close) && /[)）]/.test(input[end])) ||
        (input[i] === "{" &&
          input[end] === ")" &&
          input.indexOf("}", i + 1) < 0)
      )
        depth--;
    }
    if (depth) continue;
    if (i > start) result.push({ text: input.slice(start, i), start, end: i });
    result.push({
      text: input.slice(i + 1, end - 1),
      start: i,
      end,
      wrapper: input[i],
      closer: input[end - 1],
    });
    start = end;
    i = end - 1;
  }
  if (start < input.length)
    result.push({ text: input.slice(start), start, end: input.length });
  return result;
}

/** 仅列举非标题语汇，不包含作品名称、译名或发布者名单。 */
function metadata(text: string): boolean {
  const value = text.trim();
  // 完整发行标签或由来源代号引导的技术块不参与名称识别。
  if (
    /^(?:BATCH Complete Season|PARTIAL BATCH|HDR|BD FHD|Multi Dual Audio|CH|Hardsubs?)$/i.test(
      value
    ) ||
    /^SEASON(?:19|20)\d{2}\s+年度TV合集$/i.test(value) ||
    /^(?:\d{1,4}\s+)?FHD$/i.test(value)
  )
    return true;
  if (
    /^(?:Sub[_ -]Esp(?:[-_ ]XviD)?|Mini[-_ ]Batch|Complete(?: Batch)?|OAVs?|Betamax|VHS|Original Broadcast|BD[-_ ]?(?:ISO|RMSTR)|VERSION[_ ]LIGHT|preliminary version|Esp-La|Korean Premiere|Clip|Post[- ]\d+ Extra)$/i.test(
      value
    ) ||
    /^[A-Z][A-Z0-9_-]*[.]WEB[-_ ](?:DL|RIP)\s+(?:\d{3,4}[pi]\b|\d{3,4}[x×]\d{3,4}\b|AVC\b|HEVC\b|x26[45]\b)/i.test(
      value
    ) ||
    /^(?:The )?Complete Anime Series(?: English Subtitles)?$/i.test(value) ||
    /^JP Dub and Sub$/i.test(value) ||
    /^Seasons?\s+\d+\s*[-~]\s*\d+(?:\s*[+]\s*[^+]+)+$/i.test(value) ||
    /^\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[-~]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])$/.test(
      value
    )
  )
    return true;
  // 只有整块均为语言与音轨／字幕标签时才过滤，正文中的 Audio、Sub 等词仍保留。
  const trackWords = value.split(/[\s,/_+&.\-]+/).filter(Boolean);
  const trackLanguage =
    /^(?:CN|EN|ENG|JP|JPN|JAP|CHS|CHT|ENCC|JPCC|FR|FRA|FRE|ES|SPA|PT|POR|IT|ITA|DE|DEU|GER|RU|RUS|KR|KOR|TC|SC|YUE|CAN|Japanese|English|Chinese|German|French|Spanish|Portuguese|Italian|Russian|Korean)$/i;
  const trackRole = /^(?:Audio|Subs?|Subtitles?|Dubs?|Dubbed)$/i;
  if (
    trackWords.some((word) => trackLanguage.test(word)) &&
    trackWords.some((word) => trackRole.test(word)) &&
    trackWords.every((word) => trackLanguage.test(word) || trackRole.test(word))
  )
    return true;
  if (
    /^(?:(?:总|總)第\d+(?:[~～–-]\d+)?|Censored(?: Version)?|CUSTOM|더빙|Audio[_ ]Fixed|HDR\s*(?:8|10|12)bits|KA|Prerelease|Remastered|Hulu|MW|VideoNow|retimed|Dublado|Unofficial Batch|Tri[ -]?Audio|Hi(?:8|10|12)p|HQ|Encore broadcast|TRUEFRENCH|Ajout OAV|Final Season|eng[.]?\s*sub[.]?|U-NEXT|Digital Remaster(?:ed)?|Blu-ray|DVD\d+|IDN|YouTube|TMS|Indosiar|UBC|JEI TV|Déclic Images|Film|Triple Audio|Fixed Audio|Corrected Names|DCP(?:\s+\d{3,4}p)?)$/i.test(
      value
    )
  )
    return true;
  if (
    /^\d{2,4}p\s+PVD\s+RAW\s+PCM$/i.test(value) ||
    /^\d+[／/](?:NC)?(?:OP|ED|OPED)(?:[_-]\d+)?$/i.test(value) ||
    /^MULTi[-_]FRENCH(?:[／/]VOSTFR)?$/i.test(value) ||
    /^\d+\s+à\s+\d+$/i.test(value)
  )
    return true;
  if (/(?<!\|)[|｜](?!\|)/.test(value)) return false;
  // 周更、整季收录、语言音轨以及平台说明只在完整标签中识别。
  if (
    /^(?:Dub Indo|Weekly|Batch|DUAL|JA|CA|PT-BR|Sub_Esp|OV|OmU|OmeU|DF|Synchro|LD|Filtered|Limited Edition|자막|超大抢先|HBR|Xvid-MP3|English-Sub|BD-\d{3,4}p|Dual[ -]Audio|Multi[ -](?:Audio|Subs?)|VOSTFR|SUBFRENCH|VF|MULTi|READNFO|JAP|HKG|KOR|TWN|THA|BILI|WETV|YTB|TWTR|CTHP|IQ|VIKI|TVING|AniTV|Amazon|Bandai Channel|Kids Station|Funimation|Discotek Media|Victor Entertainment|Rose Video|Mighty Media|规制解除版|規制解除版)$/i.test(
      value
    ) ||
    /^(?:TV-\d+|\d+\s+of\s+\d+|R[124]\w{2}|a\d{4,}|LD RF Capture, Decoded|Seasons?\s+\d+\s*[-~&+]\s*\d+|(?:\d{3,4}[pi]\s+)?(?:DVD|BD|VCD)\s+(?:ISO|MPEG-?[12]\s+MP2)|Part\s*\d+\s*[+]\s*Part\s*\d+)$/i.test(
      value
    ) ||
    /^(?:4Kids\s+)?(?:ENG|JPN|JAP|KOR|HKG|TWN|THA)(?:\s*[,/+&]\s*(?:ENG|JPN|JAP|KOR|HKG|TWN|THA))*$/i.test(
      value
    )
  )
    return true;
  // 收录组合中的每一项都必须是媒介、季号或编号，不把标题中的加号当成收录列表。
  const releasePart =
    "(?:S\\d+|(?:\\d+)?(?:TV|MOVIE|OVA|OAD|ONA|SP|EX|LIVE|剧场版|劇場版|特典(?:映像)?)(?:s|[x×]?\\d+)?)";
  if (
    new RegExp(
      `^(?:${releasePart}|\\d+)(?:\\s*[+＆&]\\s*(?:${releasePart}|\\d+))+(?:\\s*(?:合集|全集|FIN|END))?$`,
      "i"
    ).test(value) ||
    /^(?:全|共)[一二三四五六七八九十百千零〇两兩\d]+(?:集|话|話|部|卷)$/.test(
      value
    ) ||
    /^(?:BT|种子|種子|磁力|网盘|網盤)下[载載]$/i.test(value) ||
    /^(?:HDR(?:10[+]?)?|SDR|DV)(?:版|版本)$/i.test(value) ||
    /^(?:精校|校[对對]|修[订訂]|补[发發])(?:版|本)?$/.test(value) ||
    /^(?:恭[贺賀]|庆祝|慶祝|迎接)(?:新年|元旦|圣诞|聖誕|春节|春節)[!！]?$/.test(
      value
    ) ||
    /^(?:TV|WEB|BD|DVD)[._-][UV]\d+$/i.test(value) ||
    /^(?:TVB|ViuTV)(?:[儿兒]童|[动動]画|[动動]漫)(?:台|[频頻]道)$/.test(
      value
    ) ||
    /^(?:原始|原版|官方|原[声聲])(?:配音|音轨|音軌)$/.test(value) ||
    /^(?:按|依)(?:年份|年代|季度)(?:整理|分类|分類)?合集$/.test(value) ||
    /^(?:Pre[-_ ]?Air(?:ing)?|Animatica|ParkTV|ZeroTV|EX|OST|Original Soundtrack|原[声聲]音[乐樂]|オリジナルサウンドトラック)$/i.test(
      value
    ) ||
    /^(?:官方)?[简簡繁中英日俄国國囯粤粵台韩韓法德意西葡]*(?:字幕|中字|双语|雙語)?[ _-]*(?:内封|內封|内嵌|內嵌|外挂|外掛|内挂|內掛)[ _-]*(?:PGS|ASS|SRT|VobSub)(?:x\d+)?$/i.test(
      value
    )
  )
    return true;
  // 配音、字幕和收录状态必须占满标签，不能因正文提到同形词而删去作品名。
  if (
    /^(?:内封|內封|内嵌|內嵌|外挂|外掛|内挂|內掛)?[简簡繁中英日俄国國囯粤粵台韩韓法德意西葡]+(?:语|語|文|体|體)?(?:字幕|(?:双|雙|多)(?:语|語|音轨|音軌)|音轨|音軌|配音|配版|配)$/.test(
      value
    ) ||
    /^(?:阿拉伯[语語]|Arabic(?:[ -]?(?:Dub(?:bed)?|Audio|Ver(?:sion)?))?)$/i.test(
      value
    ) ||
    /^(?:TVB|ViuTV|代理商)(?:再版|重[发發]|外判)?[粤粵][语語]$/.test(value) ||
    /^(?:AT-X|STTV|HDTC|WEBEIP|TVRIP(?:先行)?|RAW|REV|重[发發]|代[发發]|含短篇|含短片|超[后後][宫宮]版)$/i.test(
      value
    ) ||
    /^(?:[248]K[ _-]+)?AI[ _-]+(?:Upscal(?:e|ed|ing)|Enhanc(?:e|ed|ement)|Remaster(?:ed)?)(?:[ _-]+[248]K)?$/i.test(
      value
    ) ||
    /^(?:TV|MOVIE|OVA|OAD|ONA|SP)(?:s|[x×]\d+)?(?:\s+(?:Fin|Rev|Reseed))?$/i.test(
      value
    ) ||
    /^(?:第)?[一二三四五六七八九十\d]+季(?:全|全集|合集)$/.test(value) ||
    /^(?:(?:19|20)\d{2}[._ ])?S\d+(?:[-~～–+]S?\d+)+(?:[._ ]*(?:FIN|END|全集|合集))?$/i.test(
      value
    ) ||
    /^(?:[\p{L}\p{N}._-]{1,20})?[个個]人作品$/u.test(value) ||
    /^(?:本|下|这|這)周(?:番外|更新|特[别別][篇编編])(?:[，,。:：!！].*)?$/.test(
      value
    ) ||
    /^(?:公映|上映|放送)[前后後]特典(?:\s*第[一二三四五六七八九十\d]+[弹彈])?$/.test(
      value
    ) ||
    /^(?:[^\[\]（）()]{1,40}的)?座[谈談][会會]$/.test(value)
  )
    return true;
  // 出版方、处理工序和载体规格只在完整独立块中识别。
  if (
    /^[\p{L}\p{N}·＆& -]{2,32}(?:发行|發行|出品|出版)$/u.test(value) ||
    /^(?:.*(?:云盘|雲盤))?(?:补帧|補幀)$/.test(value) ||
    /^(?:R-ESRGAN\s+)?(?:温柔|溫柔|暴力)?\d{3,4}P$/i.test(value) ||
    /^(?:\d+周年)?(?:[248]K)?(?:数字|數字)?(?:重制|重製)版$/i.test(value) ||
    /^(?:AI)?画[质質]修[复復]版$/i.test(value) ||
    /^(?:JPBD\s+Vol[.]?\d+(?:-\d+)?\s+Re-encode|Disney[+]|TVHD|Main(?:8|10|12)|THD|PCM|MP2|MPG2[-+](?:MP2|PCM|AC3)|DVD[59]|VCD(?:RAR)?|\d+DISC)$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:(?:Mandarin\s+)?Chinese|Mandarin|Thai|Vietnamese|Indonesian|JPN)(?:\s+(?:Dub(?:bed)?|Audio|Ver(?:sion)?))?$/i.test(
      value
    ) ||
    /^(?:[日英中台泰越国國粤粵韩韓]+配版|普通[话話](?:版|配音)?)$/.test(
      value
    ) ||
    /^(?:官方)?[简簡繁日中英粤粵]+(?:[内內][封嵌]|外挂|外掛)?字幕$/.test(
      value
    ) ||
    /^(?:内挂|內掛|内封|內封|外挂|外掛)(?:英文|中文|日文)?(?:VobSub|PGS|ASS|SRT)?字幕$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:[上下]卷|BD[-_ ]?RIP\s+[上下]卷|冒头映像|冒頭映像|Trial Version|特典动画|特典動畫|全支线[+]特典|全支線[+]特典|第[一二三四五六七八九十百\d]+[集话話]|\d{1,2}月|第\d+クール|Part[.]\d+)$/i.test(
      value
    ) ||
    /^Vol[.]?\d+(?:[-_~～]\d+)?(?:\s+(?:Fin|END))?(?:\s*[, ]\s*(?:DEU|ENG|JPN|CHS|CHT))*$/i.test(
      value
    )
  )
    return true;
  if (/^(?:新年|元旦|圣诞|聖誕|春节|春節)快[乐樂][!！]?$/.test(value))
    return true;
  // 双语发行说明只有两侧都能独立识别为元信息时，才整体排除。
  const bilingual = value.match(/^([^()（）]+)\s*[(（]([^()（）]+)[)）]$/);
  if (bilingual && metadata(bilingual[1]) && metadata(bilingual[2]))
    return true;
  // 独立发行标签采用整段匹配，避免吞掉名称中的同形词或年份。
  if (
    /^(?:CAM[-_ ]?RIP|BDREMUX|HIDIVE|Sentai|CATCHPLAY|アニメ|宣传动画|宣傳動畫|广播剧|廣播劇|直播|LIVE|汉语普通话|漢語普通話|Human Audio|Modded Blu-rays|加流重灌|未删减|未刪減|自嗨版|院线版|院線版|完全版|收藏版)$/i.test(
      value
    ) ||
    /^[a-f\d]{8}$/i.test(value) ||
    /^(?:HEVC|AVC|H[.]?26[45])[-_ ]?(?:8|10|12)bits?$/i.test(value) ||
    /^(?:Vol[.]?\s*\d+(?:[_~～–-]\d+)?|\d+收藏版)$/i.test(value) ||
    /^(?:img|b|i|u|s|size|color|font|url|quote|code|list)(?:=[^\[\]]+)?$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:(?:CHS|CHT|EN|ENG|ES|PT|IT|CT|FR|FRA|DE|GER|PL|JP|JPN|YUE|CAN|CN|HK|TW|TC|SC)[+&/_ -]*)+$/i.test(
      value
    ) ||
    /^(?:\d+x(?:AAC|FLAC|SRT|ASS|PGS)\s*)+$/i.test(value) ||
    /^(?:TVB|ViuTV|代理商)(?:[+]发行商|[+]發行商|外判)?[粤粵]语$/.test(value) ||
    /^IPFS.*(?:服务器|伺服器|做种|做種)/i.test(value) ||
    /^(?:全|全部)?(?:歌曲|歌词|歌詞|字幕)特效$/.test(value) ||
    /^[简簡繁中英日间間]+双[语語]$/.test(value)
  )
    return true;
  if (
    /^(?:S\d+\s*[-~～–+]\s*S?\d+|(?:第)?[一二三四五六七八九十\d]+\s*[-~～–+]\s*[一二三四五六七八九十\d]+季)(?:全集|合集)?$/i.test(
      value
    ) ||
    /^(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE|感谢祭|感謝祭)(?:\s*[+.]+\s*(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE|感谢祭|感謝祭))+(?:\s+Fin)?$/i.test(
      value
    ) ||
    /^(?:Part\s*\d+完.*|第[一二三四五六七八九十\d]+季度完|合集\s*[(（]含[^)）]+[)）]|[+](?:特别篇|特別篇)|[+](?:小说|小說|漫画|漫畫|音乐|音樂|CD|其他)(?:[+；;].*)?|part\d+)$/i.test(
      value
    ) ||
    /^.*[一二三四五六七八九十\d]+周年(?:礼包|禮包|纪念(?:礼包)?|紀念(?:禮包)?)(?:\s*其[一二三四五六七八九十\d]+)?[!！]?$/.test(
      value
    ) ||
    /^(?:聊|谈|談)(?:聊|谈|談|一下|一聊|一谈|一談)?(?:本|下|次)季(?:安排|计划|計劃)?$/.test(
      value
    )
  )
    return true;
  // 平台、制片格式和观看版本是发行信息，不按发布组或作品名称判断。
  if (
    /^(?:Crunchyroll|Bili-HMT|ADN|BDBOX|(?:\d+)?DVD[-_ ]?ISO|SDR|Premium|Recode|Repack\d*|ALL|TIME[.]\d+|(?:[A-Z0-9]+[-_])?(?:TVRIP|HDTVRIP))$/i.test(
      value
    ) ||
    /^(?:H[ .]?26[45]|x26[45]|HEVC|AVC)(?:编码|編碼)$/i.test(value)
  )
    return true;
  if (
    /^(?:Japanese|English|German|Deutsch|French|Spanish|Italian|Russian|Portuguese|Chinese|Korean)(?:[ -](?:Audio|Dubs?|Dubbed|Subs?|Ver(?:sion)?)[.]?)?$/i.test(
      value
    ) ||
    /^[A-Z]{2,3}SUB$/i.test(value) ||
    /^(?:On[ -]?air(?: version)?|放送版|播出版|纯净版|純淨版|典藏版|整合版|新字幕|内附发布说明|內附發佈說明|小剧场|小劇場|特别动画|特別動畫)$/i.test(
      value
    ) ||
    /^[\p{Script=Han}]{0,8}(?:解放|开放|開放)版$/u.test(value)
  )
    return true;
  if (
    /^(?:第)?[一二三四五六七八九十\d]+(?:\s*[+~–-]\s*[一二三四五六七八九十\d]+)+(?:季|季度|期)(?:合集|全集)$/.test(
      value
    ) ||
    /^(?:TV|MOVIE|OVA|OAD|ONA|SP)\s+(?:Rev|Fin|Reseed)(?:\s*[+]\s*(?:TV|MOVIE|OVA|OAD|ONA|SP)\s+(?:Rev|Fin|Reseed))*$/i.test(
      value
    ) ||
    /^(?:本|下|这|這)周(?:完结|完結|停播)[!！]?$|^.+[一二三四五六七八九十\d]+周年[!！]?$|^双版本.*画质$|^雙版本.*畫質$/.test(
      value
    )
  )
    return true;
  if (
    /^(?:简|簡|繁|中|英|日|意|德|法|俄|韩|韓|粤|粵|西|葡|丹麦|丹麥|芬兰|芬蘭|挪威|瑞典)+(?:语|語|文)?(?:字幕|中字|双字|雙字|双语|雙語)$/.test(
      value
    ) ||
    /^(?:AI|[A-Za-z][A-Za-z0-9-]*)中文$/.test(value)
  )
    return true;
  if (
    /^(?:JAP|JPN|ENG|LAT|FRE|FRA|GER|DEU|ITA|RUS|SPA|POR|CHS|CHT|CHN)(?:[-+](?:JAP|JPN|ENG|LAT|FRE|FRA|GER|DEU|ITA|RUS|SPA|POR|CHS|CHT|CHN|Subs?|Audio))+$/i.test(
      value
    ) ||
    /^(?:シーズン\s*\d+\s*)?エピソード\s*\d+(?:\s*[-–].*)?$/.test(value)
  )
    return true;
  const pieces = value.split(/[ _,/+&＆]+/).filter(Boolean);
  if (pieces.length > 1 && pieces.every((piece) => metadata(piece)))
    return true;
  if (!value) return true;
  if (
    /^(?:NETFLIX|AMZN|NHK|CUT|Onair|总集|總集|单剧集[+]电影合集|單劇集[+]電影合集|数码重映|數碼重映|无障碍字幕|無障礙字幕|蓝光压制|藍光壓制|校对合集|校對合集|合集(?:正式)?版本|多国语言|多國語言|\d{4}Ver|M\d+|Part\s*\d+-\d+|(?:Video|Live|Ja|SPA|GER|ITA|UK|FRA)[.]?Ver)$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:TV|WEB|BD|DVD|BDRip)\d{3,4}P$|^[A-Z]{2,3}DUB$|^(?:CHS|CHT)[_-](?:EN|ENG)$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:英|日|国|國|中|粤|粵|韩|韓|德|法|俄|西|葡|波兰|波蘭|罗马尼亚|羅馬尼亞|意大利)+(?:语|語|文)?(?:版|配音版|双语|雙語|字幕|无字|無字)?$/.test(
      value
    )
  )
    return true;
  if (
    /^(?:内封官方|內封官方|外挂|外掛|含|带|帶|对应国配|對應國配).*(?:字幕|配音|音轨|音軌)$/.test(
      value
    )
  )
    return true;
  if (
    /^(?:简繁内封jianfannf|完全wonderful版|U-NEXTDL[+]NetflixSub|アニメBD)$/i.test(
      value
    )
  )
    return true;
  if (/周年.*(?:名场景|名場景|特番)|警告[!！]$/.test(value)) return true;
  if (
    /^(?:AMZN|NETFLIX|NHK|BILI|WETV|YTB|TWTR|CTHP|IQ|VIKI|MW)\b/i.test(value) &&
    technical.test(value)
  )
    return true;
  if (/^Multi-(?:Audio|Subs?)(?:,\s*Multi-(?:Audio|Subs?))*$/i.test(value))
    return true;
  if (
    /^(?:TV|MOVIE|OVA|ONA)(?:[._+](?:TV|MOVIE|OVA|ONA|part\d+))+$/i.test(value)
  )
    return true;
  if (
    /^\d{3,4}P[(（]附.+[)）]$/i.test(value) ||
    /^(?:英语|英語)配音版$/.test(value)
  )
    return true;
  if (
    /^(?:国产动画|國產動畫|特效字幕|TVer|WIKIRIP|ARR|正片|上半部分|下半部分|无圣光版|無聖光版|另带日配音轨|另帶日配音軌|ONA(?:_part\d+)?|m\d{3,4}p|\d+(?:\.\d+)?\s*[GM]i?B|\d+yrs ago\s*-?|(?:Japanese|English|JP)\s+(?:Dub|Audio)|[A-Za-z ]+[粤粵]语|Ani-One Asia ULTRA|无修版 Uncensored ver[.]?)$/i.test(
      value
    )
  )
    return true;
  if (/^CASE\s*\d+\b|^IPFS.*做种测试|^V\d+(?:\.\d+)+$/i.test(value))
    return true;
  if (
    /字幕[社组組].*(?:招人|招募)|停播|^第?[一二三四五六七八九十\d]+[季期](?:全[集话話]|完)$|第\d+部分完/.test(
      value
    )
  )
    return true;
  if (
    /^(?:电影|電影|\d{3,4}p|DVD Remastered|华纳动画|閒話|闲话)(?:\s*[-–]\s*[前后後]编)?$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:[A-Za-z]{2,3}[-+](?:Jap|Eng|Subs|Angle)|(?:Ita|Jap|Eng|Rus|Spa|Fra)(?:[-+].*)?|(?:意大利|西班牙|俄|英|日|法)(?:语|語|文)(?:字幕)?|全[一二三四五六七八九十\d]+季)$/i.test(
      value
    )
  )
    return true;
  if (/^(?:全|共)\d+[话話集][+].*$/.test(value)) return true;
  if (/^第[一二三四五六七八九十\d]+[季期]$/.test(value)) return true;
  if (
    /^(?:v\d+(?:FIX\d+)?|个人制作合集|個人製作合集|元旦献礼\d*|元旦獻禮\d*|重压|重壓|动画短片|動畫短片|正式版本|Special Version|Uncensored|Rev Fin|BD REENCODE|BDMV|BD|DVD|HDTVRIP|WBEDL|Multi-Subs?|10bits|CHS_JAP|JP Dub|Audio=.+|HBO-Max(?:@[^\s]+)?|Ani-One (?:Asia|Ultra)|HOY粤语|nyaa|上集|下集|系列|请看bt站简介)$/i.test(
      value
    )
  )
    return true;
  if (/^(?:19|20)\d{2}年$|^\d+周年$|^.+\d+周年$/.test(value)) return true;
  if (
    /^(?:动画电影|動畫電影|网盘资源|網盤資源|年龄限制版|年齡限制版|repack|Multiple Subtitles?|Ani-One Asia|HDrip|先行)$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:\d{1,2}月(?:新)?番|\d{4}年\d{1,2}月番?|国漫|國漫|日漫|动画|動畫|合集|全集|完结|完結|完|END|FIN|Reseed(?: Fin)?|KoVer|retake|TVrip|TS|Movie|剧场版|劇場版|OVA|OAD|SP|TV|特典(?:映像)?|特别篇|特別篇|先行版|先行版本|无修版|重制版|重製版)(?:[ +/_-](?:OVA|OAD|SP|TV|Fin))*$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:第|全|共)?\s*\d+(?:\.\d+)?(?:\s*[-~–]\s*\d+(?:\.\d+)?)?(?:话|話|集|TV全集|TV|完|END|FIN|合集)?(?:\s*v\d+)?(?:\s*[+]\s*(?:OVA|OAD|SP|特典|\d+))*$/i.test(
      value
    )
  )
    return true;
  if (/^\d{4}[.\/-]\d{1,2}(?:[.\/-]\d{1,2})?$/.test(value)) return true;
  if (
    /^(?:附|生日|数码画质|數碼畫質|HD Remastered|日版|美版|JPN\.Ver|It's Anime)/i.test(
      value
    )
  )
    return true;
  if (/^\d{4}年(?:OVA|首播版)$/.test(value)) return true;
  if (/^(?:S\d+(?:E\d+)?|EP?\s*\d+|BOX\s*\d+)(?:[ +_-].*)?$/i.test(value))
    return true;
  if (
    /(?:^|\s)(?:招募|招人|急招|招聘)|修正|修复版|修復版|重校|重传|重傳|仅限|僅限|水印|高清下载|迅雷下载|持续更新|持續更新|整理时间|整理時間|tmdbid\s*=|bangumi\.|https?:\/\//i.test(
      value
    )
  )
    return true;
  if (
    /^(?:个人整理|個人整理|整理搬运|整理搬運|自购自翻自压|自購自翻自壓)$/.test(
      value
    )
  )
    return true;
  if (
    /^(?:[简簡繁中日英粤粵单双雙多国语語体體无無内內嵌挂掛封外]+(?:字幕|中字)?)(?:MP4|MKV|ASSx?\d*|SRTx?\d*)?$/i.test(
      value
    )
  )
    return true;
  if (
    /^(?:(?:[简簡繁中日英粤粵双雙多国國语語体體文无無内內嵌挂掛封外烧燒录錄硬软軟制製单双雙]+|字幕|配音|音轨|音軌|中文|日配版|英语|英語|GB|BIG5|CHS|CHT|JP|JPN|ENG|YUE|CAN|CN|HK|TW|TC|SC|No Subs?|Multi[ -]?Sub|Chinese Audio|Japanese Audio|English Sub(?:titles)?|Dubbed|Softsub|Hardsub|Sub(?:titles)?|\s|[+＆&,/_-])+)(?:x\d+)?$/i.test(
      value
    )
  )
    return true;
  if (/^(?:TVB|ViuTV|代理商)[粤粵]语$/.test(value)) return true;
  // 带点号的词名不能因为第一个单词恰好也是编码名而被整段删除。
  if (
    /^[A-Za-z]+[.][A-Za-z]+/.test(value) &&
    !/^(?:BD|DVD|WEB)[.]/i.test(value)
  )
    return false;
  // 单独的分辨率词不足以证明整段都是技术信息，例如名称中的“4K Adventure”。
  const withoutUhd = value.replace(/\b[248]K\b/gi, "").trim();
  if (
    withoutUhd !== value &&
    withoutUhd &&
    !technical.test(withoutUhd) &&
    !metadata(withoutUhd)
  )
    return false;
  if (
    technical.test(
      value.replace(/_/g, " ").replace(/(ASS|SRT|AAC|FLAC|PGS)x\d+/gi, "$1")
    ) &&
    (value.split(/\s+/).length <= 2 ||
      /\d{3,4}\s*[pix×]|[248]K|HEVC|AVC|AAC|FLAC|OPUS|x26[45]|WEB|BDRIP|DVDRIP|MP4|MKV|Remux|Full Collection/i.test(
        value
      )) &&
    !cjk.test(
      value.replace(/简繁|内封|外挂|中字|日语|粤语|繁体|简体|字幕/g, "")
    )
  )
    return true;
  return false;
}

function trimTechnicalTail(text: string): string {
  const pipeParts = text.split(/(?<!\|)[|｜](?!\|)/);
  if (pipeParts.length > 1) return pipeParts.map(trimTechnicalTail).join(" | ");
  // 点号连接的年份只有紧接明确的发行技术字段时才是发行年。
  text = text.replace(/[.]Movie[.](?:19|20)\d{2}(?=[.]MULTi\b)/i, "");
  text = text.replace(
    /[.](?:19|20)\d{2}(?=[.](?:MULTi\b|Hybrid[.](?:[A-Z]{2}-)?DVDRip\b))/i,
    ""
  );
  // 官方制作 label 只有紧邻外层引用包装时才视作前缀，正文同形词仍保留。
  text = text.replace(/^\s*Animatica(?=[「『])/i, "");
  // 技术参数可没有外括号；只在独立词边界处截断，避免伤及标题内部数字。
  const boundary =
    /(?:\s+|[._★])(?=(?:\d{3,4}\s*[xX×]\s*\d{3,4}|(?:480|576|720|1080|2160)[pP]|[248]K(?=$|[ ._-]+(?:HEVC|AVC|x26[45]|HDR|SDR|BD|WEB|BluRay)\b)|(?:8|10|12)[ -]?bit\b|(?:WEB(?=[- ](?:\d{3,4}p\b|x26[45]\b|HEVC\b|AVC\b))|WEB[ ._-]?(?:DL|RIP)|Blu[ ._-]?Ray|Hybrid(?=[. _-]+[A-Z]{2}[-_]DVDRIP)|BD|BDRIP|UHDBDRIP|(?:[A-Z]{2}[-_])?DVDRIP|HEVC|AVC|x26[45])(?=$|[\W_])))/i;
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
      .replace(/\s+Subs?[+]Fonts\s+for\s+.+$/i, "")
      .replace(/\s+Latest PV$/i, "")
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
      .replace(/[_ ](?:OVA|OAD)\s*$/i, "")
      .replace(/\s+TV\s+剪[辑輯]版\s*$/i, "")
      .replace(/\s+超[后後][宫宮]版\s*$/, "")
      .replace(/\s+(?:[日英中台泰越国國粤粵韩韓]+配版|普通[话話]版)\s*$/, "")
      .replace(/全集(?:无水印|無水印)(?:高清)?(?:迅雷)?下[载載]\s*$/, "")
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
      .replace(/\s*[:：]?\s+HD Remastered(?: Edition)?\s*$/i, "")
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
      .replace(/(\s+S\d+)\s+PART\s+[IVX]+$/i, "$1")
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
      .replace(/\s+-\s+(?:\d+[\d_sSpP-]*|Vol\.\d+)\s*$/i, "")
      .replace(
        /\s+(?:[-–]\s*)?Vol[.]?\s*\d+(?:-\d+)?(?:\s+S\d+)?(?:\s+(?:FIN|END))?\s*$/i,
        ""
      )
      .replace(/★(?:OVA|OAD|SP)[_ ]?\d+\s*$/i, "")
      .replace(/[.](?:19|20)\d{2}[.](?:DVD|BD).*$/i, "")
      .replace(/(?:\s*[:：]\s*)?(?:TV动画|TV動畫|日语音轨|日語音軌).*$/, "")
      .replace(/\s+(?:招募|急招|字幕修正|无水印|持续更新|更至最新).*$/, "")

      .replace(/\s*[-–]\s*(?:Movie|电影|電影|SP|OVA|OAD)\s*[,，]?$/i, "")
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

function language(text: string): string {
  if (kana.test(text)) return "ja";
  if (/[\p{Script=Han}]/u.test(text)) return "zh";
  return "latin";
}

function splitAliases(input: string): string[] {
  const pipeParts = input.split(/(?<!\|)[|｜](?!\|)/);
  if (pipeParts.length > 1)
    return pipeParts.flatMap((part) =>
      isAliasSeasonQualifier(part) ||
      /^(?:Season\s*\d+\s+)?Episode\s*\d+$/i.test(part.trim())
        ? []
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
  const firstSlash = text.search(/[／/\\|｜]/);
  if (
    text.includes("_") &&
    (firstSlash < 0 || text.indexOf("_") < firstSlash)
  ) {
    const underscoreNames = splitWithoutSlash(text);
    if (underscoreNames.length > 1)
      return underscoreNames.flatMap(splitAliases);
  }
  const spaced = text.split(
    /\s+(?:[／/\\]|(?<!\|)\|(?!\|)|｜)\s*|(?:[／/\\]|(?<!\|)\|(?!\|)|｜)\s+/
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
  const parts = text.split(/\s*(?:[／/\\]|(?<!\|)\|(?!\|)|｜)\s*/);
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

function isAliasSeasonQualifier(text: string): boolean {
  return /^(?:Season\s*\d+|\d+(?:st|nd|rd|th)\s+Season|S\d+|Partie\s*\d+|第[一二三四五六七八九十百\d]+[季期])$/i.test(
    text.trim()
  );
}

/** 语言说明可标出括注别名列表；句中逗号仍保留在完整名称中。 */
function isInventoryAnnotation(text: string): boolean {
  return /^\s*\d+\s*(?:款|个|個|部|张|張|种|種)/.test(text);
}

function splitSemicolonAliases(text: string): string[] {
  // 数字和分数符号不改变最近文字的语种；拉丁词内分号保留。
  return text.split(
    /\s+[;；]\s*|[;；]\s+|(?<=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}][^\p{L};；]*)[;；](?=[^\p{L};；]*\p{Script=Latin})|(?<=\p{Script=Latin}[^\p{L};；]*)[;；](?=[^\p{L};；]*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/u
  );
}

function splitBracketAliasList(text: string): string[] {
  if (isInventoryAnnotation(text)) return [text];
  const semicolonNames = splitSemicolonAliases(text);
  if (semicolonNames.length > 1)
    return semicolonNames.map((part) => part.trim());
  const parts = text.split(/[,，]/).map((part) => part.trim());
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
        (/\b(?:wa|ga|wo|ni|to|nanoni|nara|kedo|node|mou|doumo)$/i.test(
          previous
        ) ||
          (/\bkara$/i.test(previous) &&
            /\b(?:no|wa|ga|wo|ni|de|to|na|desu)\b/i.test(part)) ||
          /^(?:la|le|les|un|une|du|de)\s/.test(part) ||
          /(?:kedo|noni)$/i.test(previous) ||
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

function looksLikeAlternative(left: string, right: string): boolean {
  if (isInventoryAnnotation(right)) return false;
  // 问句后紧接回答式括注属于副题，逗号本身不是别名枚举证据。
  if (/[?？]$/.test(left.trim()) && /[,，].*[!！]/.test(right)) return false;
  if (/^(?:暂定|暫定|Kari|TV\s+Special)$/i.test(right.trim())) return false;
  // 括注的纯季数是当前标题限定，不构成独立译名。
  if (isAliasSeasonQualifier(right)) return false;
  if (/^[A-Za-z][A-Za-z '-]*\s+arc$/i.test(right.trim())) return false;
  if (
    /^[※＊*]|version$/i.test(right) ||
    (language(right) !== "latin" && /[,，].*[!?！？]/.test(right))
  )
    return false;
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

function hasTechnicalGap(blocks: Segment[], index: number): boolean {
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
    dash[1].trim().replace(/[!?！？]/g, "") ===
      dash[2].trim().replace(/[!?！？]/g, "")
  )
    return dash.slice(1).map((part) => part.trim());
  return [text];
}

/** 尾部多语检索列表若只是正文中较长名称的短系列词，不作为新的作品名。 */
function isSeriesSearch(
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

/** 独立提取原文中的作品名称；不推断剧集编号，也不修改字幕判断。 */
export function parseTorrentNames(
  input: string,
  options: TorrentNamesOptions = {}
): TorrentNames {
  const originalInput = input;
  const detectedOrganization = parseTorrentOrganization(originalInput);
  // 两侧留白的竖线才是名称边界，标题自身的符号组合保留。
  input = input.replace(/(?<=\s)│(?=\s)/g, "|");
  const videoFilename = /[.](?:mkv|mp4|ts)$/i.test(input.trimEnd());
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
      /^\d{3,4}(?:-\d{3,4})?$/.test(blocks[first + 1]?.text ?? "") &&
      !blocks[first + 2]?.wrapper &&
      /\p{L}.+\s+\d{1,3}(?:\s+Extended)?\s*$/iu.test(
        blocks[first + 2]?.text ?? ""
      );
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
      /^\d{3,4}(?:-\d{3,4})?$/.test(block.text) &&
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
    : options.episode?.index ?? (marker ? marker.start + origin : input.length);
  const detectedEnd = namedSpecialEpisode
    ? specialEnd
    : coverageLocalStart !== undefined && coverageLocalNumber
    ? coverageLocalStart + coverageLocalNumber[1].length
    : followingEpisode && coverageFollowing
    ? followingEpisode.end + coverageFollowing.start
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
  const localEpisode = [subEpisode, captionEpisode]
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
    if (versionYearRanges.includes(block) && aliases.length) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
      continue;
    }
    if (block.wrapper && /^Seasons?\s+\d+\s*[-&+~]\s*\d+$/i.test(text))
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
        (input[episodeStart] === "-" &&
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
      /^Fixed$/i.test(text.trim()) &&
      aliases.length &&
      (afterEpisode || hasTechnicalGap(blocks, blocks.indexOf(block)))
    )
      continue;
    if (
      block.wrapper &&
      /^(?:导演|導演)剪[辑輯]版[(（](?:上|下)[)）]$/.test(text.trim()) &&
      aliases.length &&
      !hasTechnicalGap(blocks, blocks.indexOf(block))
    ) {
      const gap = input.slice(0, block.start).match(/\s*$/)?.[0] ?? "";
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
      continue;
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
      aliases[aliases.length - 1] += gap + block.wrapper + text + block.closer;
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
        (followingBlock?.wrapper &&
          metadata(followingBlock.text) &&
          technical.test(followingBlock.text)))
    ) {
      const episodeCaption = trimTechnicalTail(text).match(
        /^(.+?)\s+\d{2,3}\s+[-–]\s+(.+)$/
      );
      if (
        episodeCaption &&
        !/\b(?:Movie|Film|Season|Part|Vol[.]?)\s*$/i.test(episodeCaption[1])
      )
        text = episodeCaption[1];
    }
    text = trimTechnicalTail(text);
    if (
      !block.wrapper &&
      episodeStart === input.length &&
      followingBlock?.wrapper &&
      metadata(followingBlock.text) &&
      !/^(?:19|20)\d{2}(?:[-–](?:19|20)\d{2})?$/.test(followingBlock.text)
    )
      text = text.replace(/\s+(?:The\s+)?Complete Series$/i, "");
    if (!block.wrapper && /^\s*\d+(?:\s*[,，]\s*\d+)*\s*$/.test(text)) continue;
    if (!block.wrapper) {
      const year = text.match(/\s+((?:19|20)\d{2})$/)?.[1];
      if (
        year &&
        /^S\d+E\d+/i.test(input.slice(episodeStart).trimStart()) &&
        !input.includes(year + "年版") &&
        !/\d(?:[/-]\d+|\s+\d+)?\s+(?:19|20)\d{2}$/.test(text)
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
      !/\bSeason\s+\d+$/i.test(text) &&
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
      /^(?:[-–]\s*)?(?:S\d+|Season\s*\d+|Partie\s*\d+|第[一二三四五六七八九十\d]+[季期]|\d+(?:st|nd|rd|th)\s+Season)$/i.test(
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
    if (
      (block.wrapper === "(" || block.wrapper === "（") &&
      aliases.length > 0 &&
      !afterEpisode &&
      !/[／/|｜]/.test(text) &&
      (!/[;；]/.test(text) || isInventoryAnnotation(text)) &&
      !hasTechnicalGap(blocks, blocks.indexOf(block)) &&
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
        following.start < episodeStart &&
        !metadata(following.text) &&
        !/^\s*[／/\\-]/.test(following.text)
      ) {
        const suffix = input
          .slice(following.start, Math.min(following.end, episodeStart))
          .replace(
            following.end > episodeStart && episodeStart < input.length
              ? /\s+[-–]\s*$/
              : /(?!)/,
            ""
          );
        const combined = aliases.pop()! + suffix.trimEnd();
        aliases.push(...splitAliases(combined));
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
    originalBlocks.find(
      (block, index) =>
        block.wrapper &&
        (block.text.trim() === detectedOrganization.raw.trim() ||
          block.text
            .trim()
            .split(/\s*(?:[&＆+×／/]| x )\s*/)
            .every((name) => groups.includes(name))) &&
        hasTechnicalGap(originalBlocks, index)
    );
  const restoreMediaQualifier =
    repeatedMediaQualifier &&
    aliases
      .filter(
        (name) =>
          !groups.includes(name) &&
          name !== trailingOrganizationBlock?.text.trim()
      )
      .every((name) => {
        const base = name.replace(/\s*[(（](?:19|20)\d{2}[)）]$/, "");
        return originalInput.includes(base + " " + repeatedMediaQualifier);
      });
  if (assetCollection) aliases.length = 0;
  const unique = [
    ...new Set(
      aliases
        .map((name) => {
          if (name === trailingOrganizationBlock?.text.trim()) return "";
          if (restoreMediaQualifier) {
            const version = name.match(/^(.*?)(\s*[(（](?:19|20)\d{2}[)）])$/);
            const base = version ? version[1] : name;
            if (originalInput.includes(base + " " + repeatedMediaQualifier))
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
                Boolean(trailingOrganizationBlock))
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
