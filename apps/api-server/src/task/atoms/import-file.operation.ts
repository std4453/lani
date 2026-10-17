import { AtomContext } from '@/task/atom';
import { FileCheckpoint, FileIdentity } from '@lani/workflow';
import fs from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

export async function fileIdentity(
  filename: string,
): Promise<FileIdentity | undefined> {
  try {
    const stat = await fs.stat(filename);
    if (!stat.isFile()) throw new Error('目标路径不是普通文件');
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
/** 先持久化暂存文件身份，再无覆盖地发布；源文件只在发布完成后移除。 */
export async function importFile(
  id: number | string,
  source: string,
  target: string,
  strategy: string,
  context: AtomContext,
) {
  let checkpoint = context.checkpoint.file;
  const save = async (value: FileCheckpoint) => {
    await context.saveCheckpoint({ file: value });
    checkpoint = value;
  };
  if (!checkpoint) {
    if (await fileIdentity(target))
      throw new Error('目标文件已存在且不属于本任务，无法导入');
    const sourceIdentity = await fileIdentity(source);
    if (!sourceIdentity) throw new Error('导入源文件不存在');
    await save({
      source,
      target,
      temporary: path.join(path.dirname(target), `.lani-${id}.tmp`),
      strategy,
      phase: 'prepared',
      sourceIdentity,
    });
  }
  // 重启后始终使用已记录的路径，不随元数据变化重新计算目标。
  const cp = checkpoint!;
  await context.assertActive();
  await fs.mkdir(path.dirname(cp.target), { recursive: true });
  if (cp.phase === 'prepared') {
    if (!sameFile(await fileIdentity(cp.source), cp.sourceIdentity))
      throw new Error('导入源文件已经变化');
    await fs.rm(cp.temporary, { force: true });
    let linked = false;
    if (cp.strategy !== 'copyOnly' && cp.strategy !== 'moveOnly') {
      try {
        await fs.link(cp.source, cp.temporary);
        linked = true;
      } catch (error) {
        if (error.code !== 'EXDEV' || cp.strategy === 'hardLinkOnly')
          throw error;
      }
    }
    if (!linked)
      await fs.copyFile(cp.source, cp.temporary, constants.COPYFILE_EXCL);
    if (!sameFile(await fileIdentity(cp.source), cp.sourceIdentity))
      throw new Error('导入期间源文件发生变化');
    const stagedIdentity = await fileIdentity(cp.temporary);
    if (!stagedIdentity || stagedIdentity.size !== cp.sourceIdentity.size)
      throw new Error('暂存文件大小不符');
    await save({
      ...cp,
      phase: 'staged',
      stagedIdentity,
      removeSource:
        cp.strategy === 'moveOnly' ||
        (cp.strategy === 'hardLinkOrMove' && !linked),
    });
  }
  const staged = checkpoint!;
  if (staged.phase === 'staged') {
    await context.assertActive();
    const existing = await fileIdentity(staged.target);
    if (existing && !sameFile(existing, staged.stagedIdentity))
      throw new Error('目标文件已被其他任务占用');
    if (!existing) {
      if (
        !sameFile(await fileIdentity(staged.temporary), staged.stagedIdentity)
      )
        throw new Error('暂存文件已变化或丢失');
      // link 在目标存在时失败，不会覆盖另一任务发布的文件。
      await fs.link(staged.temporary, staged.target);
    }
    await save({ ...staged, phase: 'published' });
  }
  const published = checkpoint!;
  if (!sameFile(await fileIdentity(published.target), published.stagedIdentity))
    throw new Error('已发布文件已变化或丢失');
  await fs.rm(published.temporary, { force: true });
  await context.assertActive();
  if (published.removeSource) {
    const sourceNow = await fileIdentity(published.source);
    if (sourceNow && !sameFile(sourceNow, published.sourceIdentity))
      throw new Error('源文件已变化，不能移除');
    if (sourceNow) await fs.unlink(published.source);
  }
  return published.target;
}
