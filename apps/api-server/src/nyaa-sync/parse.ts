import { TorrentItem } from '@/torrent-sync/index.service';
import { load } from 'cheerio';
import { parseStringPromise } from 'xml2js';

export function parseSize(text: string): bigint {
  const match = /^(\d+(?:\.\d+)?)\s*(Bytes|[KMGT]i?B)$/i.exec(text.trim());
  if (!match) throw new Error(`Invalid Nyaa size: ${text}`);
  const unit = match[2].toUpperCase();
  const power = unit === 'BYTES' ? 0 : 'KMGT'.indexOf(unit[0]) + 1;
  const size = Math.round(
    Number(match[1]) * (unit.includes('I') ? 1024 : 1000) ** power,
  );
  if (!Number.isSafeInteger(size))
    throw new Error('Nyaa size exceeds safe integer');
  return BigInt(size);
}

function validated(item: TorrentItem): TorrentItem {
  if (
    !/^[a-f0-9]{40}$/i.test(item.hash) ||
    !item.title.trim() ||
    !Number.isFinite(item.publishDate.getTime()) ||
    !/^https:\/\/nyaa\.si\/view\/\d+$/.test(item.permalink) ||
    !/^https:\/\/nyaa\.si\/download\/\d+\.torrent$/.test(item.torrentLink)
  ) {
    throw new Error('Invalid Nyaa torrent item');
  }
  return { ...item, hash: item.hash.toLowerCase() };
}

export async function parseRSS(xml: string): Promise<TorrentItem[]> {
  const data = await parseStringPromise(xml, { explicitArray: false });
  if (!data?.rss?.channel) throw new Error('Invalid Nyaa RSS response');
  const items = data.rss.channel.item;
  return (items ? (Array.isArray(items) ? items : [items]) : []).map((item) =>
    validated({
      title: item.title,
      hash: item['nyaa:infoHash'],
      torrentLink: item.link,
      permalink: typeof item.guid === 'string' ? item.guid : item.guid?._,
      publishDate: new Date(item.pubDate),
      size: parseSize(item['nyaa:size']),
    }),
  );
}

export function parseHistory(html: string): TorrentItem[] {
  const $ = load(html);
  const table = $('table.torrent-list');
  if (!table.length) throw new Error('Invalid Nyaa history response');
  return table
    .find('tbody tr')
    .toArray()
    .map((row) => {
      const cells = $(row).children('td');
      const title = cells
        .eq(1)
        .find('a[href^="/view/"]')
        .not('.comments')
        .last();
      const magnet = cells.eq(2).find('a[href^="magnet:"]').attr('href') ?? '';
      const hash =
        new URLSearchParams(magnet.slice('magnet:?'.length))
          .getAll('xt')
          .find((xt) => /^urn:btih:/i.test(xt))
          ?.slice(9) ?? '';
      const timestamp = cells.eq(4).attr('data-timestamp');
      return validated({
        title: title.attr('title') ?? title.text(),
        permalink: `https://nyaa.si${title.attr('href')}`,
        torrentLink: `https://nyaa.si${cells
          .eq(2)
          .find('a[href^="/download/"]')
          .attr('href')}`,
        hash,
        size: parseSize(cells.eq(3).text()),
        publishDate: new Date(timestamp ? Number(timestamp) * 1000 : NaN),
      });
    });
}
