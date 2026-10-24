import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { digest, identity, importToPool, linkOrCopy } from './files';
import { fileIdentity } from '@/task/atoms/import-file.operation';
import {
  applyPublication,
  cleanupPublication,
  preparePublication,
  rollbackPublication,
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

it('按 SHA256 入池并保留源硬链接，重复导入不增加文件', async () => {
  const source = await file('download.mkv');
  const pool = path.join(root, 'pool');
  const first = await importToPool(pool, source, false);
  expect(first.mode).toBe('hardlink');
  expect((await fs.stat(first.poolPath)).ino).toBe((await fs.stat(source)).ino);
  expect((await importToPool(pool, source, false)).hash).toBe(first.hash);
  expect(await fs.readdir(path.dirname(first.poolPath))).toEqual([first.hash]);
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
it('换扩展名及字幕切换后仅保留新目标，旧原件保持', async () => {
  const old = await file('episode.mkv');
  const subtitle = await file('episode.ass');
  const source = await file('new-source.mp4');
  const target = path.join(root, 'episode.mp4');
  const journal = await preparePublication(
    [
      { target: old, identity: (await identity(old))! },
      { target: subtitle, identity: (await identity(subtitle))! },
    ],
    [{ target, source, hash: (await digest(source)).hash }],
    false,
  );
  await applyPublication(journal);
  expect(await identity(old)).toBeUndefined();
  expect(await identity(subtitle)).toBeUndefined();
  expect(await fs.readFile(target, 'utf8')).toBe('new-source.mp4');
  expect(await fs.readFile(journal.files[0].backup, 'utf8')).toBe(
    'episode.mkv',
  );
  await cleanupPublication(journal);
  expect(await fs.readdir(root)).toEqual(['episode.mp4', 'new-source.mp4']);
});
it('新文件准备失败时旧视频和字幕不变', async () => {
  const old = await file('episode.mkv');
  const subtitle = await file('episode.ass');
  await expect(
    preparePublication(
      [
        { target: old, identity: (await identity(old))! },
        { target: subtitle, identity: (await identity(subtitle))! },
      ],
      [{ target: old, source: path.join(root, 'missing'), hash: 'bad' }],
      false,
    ),
  ).rejects.toThrow();
  expect(await fs.readdir(root)).toEqual(['episode.ass', 'episode.mkv']);
  expect(await fs.readFile(old, 'utf8')).toBe('episode.mkv');
});
it('切换中途失败可以回滚，模拟重启后重复恢复仍安全', async () => {
  const old = await file('episode.mkv');
  const source = await file('source');
  const journal = await preparePublication(
    [{ target: old, identity: (await identity(old))! }],
    [{ target: old, source, hash: (await digest(source)).hash }],
    false,
  );
  await applyPublication(journal);
  await rollbackPublication(JSON.parse(JSON.stringify(journal)));
  await rollbackPublication(journal);
  expect(await fs.readFile(old, 'utf8')).toBe('episode.mkv');
  await cleanupPublication(journal);
});
it('不覆盖未登记文件，回滚不删除外部替换的文件', async () => {
  const old = await file('episode.mkv');
  const source = await file('source');
  await expect(
    preparePublication(
      [],
      [{ target: old, source, hash: (await digest(source)).hash }],
      false,
    ),
  ).rejects.toThrow('不能覆盖');
  const journal = await preparePublication(
    [{ target: old, identity: (await identity(old))! }],
    [],
    false,
  );
  await applyPublication(journal);
  await fs.writeFile(old, 'external');
  await expect(rollbackPublication(journal)).rejects.toThrow('外部修改');
  expect(await fs.readFile(old, 'utf8')).toBe('external');
});
