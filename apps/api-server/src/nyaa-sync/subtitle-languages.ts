// 只在已确认的字幕字段中识别语言；不能对整页做关键词搜索。
const aliases: Record<string, string[]> = {
  'zh-Hans': [
    '中国語(简)',
    '中国語(簡)',
    '中国語簡体字',
    '中文(简体)',
    '中文(簡體)',
    'zh-hans',
    'zh-cn',
    'zh-sg',
    'chs',
    'sc',
    '简体中文',
    '簡體中文',
    '简体',
    '簡體',
    '简中',
    '簡中',
    'chinese simplified',
    'simplified chinese',
    'chinese (simplified)',
    'chinese (china)',
    'chinese (prc)',
    'chinese (singapore)',
  ],
  'zh-Hant': [
    '中国語(繁)',
    '中国語(繁体字)',
    '中国語繁体字',
    '中文(繁體)',
    '中文(繁体)',
    'zh-hant',
    'zh-tw',
    'zh-hk',
    'cht',
    'tc',
    '繁体中文',
    '繁體中文',
    '繁体',
    '繁體',
    '繁中',
    'chinese traditional',
    'traditional chinese',
    'chinese (traditional)',
    'chinese (taiwan)',
    'chinese (hong kong)',
  ],
  zh: [
    '中国語',
    '北京語',
    '広東語',
    'zh',
    'zho',
    'chi',
    'chinese',
    '中文',
    '汉语',
    '漢語',
    'mandarin',
  ],
  en: ['en', 'eng', 'english', '英语', '英語', '英文'],
  ja: ['ja', 'jp', 'jpn', 'japanese', '日本語', '日语', '日語', '日文'],
  ko: ['韓国語', 'ko', 'kor', 'korean', '한국어', '韩语', '韓語'],
  ar: ['ar', 'ara', 'arabic', 'العربية'],
  de: ['ドイツ語', 'de', 'deu', 'ger', 'german', 'deutsch'],
  es: [
    'スペイン語',
    '西語',
    'es',
    'spa',
    'spanish',
    'español',
    'espanol',
    'castilian',
  ],
  'es-419': [
    'español (américa latina)',
    'es-419',
    'es-la',
    'spanish (latin america)',
    'latin american spanish',
    'spanish (latam)',
    'latino',
  ],
  'es-ES': ['es-es', 'spanish (spain)', 'european spanish', 'español (españa)'],
  fr: [
    'フランス語',
    '仏語',
    'fr',
    'fra',
    'fre',
    'french',
    'français',
    'francais',
  ],
  it: ['イタリア語', 'it', 'ita', 'italian', 'italiano'],
  pt: ['ポルトガル語', 'pt', 'por', 'portuguese', 'português'],
  'pt-BR': [
    'português (brasil)',
    'pt-br',
    'brazilian portuguese',
    'portuguese (brazil)',
    'portuguese (brazilian)',
  ],
  'pt-PT': ['pt-pt', 'portuguese (portugal)', 'european portuguese'],
  ru: ['ru', 'rus', 'russian', 'русский'],
  uk: ['uk', 'ukr', 'ukrainian'],
  th: ['タイ語', 'th', 'tha', 'thai', 'ไทย'],
  vi: ['vi', 'vie', 'vietnamese', 'tiếng việt'],
  id: ['id', 'ind', 'indonesian', 'bahasa indonesia'],
  ms: ['ms', 'msa', 'may', 'malay', 'bahasa melayu'],
  hi: ['ヒンディー語', 'hi', 'hin', 'hindi'],
  ta: ['ta', 'tam', 'tamil'],
  te: ['te', 'tel', 'telugu'],
  bn: ['bn', 'ben', 'bengali', 'bangla'],
  tr: ['tr', 'tur', 'turkish', 'türkçe'],
  pl: ['polski', 'pl', 'pol', 'polish'],
  nl: ['nl', 'nld', 'dut', 'dutch'],
  sv: ['sv', 'swe', 'swedish'],
  no: ['no', 'nor', 'norwegian'],
  nb: ['nb', 'nob', 'norwegian bokmål'],
  da: ['da', 'dan', 'danish'],
  fi: ['fi', 'fin', 'finnish'],
  el: ['el', 'ell', 'gre', 'greek'],
  he: ['he', 'heb', 'hebrew'],
  cs: ['cs', 'ces', 'cze', 'czech'],
  hu: ['hu', 'hun', 'hungarian'],
  ro: ['ro', 'ron', 'rum', 'romanian'],
  bg: ['bg', 'bul', 'bulgarian'],
  hr: ['hr', 'hrv', 'croatian'],
  sr: ['sr', 'srp', 'serbian'],
  sk: ['sk', 'slk', 'slo', 'slovak'],
  sl: ['sl', 'slv', 'slovenian'],
  fa: ['fa', 'fas', 'per', 'persian', 'farsi'],
  fil: ['fil', 'tgl', 'tagalog', 'filipino'],
  ca: ['ca', 'cat', 'catalan'],
  ne: ['ne', 'nep', 'nepali', 'ネパール語'],
  si: ['si', 'sin', 'sinhala', 'sinhalese', 'シンハラ語'],
};

