// 标题元信息的完整字段识别；各规则表保留执行顺序，不跨越否定判断或递归分支合并。
export const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
export const technical =
  /(?:\b(?:WEB[ ._-]?(?:DL|RIP)?|BD[ ._-]?RIP|UHD[ ._-]?(?:BD)?RIP|DVD[ ._-]?RIP|HDTV|REMUX|HEVC|AVC|AV1|x26[45]|H[ .]?26[45]|AAC|FLAC|OPUS|AC3|EAC3|DTS(?:-HD)?|MP4|MKV|SRT|ASS|PGS|HDR10|DOLBY|DV|CR|Baha(?:mut)?|ABEMA|B-Global|Bilibili|ViuTV|TVB|NF)\b|\d{3,4}\s*[xX×]\s*\d{3,4}|\b(?:240|288|480|576|720|1080|1440|2160|4320)[piP]|\b[248]K\b|\b(?:8|10|12)[ -]?bit\b)/i;

const initialMetadataPatterns: readonly RegExp[] = [
  /^#\d+(?:[.]\d+)?$|^EngSubs$|^R[1-6]$|^Dub$/i,
  /^(?:TV\s+)?Season\s+[IVX]+\s*[&+]\s*OVA\s+subs\s*-/i,
  /^.+?\s+Muxed with\s+.+?\s+raw$|^[^\s]+\s+Patch$/i,
  // 字幕附件、补丁说明和预告规格只在完整标签内识别。
  /^(?:(?:only|soft|hard)[ -]?)?(?:subs?|subtitles?)(?:[ -]?only)?$|^(?:subtitle file only|ASS-only|script|patch|unofficial|Honorifics|Subtitled|SubOnly|RippedSubs|Subripped|LQ|Hi10|XviD|WEBSTEAM|full)$/i,
  /^(?:PV\d*(?:v\d+)?|Promo|Trailer|Teaser|CM|(?:Textless\s+)?(?:NC)?(?:OP|ED)\d*|\d+\s+Sec[.]?|C\d+\s+Version)$/i,
  /^(?:AS|FB)-DL$|^CRC\s+[A-F\d]{8}$/i,
  /^(?:EN|ENG|ESE|ES|BZ|DE|IT|RU|FR|AR|POR|BR|LA)(?:[-|](?:EN|ENG|ESE|ES|BZ|DE|IT|RU|FR|AR|POR|BR|LA))+$/i,
  /^(?:\d{2,4}-\d{2,4}|Season\s+\d+(?:\s+(?:to|[-~])\s*\d+)?|Seasons\s+\d+\s*[-~]\s*\d+|Complete Series|Series)(?:\s*[+&]\s*(?:\d+|Movies?|OVAs?|Specials?|Extras|OST|CDs?|Movies?\s+\d{4}(?:[/]\d{4})*))+$/i,
  /^Part\s+\d+\s*-\s*End$|^Movie\s+\d+\s+Special\s*-\s*Complete$/i,
  /^(?:Unofficial\s+|OCR'ed\s+)?(?:BD\s+)?(?:English|Eng)[ -]+(?:Subtitles?|Subs?)(?:\s+Scripts)?$|^Netflix Subs$/i,
  /^(?:re-?timed\s+(?:for|to)|Subtitle[- ]|Fixed\s+.*Subtitle|corrected and styled)\b/i,
  /^(?:English|Eng)\s+Subtitle\s+Pack$|^subs[+]karaoke$|^English Translation$|^[АA][ТT]-X$/i,
  // 完整发行标签或由来源代号引导的技术块不参与名称识别。
  /^(?:BATCH Complete Season|PARTIAL BATCH|HDR|BD FHD|BD-BOX|ThaiBD|Matching Soft Subs|ES[/-]LAT|Multi Dual Audio|CH|Hardsubs?)$/i,
  /^SEASON(?:19|20)\d{2}\s+年度TV合集$/i,
  /^(?:\d{1,4}\s+)?(?:FHD|HD)$/i,
  /^\d+\s+Discs?$/i,
  /^(?:台|臺|中|国|國|粤|粵|港|日|英|韩|韓)配(?:版)?$/,
  /^(?:multi|dual)[-_ ]?subs?$/i,
  /^rev\d+$/i,
  /^Volume\s+\d+(?:\s*[-~–]\s*\d+)?$/i,
  /^(?:VHS|DivX\d*|MP3)(?:[ ._-]+(?:VHS|DivX\d*|MP3))*$/i,
  /^(?:Dub[+]Sub|Sub[+]Dub)$/i,
  /^(?:19|20)\d{2},\s*TV,\s*\d+\s+из\s+\d+$/i,
  /^\d{1,4}(?:\s*[-,]\s*\d{1,4}){2,}$/,
  /^(?:Sub[_ -]Esp(?:[-_ ]XviD)?|Mini[-_ ]Batch|Complete(?: Batch)?|OAVs?|Betamax|VHS|Original Broadcast|BD[-_ ]?(?:ISO|RMSTR)|VERSION[_ ]LIGHT|preliminary version|Esp-La|Korean Premiere|Clip|Post[- ]\d+ Extra)$/i,
  /^[A-Z][A-Z0-9_-]*[.]WEB[-_ ](?:DL|RIP)\s+(?:\d{3,4}[pi]\b|\d{3,4}[x×]\d{3,4}\b|AVC\b|HEVC\b|x26[45]\b)/i,
  /^(?:The )?Complete Anime Series(?: English Subtitles)?$/i,
  /^JP Dub and Sub$/i,
  /^Seasons?\s+\d+\s*[-~]\s*\d+(?:\s*[+]\s*[^+]+)+$/i,
  /^\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[-~]\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])$/,
];

