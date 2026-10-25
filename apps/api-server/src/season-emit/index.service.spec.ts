import { MediaOperations } from '@/common/media-operations';
import { SeasonMediaService } from './media.service';
import config from '@/config';
import { MediaPool } from '@/media-pool/media-pool.service';
import { Prisma } from '@lani/db';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import xml2js from 'xml2js';
import { SeasonEmitService } from './index.service';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/season-jellyfin/SeasonJellyfinService', () => ({
  SeasonJellyfinService: class {},
}));
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    mediaPool: {},
    jellyfin: { pathMapping: [] },
    s3: { bucket: 'test' },
  },
}));

let root: string;
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-directory-'));
});
afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
  await fs.rm(root + '-pool', { recursive: true, force: true });
});

function setup(patch: any = {}) {
  let state = {
    id: 12,
    title: 'A/B',
    directory: null,
    lastWriteDirectory: null,
    lastWriteTitle: null,
    lastWriteToDisk: null,
    jellyfinId: '',
    jellyfinFolderId: 1,
    jellyfinFolder: { location: root },
    tags: [],
    description: '',
    tvdbId: '',
    bangumiId: '',
    yearAndSemester: '',
    bannerImage: null,
    fanartImage: null,
    posterImage: null,
    ...patch,
  };
  const prisma = {
    episode: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    },
    episodeVersion: { deleteMany: jest.fn() },
    mediaAsset: {
      findMany: jest.fn().mockResolvedValue([]),
      updateMany: jest.fn(),
    },
    season: {
      delete: jest.fn(),
      findUnique: jest.fn(async () => state),
      update: jest.fn(async ({ data }) => {
        state = { ...state, ...data };
        return state;
      }),
    },
    task: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
  };
  prisma.$transaction.mockImplementation(async (operation) =>
    operation(prisma),
  );
  const jellyfin = {
    refreshAfterFolderRename: jest.fn(),
    refreshAfterWriteToDisk: jest.fn(),
    refreshAfterDelete: jest.fn(),
  };

  const operations = new MediaOperations();
  config.mediaPool.root = root + '-pool';
  const pool = new MediaPool(
    prisma as any,
    { root: root + '-pool', painfullyAcceptCrossDeviceCopy: false },

    operations,
  );
  const media = new SeasonMediaService(
    prisma as any,
    pool as any,

    operations,
  );
  const service = new SeasonEmitService(
    {} as any,
    jellyfin as any,
    prisma as any,
    media,

    operations,
  );
  return {
    service,
    prisma,
    jellyfin,
    state: () => state,
    write: () => service.writeSeasonMetadata(state),
  };
}

it('仅记录目录的历史季度改名失败后仍按旧位置重试', async () => {
  const { write, state } = setup({ title: 'new', directory: 'old' });
  await fs.mkdir(path.join(root, 'old'));
  await fs.writeFile(path.join(root, 'old', 'video.mkv'), 'video');
  await fs.mkdir(path.join(root, 'new'));
  await expect(write()).rejects.toThrow('目标季度目录已存在');
  expect(state().lastWriteDirectory).toBe('old');
  await fs.rmdir(path.join(root, 'new'));
  await write();
  expect(await fs.readFile(path.join(root, 'new', 'video.mkv'), 'utf8')).toBe(
    'video',
  );
  expect(state().lastWriteDirectory).toBe('new');
});

it('待回填季度改名不改写目录定位或媒体文件，回填后可重试', async () => {
  const { write, state, prisma } = setup({ title: 'new', directory: 'old' });
  prisma.episode.findFirst.mockResolvedValue({ id: 1 });
  await fs.mkdir(path.join(root, 'old'));
  await fs.writeFile(path.join(root, 'old', 'video.mkv'), 'video');
  await expect(write()).rejects.toThrow('历史媒体待回填');
  expect(state().directory).toBe('old');
  expect(state().lastWriteDirectory).toBeNull();
  expect(prisma.season.update).not.toHaveBeenCalled();
  expect(await fs.readdir(root)).toEqual(['old']);
  prisma.episode.findFirst.mockResolvedValue(null);
  await write();
  expect(await fs.readFile(path.join(root, 'new', 'video.mkv'), 'utf8')).toBe(
    'video',
  );
});

