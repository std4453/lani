import fs from 'fs/promises';
import path from 'path';
import { constants } from 'fs';
import { randomUUID } from 'crypto';
import { canonical, identity, linkOrCopy, verifyTransfer } from './files';

import { MEDIA_MIGRATION_GUIDE } from './guide';
export { MEDIA_MIGRATION_GUIDE } from './guide';
export async function bounded<T>(
  run: Promise<T>,
  milliseconds: number,
  label: string,
): Promise<T> {
  let timer: NodeJS.Timeout;
  try {
    return await Promise.race([
      run,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${milliseconds}ms`)),
          milliseconds,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer!);
  }
}

/** 只探测自建临时文件；真实 link 结果同时验证文件系统和容器挂载边界。 */
export async function probeMediaDirectories(
  pool: string,
  downloads: string[],
  libraries: string[],
  acceptCopy: boolean,
) {
  if (!path.isAbsolute(pool) || path.resolve(pool) === path.parse(pool).root)
    throw new Error('mediaPool.root must be an absolute dedicated directory');
  await fs.mkdir(pool, { recursive: true });
  // Linux 容器可能在库目录内部另挂磁盘；读取挂载表即可发现，无需遍历媒体文件。
  const expand = async (directories: string[]) => {
    let mounts: string;
    try {
      mounts = await fs.readFile('/proc/self/mountinfo', 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') return directories;
      throw error;
    }
    const nested = mounts
      .split('\n')
      .filter(Boolean)
      .map((line) =>
        line
          .split(' ')[4]
          .replace(/\\([0-7]{3})/g, (_, octal) =>
            String.fromCharCode(parseInt(octal, 8)),
          ),
      )
      .filter((mount) =>
        directories.some((directory) =>
          mount.startsWith(path.resolve(directory) + path.sep),
        ),
      );
    return [...new Set([...directories, ...nested])];
  };
  downloads = await expand(downloads);
  libraries = await expand(libraries);
  if (
    [...downloads, ...libraries].some(
      (directory) =>
        path.resolve(directory) === path.resolve(pool) ||
        path.resolve(directory).startsWith(path.resolve(pool) + path.sep),
    )
  )
    throw new Error(
      'Media pool must be separate from download and library roots',
    );
  const roots = [
    ...new Set(
      [pool, ...downloads, ...libraries].map((value) => path.resolve(value)),
    ),
  ];
  if (!downloads.length || !libraries.length)
    throw new Error('Download and media library directories are required');
  for (const root of roots) {
    if (
      (await fs.realpath(root)) !== root ||
      !(await fs.stat(root)).isDirectory()
    )
      throw new Error(
        `Directory is missing, is a symlink, or is not a directory: ${root}`,
      );
    await fs.access(root, constants.R_OK | constants.W_OK | constants.X_OK);
  }
  for (const [sourceRoot, targetRoot] of [
    ...downloads.map((root) => [root, pool]),
    ...libraries.map((root) => [pool, root]),
  ]) {
    const token = randomUUID();
    const source = path.join(sourceRoot, `.lani-preflight-${token}`);
    const target = path.join(targetRoot, `.lani-preflight-${token}.link`);
    try {
      await canonical(source);
      await canonical(target);
      await fs.writeFile(source, 'lani media preflight', {
        flag: 'wx',
        mode: 0o600,
      });
      const before = (await identity(source))!;
      const mode = await linkOrCopy(source, target, acceptCopy);
      await verifyTransfer(source, target, before, mode);
    } catch (error) {
      throw new Error(
        `Media preflight failed: ${sourceRoot} -> ${targetRoot}; ${
          error.code ?? error.message
        }. Check directory access and mount layout; use one shared mount, or explicitly enable mediaPool.painfullyAcceptCrossDeviceCopy for EXDEV only. Guide: ${MEDIA_MIGRATION_GUIDE}`,
      );
    } finally {
      await fs.rm(target, { force: true });
      await fs.rm(source, { force: true });
    }
  }
}
