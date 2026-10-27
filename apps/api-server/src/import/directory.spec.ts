import { MediaOperations } from '@/common/media-operations';
jest.mock('@/task/atoms/publication', () => ({
  claimEpisodePublication: jest.fn(async () => undefined),
}));
import { AtomContext } from '@/task/atom';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { ImportFileAtom } from '@/task/atoms/import-file.atom';
import { WriteMetadataAtom } from '@/task/atoms/write-metadata.atom';
import { SeasonEmitService } from '@/season-emit/index.service';
import xml2js from 'xml2js';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('@/common/s3.service', () => ({ S3Service: class {} }));
jest.mock('@/season-jellyfin/SeasonJellyfinService', () => ({
  SeasonJellyfinService: class {},
}));
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    jellyfin: { pathMapping: [] },
    downloadClient: { kind: 'test', test: { pathMapping: [] } },
    lani: {},
    s3: { bucket: 'test' },
  },
}));

function atomContext(): AtomContext {
  const context: AtomContext = {
    checkpoint: {},
    stepId: 'import',
    attempt: 1,
    waitFor: async (operation) => operation,
    assertActive: async () => undefined,
    wait: async () => undefined,
    transaction: jest.fn(),
    updateCheckpoint: jest.fn(),
    saveCheckpoint: async (patch) => {
      Object.assign(context.checkpoint, patch);
    },
  };
  return context;
}

// 此处只验证目录选择与元数据兼容；真实入池、替换和恢复由媒体池集成测试覆盖。
function mediaPoolStub(root: string) {
  let files: Array<{ source: string; target: string }> = [];
  return {
    register: jest.fn(async (input) => {
      files = input.files.map((file) => ({
        ...file,
        target: path.join(root, 'A／B', file.target),
      }));
      return 1;
    }),
    publish: jest.fn(async () => {
      for (const file of files) {
        await fs.mkdir(path.dirname(file.target), { recursive: true });
        await fs.link(file.source, file.target);
      }
      return files[0].target;
    }),
  } as any;
}

it('目标视频尚不存在时仍阻止覆盖未登记字幕', async () => {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'lani-import-conflict-'),
  );
  try {
    await fs.writeFile(path.join(root, 'Episode.zh.ass'), 'unknown subtitle');
    const pool = {
      publish: async (_version, context) =>
        context.beforeFiles([
          { role: 'video', targetPath: path.join(root, 'Episode.mkv') },
        ]),
    };
    const atom = new ImportFileAtom({} as never, pool as never);
    await expect(atom['publish'](1, 1, atomContext())).rejects.toThrow(
      '媒体目录存在未登记字幕',
    );
    expect(await fs.readFile(path.join(root, 'Episode.zh.ass'), 'utf8')).toBe(
      'unknown subtitle',
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

it('下载和导入共用原子，将视频写入记录的目录', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-import-'));
  try {
    const source = path.join(root, 'source.mkv');
    await fs.writeFile(source, 'video');
    const prisma = {
      episode: {
        findUnique: async () => ({
          id: 1,
          index: 1,
          episodeType: 'EPISODE',
          season: {
            title: 'A/B',
            directory: 'A／B',
            lastWriteDirectory: 'A／B',
            lastWriteTitle: 'A/B',
            jellyfinFolder: { location: root },
          },
        }),
      },
    };
    const target = (
      await new ImportFileAtom(prisma as any, mediaPoolStub(root)).run(
        1,
        {
          episodeId: 1,
          importPath: source,
        } as any,
        atomContext(),
      )
    ).filePath;
    expect(target).toBe(
      path.join(root, 'A／B', 'Season 1', 'Episode - S01E01.mkv'),
    );
    if (!target) throw new Error('导入未返回目标路径');
    expect(await fs.readFile(target, 'utf8')).toBe('video');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

it('共用原子导入后可重复同步季度元数据', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-import-owner-'));
  try {
    const source = path.join(root, 'source.mkv');
    await fs.writeFile(source, 'video');
    let season = {
      id: 12,
      title: 'A/B',
      directory: null,
      lastWriteDirectory: null,
      lastWriteTitle: null,
      jellyfinId: '',
      jellyfinFolder: { location: root },
      tags: [],
    } as any;
    const episode = {
      id: 101,
      seasonId: season.id,
      title: 'Episode',
      index: 1,
      episodeType: 'EPISODE',
      episodeNumber: null,
    };
    const prisma = {
      episode: {
        findUnique: jest.fn(async () => ({ ...episode, season })),
        findMany: jest.fn(async () => [episode]),
        update: jest.fn(),
      },
      season: {
        findUnique: jest.fn(async () => season),
        update: jest.fn(async ({ data }) => {
          season = { ...season, ...data };
          return season;
        }),
      },
      task: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    {
      const input = {
        episodeId: episode.id,
        importPath: source,
      } as any;
      Object.assign(
        input,
        await new ImportFileAtom(prisma as any, mediaPoolStub(root)).run(
          1,
          input,
          atomContext(),
        ),
      );
      await new WriteMetadataAtom(prisma as any).run(1, input, atomContext());
    }

    const target = path.join(root, 'A／B');
    const nfo = path.join(target, 'tvshow.nfo');
    await expect(fs.stat(nfo)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(season.lastWriteDirectory).toBeNull();
    const jellyfin = { refreshAfterWriteToDisk: jest.fn() };
    const emitter = new SeasonEmitService(
      {} as any,
      jellyfin as any,
      prisma as any,
      {} as never,

      new MediaOperations(),
    );
    await emitter.writeSeasonMetadata(season);
    await emitter.writeSeasonMetadata(season);
    const { tvshow } = await xml2js.parseStringPromise(
      await fs.readFile(nfo, 'utf8'),
    );
    expect(tvshow.uniqueid[0]._).toBe(String(season.id));
    expect(season.lastWriteDirectory).toBe('A／B');
    expect(prisma.episode.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { seasonId: season.id } }),
    );
    expect(jellyfin.refreshAfterWriteToDisk).toHaveBeenCalledTimes(2);
    expect(
      await fs.readFile(
        path.join(target, 'Season 1', 'Episode - S01E01.mkv'),
        'utf8',
      ),
    ).toBe('video');
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
