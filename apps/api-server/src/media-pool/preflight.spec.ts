import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  bounded,
  probeMediaDirectories,
  MEDIA_MIGRATION_GUIDE,
} from './preflight';
import { mediaTarget, relativeMediaPath } from './paths';
jest.mock('@/config', () => ({ default: {}, __esModule: true }));
let root: string;
beforeEach(async () => {
  root = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), 'lani-preflight-')),
  );
  for (const name of ['downloads', 'library'])
    await fs.mkdir(path.join(root, name));
});
afterEach(async () => {
  jest.restoreAllMocks();
  await fs.rm(root, { recursive: true, force: true });
});
it('不同目录实际硬链接成功，探测文件全部清理', async () => {
  await probeMediaDirectories(
    path.join(root, 'pool'),
    [path.join(root, 'downloads')],
    [path.join(root, 'library')],
    false,
  );
  for (const name of ['pool', 'downloads', 'library'])
    expect(await fs.readdir(path.join(root, name))).toEqual([]);
});
it('独立挂载返回 EXDEV 时诊断包含路径和迁移指引，显式开启复制后可用', async () => {
  jest
    .spyOn(fs, 'link')
    .mockRejectedValue(
      Object.assign(new Error('cross mount'), { code: 'EXDEV' }),
    );
  await expect(
    probeMediaDirectories(
      path.join(root, 'pool'),
      [path.join(root, 'downloads')],
      [path.join(root, 'library')],
      false,
    ),
  ).rejects.toThrow(MEDIA_MIGRATION_GUIDE);
  await probeMediaDirectories(
    path.join(root, 'pool'),
    [path.join(root, 'downloads')],
    [path.join(root, 'library')],
    true,
  );
});
it('开启复制仍拒绝权限错误', async () => {
  jest
    .spyOn(fs, 'link')
    .mockRejectedValue(
      Object.assign(new Error('permission'), { code: 'EACCES' }),
    );
  await expect(
    probeMediaDirectories(
      path.join(root, 'pool'),
      [path.join(root, 'downloads')],
      [path.join(root, 'library')],
      true,
    ),
  ).rejects.toThrow('EACCES');
});
it('预检有超时边界', async () => {
  await expect(
    bounded(new Promise(() => undefined), 5, 'preflight'),
  ).rejects.toThrow('timed out');
});
it.each(['downloads', 'library'])(
  '拒绝媒体池与 %s 目录双向重叠',
  async (name) => {
    const directory = path.join(root, name);
    for (const pool of [directory, path.join(directory, 'pool'), root]) {
      await expect(
        probeMediaDirectories(
          pool,
          [path.join(root, 'downloads')],
          [path.join(root, 'library')],
          false,
        ),
      ).rejects.toThrow('must be separate');
    }
  },
);
it.each([
  '/tmp/file',
  '../file',
  'Season 1/../../file',
  'a//b',
  'a/./b',
  'C:\\video',
  'C:video',
  'a\\b',
  '',
])('拒绝非法版本布局 %s', (value) => {
  expect(() => relativeMediaPath(value)).toThrow();
});
it('合法相对布局解析在季度目录内', () => {
  expect(mediaTarget(root, 'Season 1/Episode.ass')).toBe(
    path.join(root, 'Season 1/Episode.ass'),
  );
});