const trackMetadataPatterns: readonly RegExp[] = [
  /^(?:(?:总|總)第\d+(?:[~～–-]\d+)?|Censored(?: Version)?|CUSTOM|더빙|Audio[_ ]Fixed|HDR\s*(?:8|10|12)bits|KA|Prerelease|Remastered|Hulu|MW|VideoNow|retimed|Dublado|Unofficial Batch|Tri[ -]?Audio|Hi(?:8|10|12)p|HQ|Encore broadcast|TRUEFRENCH|Ajout OAV|Final Season|eng[.]?\s*sub[.]?|U-NEXT|Digital Remaster(?:ed)?|Blu-ray|DVD\d+|IDN|YouTube|TMS|Indosiar|UBC|JEI TV|Déclic Images|Film|Triple Audio|Fixed Audio|Corrected Names|DCP(?:\s+\d{3,4}p)?)$/i,
  /^\d{2,4}p\s+PVD\s+RAW\s+PCM$/i,
  /^\d+[／/](?:NC)?(?:OP|ED|OPED)(?:[_-]\d+)?$/i,
  /^MULTi[-_]FRENCH(?:[／/]VOSTFR)?$/i,
  /^\d+\s+à\s+\d+$/i,
];

const releaseMetadataPatterns: readonly RegExp[] = [
  // 周更、整季收录、语言音轨以及平台说明只在完整标签中识别。
  /^(?:Dub Indo|Weekly|Batch|DUAL|JA|CA|PT-BR|Sub_Esp|OV|OmU|OmeU|DF|Synchro|LD|Filtered|Limited Edition|자막|超大抢先|HBR|Xvid-MP3|English-Sub|BD-\d{3,4}p|Dual[ -]Audio|Multi[ -](?:Audio|Subs?)|VOSTFR|SUBFRENCH|VF|MULTi|READNFO|JAP|HKG|KOR|TWN|THA|BILI|WETV|YTB|TWTR|CTHP|IQ|VIKI|TVING|AniTV|Amazon|Bandai Channel|Kids Station|Funimation|Discotek Media|Victor Entertainment|Rose Video|Mighty Media|规制解除版|規制解除版)$/i,
  /^(?:TV-\d+|\d+\s+of\s+\d+|R[124]\w{2}|a\d{4,}|LD RF Capture, Decoded|Seasons?\s+\d+\s*[-~&+]\s*\d+|(?:\d{3,4}[pi]\s+)?(?:DVD|BD|VCD)\s+(?:ISO|MPEG-?[12]\s+MP2)|Part\s*\d+\s*[+]\s*Part\s*\d+)$/i,
  /^(?:4Kids\s+)?(?:ENG|JPN|JAP|KOR|HKG|TWN|THA)(?:\s*[,/+&]\s*(?:ENG|JPN|JAP|KOR|HKG|TWN|THA))*$/i,
];

