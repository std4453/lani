import { files } from '@ctrl/torrent-file';

/** 种子路径始终相对于下载目录，拒绝路径逃逸及平台间歧义。 */
export function isTorrentFilePath(value: string): boolean {
  return (
    !!value &&
    !/[\\:\0]/.test(value) &&
    value.split('/').every((part) => !!part && part !== '.' && part !== '..')
  );
}

export function readTorrentFiles(input: Buffer) {
  const entries = files(input).files.map(({ path, length }) => ({
    path,
    size: length,
  }));
  if (
    !entries.length ||
    entries.some((entry) => !isTorrentFilePath(entry.path)) ||
    new Set(entries.map((entry) => entry.path)).size !== entries.length
  )
    throw new Error('种子包含无效或重复的文件路径');
  return entries;
}
