import fs from 'fs/promises';
import path from 'path';
import { Prisma, PrismaClient } from '@lani/db';
import { batchImportEntries, FileIdentity } from '@lani/workflow';
import { canonical, durable, identity, sameFile, writeRecord } from './files';

interface Move {
  seasonId: number;
  oldPath: string;
  newPath: string;
  directory: string;
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
function relocate(value: string | null, move: Move) {
  if (!value) return value;
  const relative = path.relative(move.oldPath, value);
  return relative &&
    !relative.startsWith('../') &&
    relative !== '..' &&
    !path.isAbsolute(relative)
    ? path.join(move.newPath, relative)
    : value;
}

/** 目录身份在移动前落盘。恢复始终使用操作当时的绝对位置，不套用新季度名称。 */
export async function moveSeasonDirectory(
  db: PrismaClient,
  root: string,
  move: Omit<Move, 'dev' | 'ino'>,
) {
  await canonical(move.oldPath);
  await canonical(move.newPath);
  const stat = await exists(move.oldPath);
  if (!stat?.isDirectory() || stat.isSymbolicLink())
    throw new Error('原季度目录不存在或不是普通目录');
  if (await exists(move.newPath))
    throw new Error('目标季度目录已存在，无法自动移动');
  const folder = path.join(root, 'directory-moves');
  await fs.mkdir(folder, { recursive: true });
  const filename = path.join(folder, `${move.seasonId}.json`);
  await writeRecord(filename, { ...move, dev: stat.dev, ino: stat.ino });
  await finishMove(db, filename);
}
async function finishMove(db: PrismaClient, filename: string) {
  const move: Move = JSON.parse(await fs.readFile(filename, 'utf8'));
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
    await durable(path.dirname(move.newPath));
  } else if (!owned(next)) throw new Error('季度移动目标身份已变化，无法恢复');
  await db.$transaction(async (tx) => {
    const assets = await tx.mediaAsset.findMany({
      where: { jellyfinPath: { startsWith: move.oldPath + path.sep } },
    });
    for (const asset of assets) {
      const target = relocate(asset.jellyfinPath, move)!;
      if (
        !sameFile(
          await identity(target),
          asset.jellyfinIdentity as unknown as FileIdentity,
        )
      )
        throw new Error('季度改名后的媒体身份不一致');
      await tx.mediaAsset.update({
        where: { id: asset.id },
        data: { jellyfinPath: target },
      });
    }
    const jobs = await tx.task.findMany({
      where: {
        OR: [
          { episode: { seasonId: move.seasonId } },
          { episodes: { some: { episode: { seasonId: move.seasonId } } } },
        ],
      },
      select: { id: true },
    });
    for (const { id } of jobs) {
      await tx.$queryRaw`SELECT id FROM download_jobs WHERE id=${id} FOR UPDATE`;
      const job = await tx.task.findUnique({ where: { id } });
      if (!job) continue;
      await tx.task.update({
        where: { id },
        data: {
          filePath: relocate(job.filePath, move),
          nfoPath: relocate(job.nfoPath, move),
          batchEntries:
            job.batchEntries == null
              ? Prisma.DbNull
              : batchImportEntries(job.batchEntries).map((entry) => ({
                  ...entry,
                  filePath: relocate(entry.filePath ?? null, move),
                  nfoPath: relocate(entry.nfoPath ?? null, move),
                })),
          version: { increment: 1 },
        },
      });
    }
    await tx.season.update({
      where: { id: move.seasonId },
      data: {
        directory: move.directory,
        lastWriteDirectory: move.directory,
        jellyfinId: '',
      },
    });
  });
  await fs.unlink(filename);
  await durable(path.dirname(filename));
}
export async function recoverDirectoryMoves(db: PrismaClient, root: string) {
  const folder = path.join(root, 'directory-moves');
  let names: string[];
  try {
    names = await fs.readdir(folder);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  for (const name of names.filter((name) => name.endsWith('.json')))
    await finishMove(db, path.join(folder, name));
}