const deliveryMetadataPatterns: readonly RegExp[] = [
  // 配音、字幕和收录状态必须占满标签，不能因正文提到同形词而删去作品名。
  /^(?:内封|內封|内嵌|內嵌|外挂|外掛|内挂|內掛)?[简簡繁中英日俄国國囯粤粵台韩韓法德意西葡]+(?:语|語|文|体|體)?(?:字幕|(?:双|雙|多)(?:语|語|音轨|音軌)|音轨|音軌|配音|配版|配)$/,
  /^(?:阿拉伯[语語]|Arabic(?:[ -]?(?:Dub(?:bed)?|Audio|Ver(?:sion)?))?)$/i,
  /^(?:TVB|ViuTV|代理商)(?:再版|重[发發]|外判)?[粤粵][语語]$/,
  /^(?:AT-X|STTV|HDTC|WEBEIP|TVRIP(?:先行)?|RAW|REV|重[发發]|代[发發]|含短篇|含短片|超[后後][宫宮]版)$/i,
  /^(?:[248]K[ _-]+)?AI[ _-]+(?:Upscal(?:e|ed|ing)|Enhanc(?:e|ed|ement)|Remaster(?:ed)?)(?:[ _-]+[248]K)?$/i,
  /^(?:TV|MOVIE|OVA|OAD|ONA|SP)(?:s|[x×]\d+)?(?:\s+(?:Fin|Rev|Reseed))?$/i,
  /^(?:第)?[一二三四五六七八九十\d]+季(?:全|全集|合集)$/,
  /^(?:(?:19|20)\d{2}[._ ])?S\d+(?:[-~～–+]S?\d+)+(?:[._ ]*(?:FIN|END|全集|合集))?$/i,
  /^(?:[\p{L}\p{N}._-]{1,20})?[个個]人作品$/u,
  /^(?:本|下|这|這)周(?:番外|更新|特[别別][篇编編])(?:[，,。:：!！].*)?$/,
  /^(?:公映|上映|放送)[前后後]特典(?:\s*第[一二三四五六七八九十\d]+[弹彈])?$/,
  /^(?:[^\[\]（）()]{1,40}的)?座[谈談][会會]$/,
  // 出版方、处理工序和载体规格只在完整独立块中识别。
  /^[\p{L}\p{N}·＆& -]{2,32}(?:发行|發行|出品|出版)$/u,
  /^(?:.*(?:云盘|雲盤))?(?:补帧|補幀)$/,
  /^(?:R-ESRGAN\s+)?(?:温柔|溫柔|暴力)?\d{3,4}P$/i,
  /^(?:\d+周年)?(?:[248]K)?(?:数字|數字)?(?:重制|重製)版$/i,
  /^(?:AI)?画[质質]修[复復]版$/i,
  /^(?:JPBD\s+Vol[.]?\d+(?:-\d+)?\s+Re-encode|Disney[+]|TVHD|Main(?:8|10|12)|THD|PCM|MP2|MPG2[-+](?:MP2|PCM|AC3)|DVD[59]|VCD(?:RAR)?|\d+DISC)$/i,
  /^(?:(?:Mandarin\s+)?Chinese|Mandarin|Thai|Vietnamese|Indonesian|JPN)(?:\s+(?:Dub(?:bed)?|Audio|Ver(?:sion)?))?$/i,
  /^(?:[日英中台泰越国國粤粵韩韓]+配版|普通[话話](?:版|配音)?)$/,
  /^(?:官方)?[简簡繁日中英粤粵]+(?:[内內][封嵌]|外挂|外掛)?字幕$/,
  /^(?:内挂|內掛|内封|內封|外挂|外掛)(?:英文|中文|日文)?(?:VobSub|PGS|ASS|SRT)?字幕$/i,
  /^(?:[上下]卷|BD[-_ ]?RIP\s+[上下]卷|冒头映像|冒頭映像|Trial Version|特典动画|特典動畫|全支线[+]特典|全支線[+]特典|第[一二三四五六七八九十百\d]+[集话話]|\d{1,2}月|第\d+クール|Part[.]\d+)$/i,
  /^Vol[.]?\d+(?:[-_~～]\d+)?(?:\s+(?:Fin|END))?(?:\s*[, ]\s*(?:DEU|ENG|JPN|CHS|CHT))*$/i,
  /^(?:新年|元旦|圣诞|聖誕|春节|春節)快[乐樂][!！]?$/,
];