it('writes new seasons into a single safe directory and preserves the displayed slash', async () => {
  const { write, state } = setup();
  await write();
  const { tvshow } = await xml2js.parseStringPromise(
    await fs.readFile(path.join(root, 'A／B', 'tvshow.nfo'), 'utf8'),
  );
  expect(tvshow.title).toEqual(['A/B']);
  expect(tvshow.uniqueid[0]).toEqual({
    $: { type: 'lani', default: 'true' },
    _: '12',
  });
  expect(tvshow.uniqueId).toBeUndefined();
  expect(state().directory).toBe('A／B');
  expect(state().lastWriteDirectory).toBe('A／B');
  expect(await fs.readdir(root)).toEqual(['A／B']);
});

it('moves legacy directories on explicit sync, cleans old NFO tags and moves persisted job paths', async () => {
  const old = path.join(root, 'A', 'B');
  await fs.mkdir(path.join(old, 'Season 1'), { recursive: true });
  await fs.writeFile(path.join(old, 'Season 1', 'episode.mkv'), 'video');
  await fs.writeFile(
    path.join(old, 'tvshow.nfo'),
    '<tvshow><uniqueId type="lani">12</uniqueId><tag>old</tag><plot>keep</plot></tvshow>',
  );
  const { write, state, prisma, jellyfin } = setup({
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
    jellyfinId: 'old-id',
  });
  prisma.task.findMany.mockResolvedValue([{ id: 1 }]);
  prisma.task.findUnique.mockResolvedValue({
    id: 1,
    filePath: path.join(old, 'Season 1', 'episode.mkv'),
    nfoPath: path.join(old, 'Season 1', 'episode.nfo'),
  });
  await write();
  const target = path.join(root, 'A／B');
  expect(
    await fs.readFile(path.join(target, 'Season 1', 'episode.mkv'), 'utf8'),
  ).toBe('video');
  const { tvshow } = await xml2js.parseStringPromise(
    await fs.readFile(path.join(target, 'tvshow.nfo'), 'utf8'),
  );
  expect(tvshow.uniqueId).toBeUndefined();
  expect(tvshow.uniqueid[0]._).toBe('12');
  expect(tvshow.tag).toBeUndefined();
  expect(tvshow.plot).toEqual(['keep']);
  expect(prisma.task.findMany).toHaveBeenCalledWith({
    orderBy: { id: 'asc' },
    where: {
      OR: [
        { episode: { seasonId: 12 } },
        { episodes: { some: { episode: { seasonId: 12 } } } },
      ],
    },
    select: { id: true },
  });
  expect(prisma.task.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: {
      filePath: path.join(target, 'Season 1', 'episode.mkv'),
      nfoPath: path.join(target, 'Season 1', 'episode.nfo'),
      batchEntries: Prisma.DbNull,
      version: { increment: 1 },
    },
  });
  expect(jellyfin.refreshAfterFolderRename).toHaveBeenCalled();
  expect(state().jellyfinId).toBe('');
  // 已完成清洗后再次执行不会尝试移动不存在的旧目录。
  await write();
});

it('does not move a directory when only the title changes to an equivalent sanitized name', async () => {
  const { write, jellyfin } = setup({
    title: 'A／B',
    directory: 'A／B',
    lastWriteDirectory: 'A／B',
    lastWriteTitle: 'A/B',
  });
  await fs.mkdir(path.join(root, 'A／B'));
  await write();
  expect(jellyfin.refreshAfterFolderRename).not.toHaveBeenCalled();
});

it('refuses to overwrite an existing target, even if it is empty', async () => {
  await fs.mkdir(path.join(root, 'A', 'B'), { recursive: true });
  await fs.mkdir(path.join(root, 'A／B'));
  const { write, state, jellyfin } = setup({
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
  });
  await expect(write()).rejects.toThrow('目标季度目录已存在');
  expect(state().lastWriteDirectory).toBeNull();
  expect(jellyfin.refreshAfterFolderRename).not.toHaveBeenCalled();
});

it('refuses to reuse an untracked existing directory for a new season', async () => {
  await fs.mkdir(path.join(root, 'A／B'));
  const { write } = setup();
  await expect(write()).rejects.toThrow('目标季度目录已存在');
});

