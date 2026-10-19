import {
  extractNyaaMetadata,
  metadataText,
  parseNyaaSubtitles,
} from './subtitles';

function parse(description: string, files: string[] = []) {
  return parseNyaaSubtitles({
    title: '',
    description: metadataText(description),
    files,
  });
}

describe('deterministic Nyaa subtitle extraction', () => {
  it.each([
    [
      'Subtitles: English, Chinese (Simplified), Chinese (Traditional)',
      ['en', 'zh-Hans', 'zh-Hant'],
    ],
    ['**SUBTITLES**：zh_Hans / ZH-hant / ENG', ['en', 'zh-Hans', 'zh-Hant']],
    [
      '<table><tr><th>Audio</th><td>Japanese</td></tr><tr><th>Subtitles</th><td>English, French</td></tr></table>',
      ['en', 'fr'],
    ],
    [
      '## Subtitles\n- English (Full)\n- Chinese (Traditional)\n## Audio\nJapanese',
      ['en', 'zh-Hant'],
    ],
    [
      'Subtitle(s): French (France) / ASS | German (Germany) / ASS',
      ['de', 'fr'],
    ],
    [
      'Multi Subs -> multiple subtitles tracks including: English, Chinese (Simplified)',
      ['en', 'zh-Hans'],
    ],
    [
      '字幕: 日本語、英語、フランス語、韓国語、中国語(繁体字)',
      ['en', 'fr', 'ja', 'ko', 'zh-Hant'],
    ],
    ['[Chinese&English subtitles]', ['en', 'zh']],
    ['繁体中文字幕', ['zh-Hant']],
    ['Subtitle\nEnglish\nChinese (Traditional)', ['en', 'zh-Hant']],
    ['Subtitles: English (translated from Japanese)', ['en']],
    ['Subtitles: English [source: Chinese]', ['en']],
    ['Subtitles: English (Japanese audio)', ['en']],
    ['Subtitles: English [Chinese dub]', ['en']],
    [
      'Subtitles: English, Chinese (Simplified / Traditional)',
      ['en', 'zh-Hans', 'zh-Hant'],
    ],
    [
      '<pre>General\nFormat : Matroska\nAudio #1\nLanguage : Japanese\nText #1\nFormat : UTF-8\nDuration : 24 min\nLanguage : Chinese\nTitle : Simplified Chinese\nText #2\nLanguage : English\nMenu\nLanguage : French</pre>',
      ['en', 'zh-Hans'],
    ],
    ['Audio: Japanese | Subtitles: English', ['en']],
  ])('extracts scoped languages: %s', (description, languages) => {
    expect(parse(description).subtitleInfo?.languages ?? []).toEqual(languages);
  });

  it.each([
    '<h4>Subtitles</h4><ul><li>English</li><li>Chinese (Simplified)</li></ul>',
    '<section><p><b>Subtitles:</b> English / Chinese (Simplified)</p></section>',
    '| Subtitles | English, Chinese (Simplified) |',
    '> **Subtitles** : English + Chinese (Simplified)',
    '字幕语言：English、Chinese (Simplified)',
  ])('tolerates layout changes without release-group templates: %s', (html) => {
    expect(parse(html).subtitleInfo?.languages).toEqual(['en', 'zh-Hans']);
  });

  it.each([
    'Audio: Chinese, English\nVideo: HEVC',
    'Please add Chinese subtitles',
    'Subtitles: No Chinese subtitles',
    'Subtitles: English will be added later',
    'Subtitles: not English',
    'Subtitles: Hidive (Modified) via Erai-raws',
    'An English title with Japanese audio',
    'There are no Chinese subtitles',
    'Raw video',
    '',
  ])('does not invent languages or absence: %s', (description) => {
    expect(parse(description).status).toBe('unknown');
    expect(parse(description).subtitleInfo).toBeUndefined();
  });

  it('distinguishes explicit absence from unknown and conflicting positive evidence', () => {
    expect(parse('Subtitles: None').subtitleInfo).toBeNull();
    expect(parse('No subtitles').status).toBe('none');
    expect(parse('Japanese audio only; no subtitles.').status).toBe('none');
    expect(parse('No subtitles\nSubtitles: English').status).toBe('known');
    expect(parse('Multi-Subs').subtitleInfo).toEqual({
      languages: [],
      multi: true,
      delivery: [],
    });
  });

  it('only uses language suffixes of subtitle files', () => {
    expect(
      parse('', [
        'Episode.en.ass',
        'Episode.zh-Hant.srt',
        'English Movie.mkv',
        'Japanese.ass',
      ]).subtitleInfo,
    ).toEqual({
      languages: ['en', 'zh-Hant'],
      multi: true,
      delivery: ['external'],
    });
  });

  it('ignores comments and verifies the page identity before persisting metadata', () => {
    const hash = 'a'.repeat(40);
    const html = `<h3 class="panel-title">Title</h3><a href="magnet:?xt=urn:btih:${hash}">magnet</a><div id="torrent-description">Audio: Japanese</div><div id="comments">Subtitles: Chinese</div><div id="torrent-filelist"><ul><li>folder<ul><li>Episode.en.ass<span class="file-size">(1 KiB)</span></li></ul></li></ul></div>`;
    const metadata = extractNyaaMetadata(html, hash);
    expect(metadata.files).toEqual(['Episode.en.ass']);
    expect(parseNyaaSubtitles(metadata).subtitleInfo?.languages).toEqual([
      'en',
    ]);
    expect(() => extractNyaaMetadata(html, 'b'.repeat(40))).toThrow(
      'Invalid Nyaa',
    );
    expect(() => extractNyaaMetadata('<title>Captcha</title>', hash)).toThrow(
      'Invalid Nyaa',
    );
  });
});