const attributeMetadataPatterns: readonly RegExp[] = [
  // 独立发行标签采用整段匹配，避免吞掉名称中的同形词或年份。
  /^(?:CAM[-_ ]?RIP|BDREMUX|HIDIVE|Sentai|CATCHPLAY|アニメ|宣传动画|宣傳動畫|广播剧|廣播劇|直播|LIVE|汉语普通话|漢語普通話|Human Audio|Modded Blu-rays|加流重灌|未删减|未刪減|自嗨版|院线版|院線版|完全版|收藏版)$/i,
  /^[a-f\d]{8}$/i,
  /^(?:HEVC|AVC|H[.]?26[45])[-_ ]?(?:8|10|12)bits?$/i,
  /^(?:Vol[.]?\s*\d+(?:[_~～–-]\d+)?|\d+收藏版)$/i,
  /^(?:img|b|i|u|s|size|color|font|url|quote|code|list)(?:=[^\[\]]+)?$/i,
  /^(?:(?:CHS|CHT|EN|ENG|ES|PT|IT|CT|FR|FRA|DE|GER|PL|JP|JPN|YUE|CAN|CN|HK|TW|TC|SC)[+&/_ -]*)+$/i,
  /^(?:\d+x(?:AAC|FLAC|SRT|ASS|PGS)\s*)+$/i,
  /^(?:TVB|ViuTV|代理商)(?:[+]发行商|[+]發行商|外判)?[粤粵]语$/,
  /^IPFS.*(?:服务器|伺服器|做种|做種)/i,
  /^(?:全|全部)?(?:歌曲|歌词|歌詞|字幕)特效$/,
  /^[简簡繁中英日间間]+双[语語]$/,
  /^(?:S\d+\s*[-~～–+]\s*S?\d+|(?:第)?[一二三四五六七八九十\d]+\s*[-~～–+]\s*[一二三四五六七八九十\d]+季)(?:全集|合集)?$/i,
  /^(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE|感谢祭|感謝祭)(?:\s*[+.]+\s*(?:TV|MOVIE|OVA|OAD|ONA|SP|LIVE|感谢祭|感謝祭))+(?:\s+Fin)?$/i,
  /^(?:Part\s*\d+完.*|第[一二三四五六七八九十\d]+季度完|合集\s*[(（]含[^)）]+[)）]|[+](?:特别篇|特別篇)|[+](?:小说|小說|漫画|漫畫|音乐|音樂|CD|其他)(?:[+；;].*)?|part\d+)$/i,
  /^.*[一二三四五六七八九十\d]+周年(?:礼包|禮包|纪念(?:礼包)?|紀念(?:禮包)?)(?:\s*其[一二三四五六七八九十\d]+)?[!！]?$/,
  /^(?:聊|谈|談)(?:聊|谈|談|一下|一聊|一谈|一談)?(?:本|下|次)季(?:安排|计划|計劃)?$/,
  // 平台、制片格式和观看版本是发行信息，不按发布组或作品名称判断。
  /^(?:Crunchyroll|Bili-HMT|ADN|BDBOX|(?:\d+)?DVD[-_ ]?ISO|SDR|Premium|Recode|Repack\d*|ALL|TIME[.]\d+|(?:[A-Z0-9]+[-_])?(?:TVRIP|HDTVRIP))$/i,
  /^(?:H[ .]?26[45]|x26[45]|HEVC|AVC)(?:编码|編碼)$/i,
  /^(?:Japanese|English|German|Deutsch|French|Spanish|Italian|Russian|Portuguese|Chinese|Korean)(?:[ -](?:Audio|Dubs?|Dubbed|Subs?|Ver(?:sion)?)[.]?)?$/i,
  /^[A-Z]{2,3}SUB$/i,
  /^(?:On[ -]?air(?: version)?|放送版|播出版|纯净版|純淨版|典藏版|整合版|新字幕|内附发布说明|內附發佈說明|小剧场|小劇場|特别动画|特別動畫)$/i,
  /^[\p{Script=Han}]{0,8}(?:解放|开放|開放)版$/u,
  /^(?:第)?[一二三四五六七八九十\d]+(?:\s*[+~–-]\s*[一二三四五六七八九十\d]+)+(?:季|季度|期)(?:合集|全集)$/,
  /^(?:TV|MOVIE|OVA|OAD|ONA|SP)\s+(?:Rev|Fin|Reseed)(?:\s*[+]\s*(?:TV|MOVIE|OVA|OAD|ONA|SP)\s+(?:Rev|Fin|Reseed))*$/i,
  /^(?:本|下|这|這)周(?:完结|完結|停播)[!！]?$|^.+[一二三四五六七八九十\d]+周年[!！]?$|^双版本.*画质$|^雙版本.*畫質$/,
  /^(?:简|簡|繁|中|英|日|意|德|法|俄|韩|韓|粤|粵|西|葡|丹麦|丹麥|芬兰|芬蘭|挪威|瑞典)+(?:语|語|文)?(?:字幕|中字|双字|雙字|双语|雙語)$/,
  /^(?:AI|[A-Za-z][A-Za-z0-9-]*)中文$/,
  /^(?:JAP|JPN|ENG|LAT|FRE|FRA|GER|DEU|ITA|RUS|SPA|POR|CHS|CHT|CHN)(?:[-+](?:JAP|JPN|ENG|LAT|FRE|FRA|GER|DEU|ITA|RUS|SPA|POR|CHS|CHT|CHN|Subs?|Audio))+$/i,
  /^(?:シーズン\s*\d+\s*)?エピソード\s*\d+(?:\s*[-–].*)?$/,
];

