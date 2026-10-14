import { AtomContext } from '@/download-job/atoms';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { ImportService } from './index.service';
import { ImportFileAtom } from '@/download-job/atoms/import-file.atom';
import { WriteMetadataAtom } from '@/download-job/atoms/write-metadata.atom';
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
    lani: { moveStrategy: 'copyOnly' },
    s3: { bucket: 'test' },
  },
}));

function atomContext(): AtomContext {
  const context: AtomContext = {
    checkpoint: {},
    assertActive: async () => undefined,
    wait: async () => undefined,
    saveCheckpoint: async (patch) => {
      Object.assign(context.checkpoint, patch);
    },
  };
  return context;
}

it.each(['manual', 'download'])(
  'imports %s videos into the recorded directory',
  async (kind) => {
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
      const target =
        kind === 'manual'
          ? await (new ImportService(prisma as any) as any).importFile(
              1,
              source,
            )
          : (
              await new ImportFileAtom(prisma as any).run(
                1,
                {
                  params: { episodeId: 1 },
                  steps: { findVideoFile: { importPath: source } },
                } as any,
                atomContext(),
              )
            ).filePath;
      expect(target).toBe(
        path.join(root, 'A／B', 'Season 1', 'Episode - S01E01.mkv'),
      );
      expect(await fs.readFile(target, 'utf8')).toBe('video');
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  },
);

it.each(['manual', 'download'])(
  'syncs season metadata repeatedly after the first %s import',
  async (kind) => {
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
          update: jest.fn(async ({ data }) => {
            season = { ...season, ...data };
            return season;
          }),
        },
      };
      if (kind === 'manual') {
        const importer = new ImportService(prisma as any);
        jest
          .spyOn(importer as any, 'refreshEpisode')
          .mockResolvedValue('episode');
        await importer.importSingle(episode.id, source);
      } else {
        const input = {
          params: { episodeId: episode.id },
          steps: { findVideoFile: { importPath: source } },
        } as any;
        input.steps.importFile = await new ImportFileAtom(prisma as any).run(
          1,
          input,
          atomContext(),
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
  },
);