it.each([
  '<episodedetails><uniqueid type="lani">999</uniqueid></episodedetails>',
  '<episodedetails><title>Episode</title></episodedetails>',
  '<episodedetails>',
])('rejects episode NFOs without valid ownership: %s', async (xml) => {
  const directory = path.join(root, 'A／B', 'Season 1');
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'Episode - S01E01.nfo'), xml);
  const { write, prisma, state, jellyfin } = setup();
  prisma.episode.findMany.mockResolvedValue([
    { id: 101, index: 1, episodeType: 'EPISODE', episodeNumber: null },
  ]);
  await expect(write()).rejects.toThrow('目标季度目录已存在');
  expect(state().lastWriteDirectory).toBeNull();
  expect(jellyfin.refreshAfterWriteToDisk).not.toHaveBeenCalled();
  await expect(
    fs.stat(path.join(root, 'A／B', 'tvshow.nfo')),
  ).rejects.toMatchObject({
    code: 'ENOENT',
  });
});

it.each(['<tvshow><uniqueid type="lani">999</uniqueid></tvshow>', '<tvshow>'])(
  'does not override a conflicting season NFO using episode evidence: %s',
  async (xml) => {
    const directory = path.join(root, 'A／B');
    await fs.mkdir(path.join(directory, 'Season 1'), { recursive: true });
    await fs.writeFile(path.join(directory, 'tvshow.nfo'), xml);
    await fs.writeFile(
      path.join(directory, 'Season 1', 'Episode - S01E01.nfo'),
      '<episodedetails><uniqueid type="lani">101</uniqueid></episodedetails>',
    );
    const { write, prisma } = setup();
    prisma.episode.findMany.mockResolvedValue([
      { id: 101, index: 1, episodeType: 'EPISODE', episodeNumber: null },
    ]);
    await expect(write()).rejects.toThrow('目标季度目录已存在');
    expect(await fs.readFile(path.join(directory, 'tvshow.nfo'), 'utf8')).toBe(
      xml,
    );
  },
);

it('recovers an interrupted directory move using its durable identity journal', async () => {
  await fs.mkdir(path.join(root, 'A', 'B'), { recursive: true });
  const { write, state, prisma } = setup({
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
  });
  prisma.$transaction.mockRejectedValueOnce(new Error('database offline'));
  await expect(write()).rejects.toThrow('database offline');
  expect(state().lastWriteDirectory).toBeNull();
  await write();
  expect(state().lastWriteDirectory).toBe('A／B');
});

it('retries a Jellyfin refresh failure without repeating the filesystem move', async () => {
  await fs.mkdir(path.join(root, 'A', 'B'), { recursive: true });
  const { write, state, jellyfin } = setup({
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
    jellyfinId: 'old',
  });
  jellyfin.refreshAfterFolderRename.mockRejectedValueOnce(new Error('offline'));
  await expect(write()).rejects.toThrow('offline');
  expect(state().lastWriteDirectory).toBe('A／B');
  expect(state().jellyfinId).toBe('');
  await write();
  expect(jellyfin.refreshAfterFolderRename).toHaveBeenCalledTimes(1);
  expect(jellyfin.refreshAfterWriteToDisk).toHaveBeenCalledTimes(1);
});

it('checks directory uniqueness before moving files', async () => {
  const { write, prisma } = setup();
  prisma.season.update.mockRejectedValueOnce(new Error('directory conflict'));
  await expect(write()).rejects.toThrow('directory conflict');
  expect(await fs.readdir(root)).toEqual([]);
});

it('retries a new season after its initial NFO write fails', async () => {
  const { write } = setup();
  const writeFile = jest
    .spyOn(fs, 'writeFile')
    .mockRejectedValueOnce(new Error('disk failure'));
  try {
    await expect(write()).rejects.toThrow('disk failure');
    await write();
    expect(
      await fs.readFile(path.join(root, 'A／B', 'tvshow.nfo'), 'utf8'),
    ).toContain('<uniqueid type="lani"');
  } finally {
    writeFile.mockRestore();
  }
});

it('retries refresh even when the NFO no longer needs changes', async () => {
  await fs.mkdir(path.join(root, 'A／B'));
  const { write, jellyfin } = setup({
    directory: 'A／B',
    lastWriteDirectory: 'A／B',
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
    jellyfinId: 'existing',
  });
  jellyfin.refreshAfterWriteToDisk.mockRejectedValueOnce(new Error('offline'));
  await expect(write()).rejects.toThrow('offline');
  await write();
  expect(jellyfin.refreshAfterWriteToDisk).toHaveBeenCalledTimes(2);
});