const trailingMetadataPatterns: readonly RegExp[] = [
  /^(?:NETFLIX|AMZN|NHK|CUT|Onair|总集|總集|单剧集[+]电影合集|單劇集[+]電影合集|数码重映|數碼重映|无障碍字幕|無障礙字幕|蓝光压制|藍光壓制|校对合集|校對合集|合集(?:正式)?版本|多国语言|多國語言|\d{4}Ver|M\d+|Part\s*\d+-\d+|(?:Video|Live|Ja|SPA|GER|ITA|UK|FRA)[.]?Ver)$/i,
  /^(?:TV|WEB|BD|DVD|BDRip)\d{3,4}P$|^[A-Z]{2,3}DUB$|^(?:CHS|CHT)[_-](?:EN|ENG)$/i,
  /^(?:英|日|国|國|中|粤|粵|韩|韓|德|法|俄|西|葡|波兰|波蘭|罗马尼亚|羅馬尼亞|意大利)+(?:语|語|文)?(?:版|配音版|双语|雙語|字幕|无字|無字)?$/,
  /^(?:内封官方|內封官方|外挂|外掛|含|带|帶|对应国配|對應國配).*(?:字幕|配音|音轨|音軌)$/,
  /^(?:简繁内封jianfannf|完全wonderful版|U-NEXTDL[+]NetflixSub|アニメBD)$/i,
  /周年.*(?:名场景|名場景|特番)|警告[!！]$/,
];

