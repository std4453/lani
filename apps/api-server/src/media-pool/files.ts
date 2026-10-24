import fs from 'fs/promises';
import { constants, createReadStream } from 'fs';
import { createHash, randomUUID } from 'crypto';
import path from 'path';
import { FileIdentity } from '@lani/workflow';
import { sameFile } from '@/task/atoms/import-file.operation';

export type LinkMode = 'hardlink' | 'copy';
export { sameFile };
export async function identity(
  filename: string,
): Promise<FileIdentity | undefined> {
  try {
    const stat = await fs.lstat(filename);
    if (!stat.isFile())
      throw new Error('媒体路径必须是普通文件，不能使用符号链接');
    if (!Number.isSafeInteger(stat.dev) || !Number.isSafeInteger(stat.ino))
      throw new Error(
        '文件系统设备或 inode 超出安全整数范围，无法确认文件身份',
      );
    return {
      dev: stat.dev,
      ino: stat.ino,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
    };
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

export async function durable(filename: string) {
  const handle = await fs.open(filename, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function digest(filename: string) {
  const before = await identity(filename);
  if (!before || before.size === 0) throw new Error('媒体文件不存在或为空');
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  if (!sameFile(before, await identity(filename)))
    throw new Error('读取期间媒体文件发生变化');
  return { hash: hash.digest('hex'), identity: before };
}

/** 只有 EXDEV 可以按显式配置降级；权限、磁盘空间等错误必须原样失败。 */
export async function linkOrCopy(
  source: string,
  target: string,
  acceptCopy: boolean,
): Promise<LinkMode> {
  try {
    await fs.link(source, target);
    return 'hardlink';
  } catch (error) {
    if (error.code !== 'EXDEV') throw error;
    if (!acceptCopy)
      throw new Error(
        '媒体路径不在同一卷，未启用 painfullyAcceptCrossDeviceCopy',
      );
    await fs.copyFile(source, target, constants.COPYFILE_EXCL);
    await durable(target);
    return 'copy';
  }
}

export async function canonical(filename: string) {
  if (!path.isAbsolute(filename)) throw new Error('媒体路径必须是绝对路径');
  const normalized = path.resolve(filename);
  const parent = await fs.realpath(path.dirname(normalized));
  if (parent !== path.dirname(normalized))
    throw new Error('媒体目录不能经过符号链接');
  return normalized;
}

export async function importToPool(
  root: string,
  source: string,
  acceptCopy: boolean,
) {
  source = await canonical(source);
  const content = await digest(source);
  const poolPath = path.join(
    root,
    'sha256',
    content.hash.slice(0, 2),
    content.hash,
  );
  await fs.mkdir(path.dirname(poolPath), { recursive: true });
  await canonical(poolPath);
  let poolIdentity = await identity(poolPath);
  if (!poolIdentity) {
    const temporary = `${poolPath}.${randomUUID()}.tmp`;
    try {
      await linkOrCopy(source, temporary, acceptCopy);
      if (
        !sameFile(content.identity, await identity(source)) ||
        (await digest(temporary)).hash !== content.hash
      )
        throw new Error('导入期间源文件发生变化');
      await durable(temporary);
      try {
        await fs.link(temporary, poolPath);
      } catch (error) {
        if (error.code !== 'EEXIST') throw error;
      }
      await durable(path.dirname(poolPath));
    } finally {
      await fs.rm(temporary, { force: true });
    }
    poolIdentity = await identity(poolPath);
  }
  if ((await digest(poolPath)).hash !== content.hash)
    throw new Error('媒体池文件内容校验失败');
  if (!sameFile(content.identity, await identity(source)))
    throw new Error('导入源文件已经变化');
  const sameInode =
    poolIdentity!.dev === content.identity.dev &&
    poolIdentity!.ino === content.identity.ino;
  if (!sameInode && poolIdentity!.dev !== content.identity.dev && !acceptCopy)
    throw new Error(
      '媒体路径不在同一卷，未启用 painfullyAcceptCrossDeviceCopy',
    );
  return {
    hash: content.hash,
    size: BigInt(content.identity.size),
    poolPath,
    poolIdentity: poolIdentity!,
    source,
    sourceIdentity: content.identity,
    mode: sameInode ? ('hardlink' as const) : ('copy' as const),
  };
}

export const SUBTITLE = /\.(?:srt|ass|ssa|sub|idx|vtt)$/i;
/** 仅选取视频完整 stem 下的附属字幕，不跨视频猜测归属。 */
export async function companions(video: string) {
  const stem = path.basename(video, path.extname(video));
  return (await fs.readdir(path.dirname(video)))
    .filter((name) => SUBTITLE.test(name) && name.startsWith(`${stem}.`))
    .sort()
    .map((name) => path.join(path.dirname(video), name));
}
