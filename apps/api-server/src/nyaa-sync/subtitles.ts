import type { SubtitleInfo } from '@lani/parse-torrent-title';
import { load } from 'cheerio';
import { subtitleLanguages } from './subtitle-languages';

export interface NyaaMetadata {
  title: string;
  description: string;
  files: string[];
}

export interface NyaaSubtitleResult {
  version: number;
  status: 'known' | 'none' | 'unknown';
  subtitleInfo?: SubtitleInfo | null;
  evidence: Array<{ source: string; text: string; languages: string[] }>;
}

// 按块保留边界，避免 HTML 的相邻单元格或换行拼接为一个词。
export function metadataText(html: string): string {
  const $ = load(html);
  $('script, style, img').remove();
  $('br').replaceWith('\n');
  $('td, th').append(' | ');
  $('p, div, tr, li, pre, h1, h2, h3, h4, h5, h6, summary, dt, dd').append(
    '\n',
  );
  return $.root().text().replace(/\r\n?/g, '\n');
}

export function extractNyaaMetadata(
  html: string,
  expectedHash: string,
): NyaaMetadata {
  const $ = load(html);
  const description = $('#torrent-description');
  const hash = $('a[href^="magnet:"]')
    .toArray()
    .some((node) => {
      const href = $(node).attr('href') ?? '';
      return new URLSearchParams(href.slice('magnet:?'.length))
        .getAll('xt')
        .some(
          (xt) => xt.toLowerCase() === `urn:btih:${expectedHash.toLowerCase()}`,
        );
    });
  if (!description.length || !hash)
    throw new Error('Invalid Nyaa detail response');
  return {
    title: $('.panel-title').first().text().trim(),
    description: metadataText(description.html() ?? ''),
    files: $('#torrent-filelist li, .torrent-file-list li')
      .toArray()
      .filter((node) => !$(node).children('ul').length)
      .map((node) =>
        $(node).clone().find('.file-size').remove().end().text().trim(),
      ),
  };
}

const SUBTITLE =
  /^(?:(?:soft|hard|embedded|external|internal|multi(?:ple)?)[ -]*)?(?:subtitles?(?:\(s\))?|subs?|字幕语言|字幕語言|(?:\d+\s*(?:言語の?|ヶ国語|か国語))?字幕)(?:\s*(?:languages?|tracks?)(?:\s*\d+)?)?\s*(?:[:：|=–>-]+\s*|$)/i;
const FIELD =
  /^(?:audio|video|general|menu|chapters?|attachments?|source|encoder|encoding|resolution|size|duration|format|note|screenshots?|mediainfo|音频|音軌|视频)\b/i;
const NONE =
  /^(?:(?:subtitles?|subs?|字幕)\s*[:：|=-]\s*(?:none|no|n\/a|无|無)|no\s+(?:subtitles?|subs?)|无字幕|無字幕)[.\s|]*$/i;

