import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { FileIdentity } from '@lani/workflow';
import {
  canonical,
  verifyTransfer,
  durable,
  identity,
  linkOrCopy,
  LinkMode,
  sameFile,
} from './files';

export interface PublicationFile {
  target: string;
  old?: FileIdentity;
  backup: string;
  staged: string;
  next?: FileIdentity;

  mode?: LinkMode;
}
export interface PublicationJournal {
  version: 1;
  files: PublicationFile[];
}
export interface PublicationSource {
  target: string;
  source: string;
  assetId: string;
  identity: FileIdentity;
}

/** 准备所有新文件和旧文件备份成功后，调用方才允许持久化日志并开始切换。 */
export async function preparePublication(
  old: Array<{ target: string; identity: FileIdentity; assetId: string }>,
  next: PublicationSource[],
  acceptCopy: boolean,
): Promise<PublicationJournal> {
  const token = randomUUID();
  const journal: PublicationJournal = { version: 1, files: [] };
  try {
    for (const target of new Set([
      ...old.map((f) => f.target),
      ...next.map((f) => f.target),
    ])) {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await canonical(target);
      const previous = old.find((f) => f.target === target);
      const current = await identity(target);
      if (previous ? !sameFile(previous.identity, current) : !!current)
        throw new Error('媒体目标已变化或未登记，不能覆盖');
      const replacement = next.find((f) => f.target === target);
      if (
        replacement &&
        !sameFile(replacement.identity, await identity(replacement.source))
      )
        throw new Error('媒体池文件身份已变化');
      // 明确沿用 UUID 与目标的文件原位保留，不进入切换日志。
      if (previous && replacement?.assetId === previous.assetId) continue;
      const file: PublicationFile = {
        target,
        old: current,
        backup: `${target}.lani-${token}.bak`,
        staged: `${target}.lani-${token}.tmp`,
      };
      journal.files.push(file);
      if (current) await fs.link(target, file.backup);
      if (replacement) {
        file.mode = await linkOrCopy(
          replacement.source,
          file.staged,
          acceptCopy,
        );
        file.next = await verifyTransfer(
          replacement.source,
          file.staged,
          replacement.identity,
          file.mode,
        );
        await durable(file.staged);
      }
      await durable(path.dirname(target));
    }
    return journal;
  } catch (error) {
    await cleanupPublication(journal);
    throw error;
  }
}

export async function applyPublication(journal: PublicationJournal) {
  for (const file of journal.files) {
    const current = await identity(file.target);
    if (file.old ? !sameFile(file.old, current) : !!current)
      throw new Error('切换前媒体目标发生变化');
    if (file.next) {
      if (!sameFile(file.next, await identity(file.staged)))
        throw new Error('待发布文件发生变化');
      // 新建目标无覆盖；替换已登记目标使用同目录 rename。
      if (file.old) await fs.rename(file.staged, file.target);
      else await fs.link(file.staged, file.target);
    } else if (current) await fs.unlink(file.target);
    await durable(path.dirname(file.target));
  }
}

/** 恢复可重复执行；只操作日志中有身份凭据的文件，外部变化保留现场。 */
export async function rollbackPublication(journal: PublicationJournal) {
  for (const file of [...journal.files].reverse()) {
    const current = await identity(file.target);
    if (file.old && sameFile(current, file.old)) continue;
    if (current && !sameFile(current, file.next))
      throw new Error('媒体目标被外部修改，无法自动恢复');
    if (file.old) {
      if (!sameFile(await identity(file.backup), file.old))
        throw new Error('旧媒体备份已变化或丢失');
      // 保留备份直到数据库确认回滚，允许中途再次崩溃。
      const restore = `${file.backup}.restore`;
      if (!(await identity(restore))) await fs.link(file.backup, restore);
      if (!sameFile(await identity(restore), file.old))
        throw new Error('恢复暂存文件已变化');
      await fs.rename(restore, file.target);
    } else if (current) await fs.unlink(file.target);
    await durable(path.dirname(file.target));
  }
}

export async function cleanupPublication(journal: PublicationJournal) {
  for (const file of journal.files) {
    for (const [name, expected] of [
      [file.backup, file.old],
      [file.staged, file.next],
    ] as const) {
      const current = await identity(name);
      // 准备中失败可能尚未记录 next，暂存名仍是本次独有的 UUID。
      if (current && expected && !sameFile(current, expected))
        throw new Error('媒体暂存文件已被外部修改');
      if (current) await fs.unlink(name);
    }
    await durable(path.dirname(file.target));
  }
}