it('deletes from the last written directory rather than a changed display title', async () => {
  await fs.mkdir(path.join(root, 'old'));
  await fs.mkdir(path.join(root, 'new'));
  const { service, state } = setup({
    title: 'new',
    directory: 'new',
    lastWriteDirectory: 'old',
  });
  await service.deleteSeason(state());
  expect(await fs.readdir(root)).toEqual(['new']);
});

it('目录删除权限错误继续向上传播，不刷新播放器', async () => {
  await fs.mkdir(path.join(root, 'old'));
  const { service, state, jellyfin } = setup({ lastWriteDirectory: 'old' });
  const failure = Object.assign(new Error('Permission denied'), {
    code: 'EACCES',
  });
  const remove = jest.spyOn(fs, 'rm').mockRejectedValueOnce(failure);
  try {
    await expect(service.deleteSeason(state())).rejects.toBe(failure);
    expect(jellyfin.refreshAfterDelete).not.toHaveBeenCalled();
    expect(await fs.readdir(root)).toEqual(['old']);
  } finally {
    remove.mockRestore();
  }
});

it('季度目录已不存在时仍可幂等删除并重试刷新', async () => {
  const { service, state, jellyfin } = setup({ lastWriteDirectory: 'missing' });
  await service.deleteSeason(state());
  expect(jellyfin.refreshAfterDelete).toHaveBeenCalledTimes(1);
});

it('目录改名在任务锁内读取新产物，保留并发写入的批量条目并推进版本', async () => {
  const old = path.join(root, 'A', 'B');
  await fs.mkdir(old, { recursive: true });
  const { write, prisma } = setup({
    lastWriteTitle: 'A/B',
    lastWriteToDisk: new Date(),
  });
  prisma.task.findMany.mockResolvedValue([{ id: 1 }]);
  let entry = {
    id: 'stable',
    episodeId: 101,
    sourcePath: '/source.mkv',
    filePath: path.join(old, 'episode.mkv'),
    nfoPath: null as string | null,
    jellyfinEpisodeId: null as string | null,
  };
  prisma.$queryRaw.mockImplementation(async () => {
    // 模拟改名等待任务锁时，执行器刚刚保存的产物。
    entry = {
      ...entry,
      nfoPath: path.join(old, 'episode.nfo'),
      jellyfinEpisodeId: 'published',
    };
    return [];
  });
  prisma.task.findUnique.mockImplementation(async () => {
    expect(prisma.$queryRaw).toHaveBeenCalled();
    return { id: 1, filePath: null, nfoPath: null, batchEntries: [entry] };
  });
  await write();
  expect(prisma.task.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: {
      filePath: null,
      nfoPath: null,
      version: { increment: 1 },
      batchEntries: [
        {
          ...entry,
          filePath: path.join(root, 'A／B', 'episode.mkv'),
          nfoPath: path.join(root, 'A／B', 'episode.nfo'),
        },
      ],
    },
  });
});

it('并发季度同步串行完成文件与位置提交，排队请求重新读取实际目录', async () => {
  await fs.mkdir(path.join(root, 'old'));
  const { write, prisma, state, jellyfin } = setup({
    title: 'A',
    directory: 'A',
    lastWriteDirectory: 'old',
    lastWriteTitle: 'old',
  });
  let entered!: () => void, release!: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  jellyfin.refreshAfterFolderRename.mockImplementationOnce(async () => {
    entered();
    await blocked;
  });
  const first = write();
  await started;
  await prisma.season.update({ data: { title: 'B', directory: 'B' } });
  const second = write();
  await new Promise((resolve) => setImmediate(resolve));
  expect(state().lastWriteDirectory).toBe('A');
  expect(await fs.readdir(root)).toEqual(['A']);
  release();
  await Promise.all([first, second]);
  expect(state().lastWriteDirectory).toBe('B');
  expect(await fs.readdir(root)).toEqual(['B']);
  expect(
    await fs.readFile(path.join(root, 'B', 'tvshow.nfo'), 'utf8'),
  ).toContain('<title>B</title>');
});
