import { FileEntry, FileEntryType } from '@/generated/types';

/** 种子一次性返回全部文件，目录浏览不再请求服务端。 */
export function torrentDirectoryEntries(
  files: Array<{ path: string; size: number }>,
  directory: string,
): FileEntry[] {
  const prefix = directory === '/' ? '' : directory.slice(1) + '/';
  const entries = new Map<string, FileEntry>();
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue;
    const remainder = file.path.slice(prefix.length);
    const [name, ...children] = remainder.split('/');
    if (!name) continue;
    const path = '/' + prefix + name;
    entries.set(path, {
      name,
      path,
      type: children.length ? FileEntryType.Directory : FileEntryType.File,
      size: children.length ? null : String(file.size),
      lastModified: '',
    });
  }
  return [...entries.values()].sort(
    (a, b) =>
      Number(b.type === FileEntryType.Directory) -
        Number(a.type === FileEntryType.Directory) ||
      a.name.localeCompare(b.name),
  );
}