const mediaMetadataPatterns: readonly RegExp[] = [
  /^Multi-(?:Audio|Subs?)(?:,\s*Multi-(?:Audio|Subs?))*$/i,
  /^(?:TV|MOVIE|OVA|ONA)(?:[._+](?:TV|MOVIE|OVA|ONA|part\d+))+$/i,
  /^\d{3,4}P[(（]附.+[)）]$/i,
  /^(?:英语|英語)配音版$/,
  /^(?:国产动画|國產動畫|特效字幕|TVer|WIKIRIP|ARR|正片|上半部分|下半部分|无圣光版|無聖光版|另带日配音轨|另帶日配音軌|ONA(?:_part\d+)?|m\d{3,4}p|\d+(?:\.\d+)?\s*[GM]i?B|\d+yrs ago\s*-?|(?:Japanese|English|JP)\s+(?:Dub|Audio)|[A-Za-z ]+[粤粵]语|Ani-One Asia ULTRA|无修版 Uncensored ver[.]?)$/i,
  /^CASE\s*\d+\b|^IPFS.*做种测试|^V\d+(?:\.\d+)+$/i,
  /字幕[社组組].*(?:招人|招募)|停播|^第?[一二三四五六七八九十\d]+[季期](?:全[集话話]|完)$|第\d+部分完/,
  /^(?:电影|電影|\d{3,4}p|DVD Remastered|华纳动画|閒話|闲话)(?:\s*[-–]\s*[前后後]编)?$/i,
  /^(?:[A-Za-z]{2,3}[-+](?:Jap|Eng|Subs|Angle)|(?:Ita|Jap|Eng|Rus|Spa|Fra)(?:[-+].*)?|(?:意大利|西班牙|俄|英|日|法)(?:语|語|文)(?:字幕)?|全[一二三四五六七八九十\d]+季)$/i,
  /^(?:全|共)\d+[话話集][+].*$/,
  /^第[一二三四五六七八九十\d]+[季期]$/,
  /^(?:v\d+(?:FIX\d+)?|个人制作合集|個人製作合集|元旦献礼\d*|元旦獻禮\d*|重压|重壓|动画短片|動畫短片|正式版本|Special Version|Uncensored|Rev Fin|BD REENCODE|BDMV|BD|DVD|HDTVRIP|WBEDL|Multi-Subs?|10bits|CHS_JAP|JP Dub|Audio=.+|HBO-Max(?:@[^\s]+)?|Ani-One (?:Asia|Ultra)|HOY粤语|nyaa|上集|下集|系列|请看bt站简介)$/i,
  /^(?:19|20)\d{2}年$|^\d+周年$|^.+\d+周年$/,
  /^(?:动画电影|動畫電影|网盘资源|網盤資源|年龄限制版|年齡限制版|repack|Multiple Subtitles?|Ani-One Asia|HDrip|先行)$/i,
  /^(?:\d{1,2}月(?:新)?番|\d{4}年\d{1,2}月番?|国漫|國漫|日漫|动画|動畫|合集|全集|完结|完結|完|END|FIN|Reseed(?: Fin)?|KoVer|retake|TVrip|TS|Movie|剧场版|劇場版|OVA|OAD|SP|TV|特典(?:映像)?|特别篇|特別篇|特别话|特別話|先行版|先行版本|无修版|重制版|重製版)(?:[ +/_-](?:OVA|OAD|SP|TV|Fin))*$/i,
  /^(?:第|全|共)?\s*\d+(?:\.\d+)?(?:\s*[-~–]\s*\d+(?:\.\d+)?)?(?:话|話|集|TV全集|TV|完|END|FIN|合集)?(?:\s*v\d+)?(?:\s*[+]\s*(?:OVA|OAD|SP|特典|\d+))*$/i,
  /^\d{4}[.\/-]\d{1,2}(?:[.\/-]\d{1,2})?$/,
  /^(?:附|生日|数码画质|數碼畫質|HD Remastered|日版|美版|JPN\.Ver|It's Anime)/i,
  /^\d{4}年(?:OVA|首播版)$/,
  /^(?:S\d+(?:E\d+)?|EP?\s*\d+|BOX\s*\d+)(?:[ +_-].*)?$/i,
  /(?:^|\s)(?:招募|招人|急招|招聘)|修正|修复版|修復版|重校|重传|重傳|仅限|僅限|水印|高清下载|迅雷下载|持续更新|持續更新|整理时间|整理時間|tmdbid\s*=|bangumi\.|https?:\/\//i,
  /^(?:个人整理|個人整理|整理搬运|整理搬運|自购自翻自压|自購自翻自壓)$/,
  /^(?:[简簡繁中日英粤粵单双雙多国语語体體无無内內嵌挂掛封外]+(?:字幕|中字)?)(?:MP4|MKV|ASSx?\d*|SRTx?\d*)?$/i,
  /^(?:(?:[简簡繁中日英粤粵双雙多国國语語体體文无無内內嵌挂掛封外烧燒录錄硬软軟制製单双雙]|字幕|配音|音轨|音軌|日配版|GB|BIG5|CHS|CHT|JP|JPN|ENG|YUE|CAN|CN|HK|TW|TC|SC|No Subs?|Multi[ -]?Sub|Chinese Audio|Japanese Audio|English Sub(?:titles)?|Dubbed|Softsub|Hardsub|Sub(?:titles)?|\s|[+＆&,/_-])+)(?:x\d+)?$/i,
  /^(?:TVB|ViuTV|代理商)[粤粵]语$/,
];

/** 只识别发行元信息，不包含作品名或发布者名单。 */
export function metadata(text: string): boolean {
  const value = text.trim();
  if (initialMetadataPatterns.some((pattern) => pattern.test(value)))
    return true;
  // 只有整块均为语言与音轨／字幕标签时才过滤，正文中的 Audio、Sub 等词仍保留。
  const trackWords = value.split(/[\s,/_+&.\-]+/).filter(Boolean);
  const trackLanguage =
    /^(?:CN|EN|ENG|JP|JPN|JAP|CHS|CHT|ENCC|JPCC|FR|FRA|FRE|ES|SPA|PT|POR|IT|ITA|DE|DEU|GER|RU|RUS|KR|KOR|VIE|TC|SC|YUE|CAN|Japanese|English|Chinese|German|French|Spanish|Portuguese|Italian|Russian|Korean|Vietnamese)$/i;
  const trackRole = /^(?:Audio|Subs?|Subtitles?|Dubs?|Dubbed|Dual|Multi)$/i;
  if (
    trackWords.some((word) => trackLanguage.test(word)) &&
    trackWords.some((word) => trackRole.test(word)) &&
    trackWords.every((word) => trackLanguage.test(word) || trackRole.test(word))
  )
    return true;
  if (trackMetadataPatterns.some((pattern) => pattern.test(value))) return true;
  if (/(?<!\|)[|｜](?!\|)/.test(value)) return false;
  if (releaseMetadataPatterns.some((pattern) => pattern.test(value)))
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
  if (deliveryMetadataPatterns.some((pattern) => pattern.test(value)))
    return true;
  // 双语发行说明只有两侧都能独立识别为元信息时，才整体排除。
  const bilingual = value.match(/^([^()（）]+)\s*[(（]([^()（）]+)[)）]$/);
  if (bilingual && metadata(bilingual[1]) && metadata(bilingual[2]))
    return true;
  if (attributeMetadataPatterns.some((pattern) => pattern.test(value)))
    return true;
  const pieces = value.split(/[ _,/+&＆]+/).filter(Boolean);
  if (pieces.length > 1 && pieces.every((piece) => metadata(piece)))
    return true;
  if (!value) return true;
  if (trailingMetadataPatterns.some((pattern) => pattern.test(value)))
    return true;
  if (
    /^(?:AMZN|NETFLIX|NHK|BILI|WETV|YTB|TWTR|CTHP|IQ|VIKI|MW)\b/i.test(value) &&
    technical.test(value)
  )
    return true;
  if (mediaMetadataPatterns.some((pattern) => pattern.test(value))) return true;
  // 带点号的词名不能因为第一个单词恰好也是编码名而被整段删除。
  if (/^[A-Za-z]+-Ass$/i.test(value)) return false;
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
