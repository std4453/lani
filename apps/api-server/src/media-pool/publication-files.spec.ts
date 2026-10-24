import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { identity, importToPool, linkOrCopy } from './files';
import { identity as fileIdentity, verifyTransfer } from './files';
import nodeFs from 'fs';
import {
  executePublication,
  finishPublication,
  PublicationSource,
} from './publication-files';
let root: string;
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-pool-'));
});
afterEach(async () => {
  jest.restoreAllMocks();
  await fs.rm(root, { recursive: true, force: true });
});
async function file(name: string, text = name) {
  const target = path.join(root, name);
  await fs.writeFile(target, text);
  return target;
}

it('独立导入生成不同 UUID，同一操作重试复用 UUID 且不读取文件内容', async () => {
  const source = await file('download.mkv');
  const pool = path.join(root, 'pool');
  const read = jest.spyOn(nodeFs, 'createReadStream');
  const first = await importToPool(pool, source, false);
  expect(first.mode).toBe('hardlink');
  expect((await fs.stat(first.poolPath)).ino).toBe((await fs.stat(source)).ino);
  expect(
    (await importToPool(pool, source, false, first.id, first.sourceIdentity))
      .id,
  ).toBe(first.id);
  expect((await importToPool(pool, source, false)).id).not.toBe(first.id);
  expect(read).not.toHaveBeenCalled();
});
it('拒绝空文件和符号链接', async () => {
  const empty = await file('empty', '');
  await expect(
    importToPool(path.join(root, 'pool'), empty, false),
  ).rejects.toThrow('为空');
  await fs.symlink(empty, path.join(root, 'link'));
  await expect(
    importToPool(path.join(root, 'pool'), path.join(root, 'link'), false),
  ).rejects.toThrow('符号链接');
});
it('超出安全整数范围的 inode 拒绝登记，避免舍入后误认文件', async () => {
  const source = await file('video.mkv');
  const stat = await fs.stat(source);
  jest.spyOn(fs, 'lstat').mockResolvedValue({
    ...stat,
    isFile: () => true,
    ino: Number.MAX_SAFE_INTEGER + 1,
  } as never);
  jest.spyOn(fs, 'stat').mockResolvedValue({
    ...stat,
    isFile: () => true,
    ino: Number.MAX_SAFE_INTEGER + 1,
  } as never);
  await expect(identity(source)).rejects.toThrow('安全整数范围');
  await expect(fileIdentity(source)).rejects.toThrow('安全整数范围');
  await expect(
    importToPool(path.join(root, 'pool'), source, false),
  ).rejects.toThrow('安全整数范围');
});
it('只有明确接受 EXDEV 才复制，其他文件错误不降级', async () => {
  const source = await file('source');
  const spy = jest
    .spyOn(fs, 'link')
    .mockRejectedValue(
      Object.assign(new Error('cross device'), { code: 'EXDEV' }),
    );
  await expect(
    linkOrCopy(source, path.join(root, 'strict'), false),
  ).rejects.toThrow('painfullyAcceptCrossDeviceCopy');
  expect(await linkOrCopy(source, path.join(root, 'copy'), true)).toBe('copy');
  expect((await fs.stat(source)).ino).not.toBe(
    (await fs.stat(path.join(root, 'copy'))).ino,
  );
  spy.mockRejectedValue(
    Object.assign(new Error('permission'), { code: 'EACCES' }),
  );
  await expect(
    linkOrCopy(source, path.join(root, 'denied'), true),
  ).rejects.toThrow('permission');
});
it('复制内容不符即失败，即使大小相同', async () => {
  const source = await file('source', 'aaaa');
  const target = await file('target', 'bbbb');
  await expect(
    verifyTransfer(source, target, (await identity(source))!, 'copy'),
  ).rejects.toThrow('内容校验失败');
});
it('已有 UUID 路径不属于本次操作时拒绝复用，源身份变化时拒绝重试', async () => {
  const source = await file('source');
  const pool = path.join(root, 'pool');
  const first = await importToPool(pool, source, false);
  const other = await file('other', 'source');
  await expect(importToPool(pool, other, false, first.id)).rejects.toThrow(
    '归属冲突',
  );
  await fs.writeFile(source, 'changed');
  await expect(
    importToPool(pool, source, false, first.id, first.sourceIdentity),
  ).rejects.toThrow('已经变化');
});
it('硬链接过程中源文件变化时不发布池文件', async () => {
  const source = await file('source');
  const link = fs.link;
  jest.spyOn(fs, 'link').mockImplementationOnce(async (from, to) => {
    await link(from, to);
    await fs.writeFile(source, 'changed-during-link');
  });
  await expect(
    importToPool(path.join(root, 'pool'), source, false),
  ).rejects.toThrow('发生变化');
});