export function parseNyaaSubtitles(metadata: NyaaMetadata): NyaaSubtitleResult {
  const evidence: NyaaSubtitleResult['evidence'] = [];
  const languages = new Set<string>();
  const delivery = new Set<SubtitleInfo['delivery'][number]>();
  let none = false;
  let multi = false;
  let listing = false;
  let textTrack: string[] | undefined;
  const add = (
    source: string,
    text: string,
    mode?: SubtitleInfo['delivery'][number],
  ) => {
    const parsed = subtitleLanguages(text);
    if (!parsed.length) return false;
    parsed.forEach((language) => languages.add(language));
    if (mode) delivery.add(mode);
    evidence.push({ source, text: text.slice(0, 500), languages: parsed });
    return true;
  };
  const finishTrack = () => {
    if (!textTrack) return;
    const language = textTrack
      .filter((line) => /^language\s*[:：]/i.test(line))
      .map((line) => line.replace(/^language\s*[:：]\s*/i, ''))
      .join(', ');
    const title = textTrack
      .filter((line) => /^title\s*[:：]/i.test(line))
      .map((line) => line.replace(/^title\s*[:：]\s*/i, ''))
      .join(', ');
    // MediaInfo 的 Language=Chinese 常把简繁写在 Title 中。
    const qualified = subtitleLanguages(title);
    if (
      subtitleLanguages(language).includes('zh') &&
      qualified.some((l) => /^zh-/.test(l))
    ) {
      add('mediainfo', title, 'muxed');
    } else {
      add('mediainfo', language || title, 'muxed');
    }
    textTrack = undefined;
  };

  const lines = metadata.description
    .normalize('NFKC')
    .replace(
      /[|;]\s*(?=(?:audio|video|subtitles?|subs?|source)\s*[:|])/gi,
      '\n',
    )
    .split('\n');
  for (const raw of lines) {
    let line = raw
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*`]/g, '')
      .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
      .replace(/^\s*[>#-]+\s*/, '')
      .trim()
      .replace(/^\|\s*/, '');
    if (/^(?:text(?:\s*#\s*\d+)?|subtitle\s*#\s*\d+)\s*$/i.test(line)) {
      finishTrack();
      textTrack = [];
      listing = false;
      continue;
    }
    if (
      textTrack &&
      !/^(?:general|audio|video|menu|chapters?|attachments?)(?:\s*#?\s*\d+)?\s*$/i.test(
        line,
      )
    ) {
      textTrack.push(line);
      continue;
    }
    if (FIELD.test(line)) {
      finishTrack();
      listing = false;
      continue;
    }
    if (
      NONE.test(line) ||
      /(?:^|[,;.!]\s*)no\s+(?:subtitles?|subs?)[.\s|]*$/i.test(line)
    ) {
      none = true;
      listing = false;
      evidence.push({ source: 'description', text: line, languages: [] });
      continue;
    }
    // 日文发行说明常将字幕字段放在作品名之后；仅截取有字段标记的部分。
    const nativeLabel = line.match(
      /(?:\d+\s*(?:言語の?|ヶ国語|か国語)字幕(?:[】\]]*[:：]|(?=\s|$))|字幕[】\]]*[:：])/,
    );
    if (nativeLabel) {
      line = line
        .slice(nativeLabel.index)
        .replace(/^((?:\d+\s*(?:言語の?|ヶ国語|か国語))?字幕)[】\]]*/, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/^(\d+\s*(?:言語の?|ヶ国語|か国語)字幕)\s+(?=\S)/, '$1: ');
    }
    const label = line.match(SUBTITLE);
    if (label) {
      const value = line
        .slice(label[0].length)
        .replace(
          /^(?:(?:multiple\s+)?subtitles?\s+tracks?\s+)?including\s*[:：]?\s*/i,
          '',
        )
        .split(
          /\b(?:audio|video|source|encoder)\s*[:：|]|\s+(?:if applicable|some [^\n]*cuts)\b/i,
        )[0];
      listing =
        !value.trim() ||
        /^[-:|\s]+$/.test(value) ||
        /^(?:ass|srt|pgs|vtt)$/i.test(value);
      const mode = /hard|burned/i.test(label[0])
        ? 'burned-in'
        : /soft|embedded|internal/i.test(label[0])
        ? 'muxed'
        : /external/i.test(label[0])
        ? 'external'
        : undefined;
      add('description', value, mode);
      multi ||= /\bmulti(?:ple)?[- ]?(?:subs?|subtitles?)\b/i.test(line);
      continue;
    }
    if (listing) {
      if (!line || /^[-:|\s]+$/.test(line)) continue;
      if (add('description', line)) continue;
      listing = false;
    }
    if (/^(?:multi(?:ple)?[- ]?(?:subs?|subtitles?))$/i.test(line))
      multi = true;
    // 无标签的英文表达只接受完整的语言列表 + subtitles 短语。
    if (
      /(?:\bsubtitles?|\bsubs?|字幕)(?:\s*\[[^\]]*\])*\s*[.!|\]]*$/i.test(line)
    ) {
      add('description', line.replace(/字幕/g, ' subtitles '));
    }
  }
  finishTrack();
  for (const file of metadata.files) {
    // 文件名中明确的字幕格式标签也可描述 MKV 内封轨道或压缩包中的字幕。
    for (const label of file.matchAll(/\b(?:PGS|ASS|SRT)\(([^)]+)\)/gi)) {
      add('file', label[1], /\.mkv$/i.test(file) ? 'muxed' : undefined);
    }
    for (const label of file.matchAll(
      /((?:[简簡]体?中文?|[简簡]中|繁体?中文?|繁中))字幕/g,
    )) {
      add('file', label[1]);
    }
    const match = file.match(
      /(?:[.\[(_ -])([^/\\]+)\.(?:ass|ssa|srt|vtt|sup|sub)$/i,
    );
    if (!match) continue;
    // 文件名只看末尾语言标签，不能把作品标题里的 English 当字幕语言。
    const suffix =
      match[1]
        .split(/[.\[\]()]/)
        .filter(Boolean)
        .pop() ?? '';
    add('file', suffix, 'external');
  }
  const known = [...languages].sort();
  const status = known.length ? 'known' : none && !multi ? 'none' : 'unknown';
  return {
    version: 1,
    status,
    ...(known.length || multi
      ? {
          subtitleInfo: {
            languages: known,
            multi: multi || known.length > 1,
            delivery: [...delivery].sort(),
          },
        }
      : status === 'none'
      ? { subtitleInfo: null }
      : {}),
    evidence,
  };
}
