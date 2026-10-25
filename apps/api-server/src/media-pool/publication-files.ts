import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { FileIdentity } from '@lani/workflow';
import {
  canonical,
  durable,
  identity,
  linkOrCopy,
  LinkMode,
  sameFile,
  verifyTransfer,
} from './files';

export interface PublishedFile {
  target: string;
  assetId: string;
  identity: FileIdentity;
  mode: LinkMode;
}
export interface PublicationSource {
  target: string;
  source: string;
  assetId: string;
  identity: FileIdentity;
}
function temporary(file: PublicationSource, key: string) {
  const token = createHash('sha256')
    .update(key + ':' + file.assetId)
    .digest('hex');
  return `${file.target}.lani-${token}.tmp`;
}

/** 由版本集合重放差量。暂存文件本身保留复制目标的 inode，提交前不删除。 */
export async function executePublication(
  old: PublishedFile[],
  next: PublicationSource[],
  key: string,
  acceptCopy: boolean,
): Promise<PublishedFile[]> {
  const result: PublishedFile[] = [];
  for (const file of next) {
    await fs.mkdir(path.dirname(file.target), { recursive: true });
    await canonical(file.target);
    await canonical(file.source);
    if (!sameFile(file.identity, await identity(file.source)))
      throw new Error('媒体池文件身份已变化');
    const previous = old.find((item) => item.target === file.target);
    let current = await identity(file.target);
    if (previous?.assetId === file.assetId) {
      if (!sameFile(previous.identity, current))
        throw new Error('未变化的媒体目标被外部修改');
      result.push(previous);
      continue;
    }
    if (sameFile(file.identity, current)) {
      result.push({
        target: file.target,
        assetId: file.assetId,
        identity: current!,
        mode: 'hardlink',
      });
      continue;
    }
    const staged = temporary(file, key);
    const stagedIdentity = await identity(staged);
    if (current && sameFile(current, stagedIdentity)) {
      await verifyTransfer(file.source, file.target, file.identity, 'copy');
      result.push({
        target: file.target,
        assetId: file.assetId,
        identity: current,
        mode: 'copy',
      });
      continue;
    }
    if (current && !sameFile(previous?.identity, current))
      throw new Error('媒体目标已变化或未登记，不能覆盖');
    // 未发布的复制可从头开始；只处理登记标识与文件 UUID 确定的本次暂存名。
    const swap = `${staged}.replace`;
    const leftover = await identity(swap);
    if (leftover) {
      if (!sameFile(leftover, stagedIdentity))
        throw new Error('媒体替换暂存文件身份已变化');
      await fs.unlink(swap);
    }
    if (stagedIdentity) await fs.unlink(staged);
    const mode = await linkOrCopy(file.source, staged, acceptCopy);
    const prepared = await verifyTransfer(
      file.source,
      staged,
      file.identity,
      mode,
    );
    await durable(staged);
    await durable(path.dirname(staged));
    const latest = await identity(file.target);
    if (current ? !sameFile(current, latest) : !!latest)
      throw new Error('切换前媒体目标发生变化');
    if (current) {
      await fs.link(staged, swap);
      await fs.rename(swap, file.target);
    } else await fs.link(staged, file.target);
    await durable(path.dirname(file.target));
    current = await identity(file.target);
    if (!sameFile(prepared, current)) throw new Error('发布后的媒体身份已变化');
    result.push({
      target: file.target,
      assetId: file.assetId,
      identity: prepared,
      mode,
    });
  }
  for (const file of old.filter(
    (file) => !next.some((item) => item.target === file.target),
  )) {
    const current = await identity(file.target);
    if (!current) continue;
    await canonical(file.target);
    if (!sameFile(current, file.identity))
      throw new Error('待移除媒体被外部修改');
    await fs.unlink(file.target);
    await durable(path.dirname(file.target));
  }
  return result;
}

/** 仅在版本及 atom 检查点提交后清理；提交结果不明时保留暂存身份凭据。 */
export async function finishPublication(
  files: PublicationSource[],
  key: string,
) {
  for (const file of files) {
    const staged = temporary(file, key);
    for (const filename of [staged, `${staged}.replace`]) {
      const current = await identity(filename);
      if (!current) continue;
      if (!sameFile(current, await identity(file.target)))
        throw new Error('媒体暂存文件身份已变化');
      await fs.unlink(filename);
      await durable(path.dirname(filename));
    }
  }
}
