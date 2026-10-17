import { hashes, info } from '@ctrl/torrent-file';
import magnet from 'magnet-uri';
import { PreparedTorrent } from './IDownloadClient';

/** 内容身份优先保留 v1；下载器 ID 遵循 qBittorrent/libtorrent 2 的 get_best()。 */
export function parseTorrentInput(
  input: string | Buffer,
): Omit<PreparedTorrent, 'input'> {
  if (Buffer.isBuffer(input)) {
    const identity = hashes(input);
    const metadata = info(input);
    const hash = identity.infoHash ?? identity.infoHashV2;
    if (!hash || !metadata.name) throw new Error('Missing torrent identity');
    return {
      hash,
      clientHash: (identity.infoHashV2 ?? hash).slice(0, 40),
      name: metadata.name,
    };
  }

  const url = new URL(input);
  if (url.protocol !== 'magnet:') throw new Error('Invalid magnet protocol');
  // magnet-uri 的匹配较宽松；先拒绝截断、非法字符和重复冲突的身份。
  const identities = url.searchParams.getAll('xt');
  const v1 = identities.filter((xt) => xt.startsWith('urn:btih:'));
  const v2 = identities.filter((xt) => xt.startsWith('urn:btmh:'));
  if (
    (!v1.length && !v2.length) ||
    new Set(v1).size > 1 ||
    new Set(v2).size > 1 ||
    v1.some((xt) => !/^urn:btih:(?:[a-f\d]{40}|[a-z2-7]{32})$/i.test(xt)) ||
    v2.some((xt) => !/^urn:btmh:1220[a-f\d]{64}$/i.test(xt))
  ) {
    throw new Error('Invalid magnet identity');
  }
  // 旧类型声明尚未包含 magnet-uri 6 提供的 v2 字段。
  const parsed = magnet(
    `magnet:?${[...v1, ...v2].map((xt) => `xt=${xt}`).join('&')}`,
  ) as ReturnType<typeof magnet> & { infoHashV2?: string };
  const hash = parsed.infoHash ?? parsed.infoHashV2;
  if (!hash) throw new Error('Missing magnet identity');
  return {
    hash,
    clientHash: (parsed.infoHashV2 ?? hash).slice(0, 40),
    name: url.searchParams.get('dn') ?? undefined,
  };
}