const entries = Object.entries(aliases)
  .flatMap(([language, names]) => names.map((name) => ({ language, name })))
  .sort((a, b) => b.name.length - a.name.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function subtitleLanguages(input: string): string[] {
  let text = input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[，、；]/g, ',')
    .replace(
      /(?:chinese|中文|中国語)\s*\(([^)]*)\)/gi,
      (match, qualifier: string) => {
        const simplified = /simplified|简|簡/i.test(qualifier);
        const traditional = /traditional|繁/i.test(qualifier);
        return simplified || traditional
          ? ` ${simplified ? 'zh-hans' : ''} ${traditional ? 'zh-hant' : ''} `
          : match;
      },
    )
    .replace(
      /\([^)]*(?:translated|translation|from|source|using|based|via|credit|audio|dubbed|dub|voice)[^)]*\)|\[[^\]]*(?:translated|translation|from|source|using|based|via|credit|audio|dubbed|dub|voice)[^\]]*\]/gi,
      ' ',
    );
  // 否定、计划、求字幕和下载提示不是已有字幕列表。
  if (
    /\b(?:no|not|without|except|missing|wanted|request|will|soon|later|only audio)\b|无字幕|無字幕|不含/.test(
      text,
    )
  )
    return [];
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  const found: string[] = [];
  for (const { language, name } of entries) {
    const regex = new RegExp(
      `(?<![\\p{L}\\p{N}])${escape(name)}(?![\\p{L}\\p{N}])`,
      'gu',
    );
    text = text.replace(regex, () => {
      found.push(language);
      return ' ';
    });
  }
  // 允许语言后附带轨道格式、用途或来源说明，但拒绝自然语言正文。
  text = text
    .replace(/\([^)]*\)|\[[^\]]*\]/g, ' ')
    .replace(
      /\b(?:subtitles?|subs?|languages?|softsubs?|hardsubs?|soft|hard|embedded|external|internal|muxed|burned[ -]?in|ass|ssa|srt|vtt|pgs|utf-?8|webvtt|subrip|full|dialogue|dialog|signs?|songs?|forced|sdh|cc|closed captions?|default|styled|unstyled|and|official|cr|crunchyroll|nf|netflix|hidive|b-global|bilibili)\b/g,
      ' ',
    )
    .replace(/[\s\d:：,，、;；|/\\+&.*#~=[\](){}<>!?–—-]/g, '');
  if (text) return [];
  const languages = [...new Set(found)];
  return languages
    .filter(
      (language) =>
        language !== 'zh' ||
        !languages.some((l) => l === 'zh-Hans' || l === 'zh-Hant'),
    )
    .sort();
}
