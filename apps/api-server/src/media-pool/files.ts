import fs from 'fs/promises';
import { constants, createReadStream } from 'fs';
import { createHash, randomUUID } from 'crypto';
import path from 'path';
import { FileIdentity } from '@lani/workflow';

export type LinkMode = 'hardlink' | 'copy';
export function sameFile(
  a: FileIdentity | undefined,
  b: FileIdentity | undefined,
) {
  return (
    !!a &&
    !!b &&
    a.dev === b.dev &&
    a.ino === b.ino &&
    a.size === b.size &&
    a.mtimeMs === b.mtimeMs
  );
}
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

/** 硬链接校验 inode；复制才读取内容，身份快照始终覆盖整个操作。 */
export async function verifyTransfer(
  source: string,
  target: string,
  before: FileIdentity,
  mode: LinkMode,
) {
  const result = await identity(target);
  if (!sameFile(before, await identity(source)) || !result)
    throw new Error('导入期间源文件发生变化');
  if (mode === 'hardlink') {
    if (!sameFile(before, result)) throw new Error('硬链接文件身份不一致');
  } else {
    const sourceDigest = await digest(source);
    const targetDigest = await digest(target);
    if (sourceDigest.hash !== targetDigest.hash)
      throw new Error('复制文件内容校验失败');
    if (
      !sameFile(before, sourceDigest.identity) ||
      !sameFile(result, targetDigest.identity)
    )
      throw new Error('复制期间文件身份发生变化');
  }
  if (
    !sameFile(before, await identity(source)) ||
    !sameFile(result, await identity(target))
  )
    throw new Error('导入期间文件身份发生变化');
  return result;
}

/** UUID 和源身份由准备记录先行持久化；已有目标只允许属于同一次操作。 */
export async function importToPool(
  root: string,
  source: string,
  acceptCopy: boolean,
  id = randomUUID(),
  expected?: FileIdentity,
) {
  source = await canonical(source);
  const before = await identity(source);
  if (!before || !before.size) throw new Error('媒体文件不存在或为空');
  if (expected && !sameFile(expected, before))
    throw new Error('导入源文件已经变化');
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error('媒体文件 UUID 无效');
  const poolPath = path.join(root, 'files', id.slice(0, 2), id);
  await fs.mkdir(path.dirname(poolPath), { recursive: true });
  await canonical(poolPath);
  const receipt = `${poolPath}.json`;
  let mode: LinkMode;
  let poolIdentity = await identity(poolPath);
  if (poolIdentity) {
    // 完成文件和回执原子发布之间中断：硬链接可直接验证，复制需核对内容。
    const saved = JSON.parse(await fs.readFile(receipt, 'utf8'));
    if (
      saved.id !== id ||
      saved.source !== source ||
      !sameFile(saved.sourceIdentity, before)
    )
      throw new Error('媒体池目标归属冲突');
    mode = saved.mode;
    if (saved.poolIdentity && !sameFile(saved.poolIdentity, poolIdentity))
      throw new Error('媒体池目标身份已变化');
    await verifyTransfer(source, poolPath, before, mode);
  } else {
    const temporary = `${poolPath}.tmp`;
    // 固定暂存名只能在匹配本次 UUID 的准备回执后清理。
    try {
      const saved = JSON.parse(await fs.readFile(receipt, 'utf8'));
      if (
        saved.id !== id ||
        saved.source !== source ||
        !sameFile(saved.sourceIdentity, before)
      )
        throw new Error('媒体池目标归属冲突');
      await fs.rm(temporary, { force: true });
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    await writeRecord(receipt, { id, source, sourceIdentity: before });
    mode = await linkOrCopy(source, temporary, acceptCopy);
    try {
      poolIdentity = await verifyTransfer(source, temporary, before, mode);
      await durable(temporary);
      await writeRecord(receipt, {
        id,
        source,
        sourceIdentity: before,
        mode,
        poolIdentity,
      });
      await fs.link(temporary, poolPath);
      await durable(path.dirname(poolPath));
    } finally {
      await fs.rm(temporary, { force: true });
    }
  }
  return {
    id,
    size: BigInt(before.size),
    poolPath,
    poolIdentity: poolIdentity!,
    source,
    sourceIdentity: before,
    mode,
  };
}

/** 恢复记录先落盘再改变媒体文件；同目录 rename 保证只读到完整 JSON。 */
export async function writeRecord(filename: string, value: unknown) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  await fs.writeFile(temporary, JSON.stringify(value), {
    flag: 'wx',
    mode: 0o600,
  });
  await durable(temporary);
  await fs.rename(temporary, filename);
  await durable(path.dirname(filename));
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
