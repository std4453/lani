import fs from 'fs/promises';
import path from 'path';
import { canonical, durable, writeRecord } from './files';

export interface DirectoryMove {
  oldPath: string;
  newPath: string;
  dev: number;
  ino: number;
}
const exists = async (name: string) => {
  try {
    return await fs.lstat(name);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
};

/** 调用方持久化业务定位信息；工具仅校验目录并记录文件系统身份。 */
export async function prepareDirectoryMove<
  T extends { oldPath: string; newPath: string },
>(filename: string, move: T): Promise<T & DirectoryMove> {
  await canonical(move.oldPath);
  await canonical(move.newPath);
  const stat = await exists(move.oldPath);
  if (!stat?.isDirectory() || stat.isSymbolicLink())
    throw new Error('原季度目录不存在或不是普通目录');
  if (await exists(move.newPath))
    throw new Error('目标季度目录已存在，无法自动移动');
  const record = { ...move, dev: stat.dev, ino: stat.ino };
  await fs.mkdir(path.dirname(filename), { recursive: true });
  await writeRecord(filename, record);
  return record;
}

/** 恢复始终采用当时的绝对路径和目录身份，不推断业务的新名称。 */
export async function executeDirectoryMove(move: DirectoryMove) {
  await canonical(move.oldPath);
  await canonical(move.newPath);
  const old = await exists(move.oldPath);
  const next = await exists(move.newPath);
  const owned = (stat: typeof old) =>
    stat?.isDirectory() &&
    !stat.isSymbolicLink() &&
    stat.dev === move.dev &&
    stat.ino === move.ino;
  if (old) {
    if (!owned(old) || next) throw new Error('季度移动现场已变化，无法恢复');
    await fs.rename(move.oldPath, move.newPath);
    await durable(path.dirname(move.oldPath));
    await durable(path.dirname(move.newPath));
  } else if (!owned(next)) throw new Error('季度移动目标身份已变化，无法恢复');
}
export async function finishDirectoryMove(filename: string) {
  await fs.unlink(filename);
  await durable(path.dirname(filename));
}

export async function discardUnstartedMove(
  filename: string,
  move: DirectoryMove,
) {
  const old = await exists(move.oldPath);
  if (
    old?.isDirectory() &&
    !old.isSymbolicLink() &&
    old.dev === move.dev &&
    old.ino === move.ino &&
    !(await exists(move.newPath))
  )
    await finishDirectoryMove(filename);
}
