import { parseHistory, parseRSS, parseSize } from './parse';

const hash = 'abcdef0123456789abcdef0123456789abcdef01';
const title = '[ANi] Example - 03 [1080P][CHT]';
const rss = `<rss><channel><item><title>${title}</title><link>https://nyaa.si/download/123.torrent</link><guid isPermaLink="true">https://nyaa.si/view/123</guid><pubDate>Sat, 17 Oct 2026 21:50:38 -0000</pubDate><nyaa:infoHash>${hash.toUpperCase()}</nyaa:infoHash><nyaa:size>450.0 MiB</nyaa:size></item></channel></rss>`;
const html = `<table class="torrent-list"><tbody><tr><td>category</td><td><a class="comments" href="/view/123#comments">9</a><a href="/view/123" title="${title.replace(
  'Example',
  'A &amp; B',
)}">title</a></td><td><a href="/download/123.torrent">download</a><a href="magnet:?xt=urn:btih:${hash}&amp;dn=title">magnet</a></td><td>450.0 MiB</td><td data-timestamp="1792273838">local time ignored</td><td>1</td></tr></tbody></table>`;

describe('Nyaa list parsing', () => {
  it('reads RSS without detail requests and keeps UTC and permalink', async () => {
    const [item] = await parseRSS(rss);
    expect(item).toEqual({
      hash,
      title,
      torrentLink: 'https://nyaa.si/download/123.torrent',
      permalink: 'https://nyaa.si/view/123',
      size: 471859200n,
      publishDate: new Date('2026-10-17T21:50:38Z'),
    });
  });
  it('parses multiple and empty RSS entries', async () => {
    expect(
      await parseRSS('<rss><channel><title>Nyaa</title></channel></rss>'),
    ).toEqual([]);
    expect(
      await parseRSS(
        rss.replace('</item>', '</item>' + rss.match(/<item>.*<\/item>/)![0]),
      ),
    ).toHaveLength(2);
  });
  it('uses the title link, magnet hash, rounded size and epoch from history', () => {
    expect(parseHistory(html)[0]).toEqual({
      hash,
      title: title.replace('Example', 'A & B'),
      torrentLink: 'https://nyaa.si/download/123.torrent',
      permalink: 'https://nyaa.si/view/123',
      size: 471859200n,
      publishDate: new Date('2026-10-17T21:50:38Z'),
    });
  });
  it.each([
    ['1.2 GiB', 1288490189n],
    ['4 Bytes', 4n],
    ['1.5 MB', 1500000n],
    ['0 Bytes', 0n],
  ])('converts %s', (text, size) => expect(parseSize(text)).toBe(size));
  it('rejects challenge pages and malformed entries instead of reporting success', async () => {
    expect(() => parseHistory('<html>Access denied</html>')).toThrow();
    expect(() => parseHistory(html.replace(hash, 'invalid'))).toThrow();
    expect(() => parseHistory(html.replace('1792273838', 'invalid'))).toThrow();
    expect(() => parseSize('unknown')).toThrow();
    await expect(parseRSS('<html>challenge</html>')).rejects.toThrow();
    await expect(
      parseRSS(rss.replace(hash.toUpperCase(), 'invalid')),
    ).rejects.toThrow();
    await expect(
      parseRSS(
        rss.replace('https://nyaa.si/view/123', 'https://example.com/view/123'),
      ),
    ).rejects.toThrow();
  });
});