async function source(
  name: string,
  target: string,
): Promise<PublicationSource> {
  const filename = await file(name);
  return {
    source: filename,
    target: path.join(root, target),
    assetId: name,
    identity: (await identity(filename))!,
  };
}
it('部分发布后重试只处理剩余文件，未变化的视频原位保留', async () => {
  const video = await source('pool-video', 'episode.mkv');
  const sub = await source('pool-sub', 'episode.ass');
  const original = fs.link.bind(fs);
  const link = jest.spyOn(fs, 'link').mockImplementation((from, to) => {
    if (from === sub.source) throw new Error('interrupted');
    return original(from, to);
  });
  await expect(
    executePublication([], [video, sub], 'registration', false),
  ).rejects.toThrow('interrupted');
  const before = await identity(video.target);
  link.mockRestore();
  const published = await executePublication(
    [],
    [video, sub],
    'registration',
    false,
  );
  expect(await identity(video.target)).toEqual(before);
  await finishPublication([video, sub], 'registration');
  const keep = jest.spyOn(fs, 'link');
  await executePublication(published, [video], 'next', false);
  expect(keep).not.toHaveBeenCalled();
  expect(await identity(sub.target)).toBeUndefined();
  expect(await identity(video.target)).toEqual(before);
});
it('外部替换阻止继续覆盖；待移除文件已不存在视为完成', async () => {
  const video = await source('pool', 'episode.mkv');
  const published = await executePublication([], [video], 'first', false);
  await finishPublication([video], 'first');
  await fs.unlink(video.target);
  await file('episode.mkv', 'external');
  await expect(
    executePublication(published, [], 'next', false),
  ).rejects.toThrow('外部修改');
  await fs.unlink(video.target);
  await executePublication(published, [], 'next', false);
});
it('跨卷复制中断从头重试，已完成但未提交的复制凭暂存 inode 校验归属', async () => {
  const video = await source('pool', 'episode.mkv');
  const originalLink = fs.link.bind(fs);
  jest.spyOn(fs, 'link').mockImplementation((from, to) => {
    if (from === video.source)
      throw Object.assign(new Error('cross device'), { code: 'EXDEV' });
    return originalLink(from, to);
  });
  const originalCopy = fs.copyFile.bind(fs);
  const copy = jest
    .spyOn(fs, 'copyFile')
    .mockImplementationOnce(async (_from, to) => {
      await fs.writeFile(to, 'partial');
      throw new Error('copy interrupted');
    });
  await expect(executePublication([], [video], 'first', true)).rejects.toThrow(
    'copy interrupted',
  );
  expect(await identity(video.target)).toBeUndefined();
  copy.mockImplementation(originalCopy);
  const result = await executePublication([], [video], 'first', true);
  expect(result[0].mode).toBe('copy');
  expect(await fs.readFile(video.target, 'utf8')).toBe('pool');
  copy.mockClear();
  await executePublication([], [video], 'first', true);
  expect(copy).not.toHaveBeenCalled();
  await finishPublication([video], 'first');
  expect(
    (await fs.readdir(root)).filter((name) => name.includes('.lani-')),
  ).toEqual([]);
});
