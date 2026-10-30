import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { PrismaService } from '@/common/prisma.service';
import { AtomContext, ExecutionStopped, TaskInput } from '@/task/atom';
import { WriteMetadataAtom } from './write-metadata.atom';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('./publication', () => ({ claimEpisodePublication: jest.fn() }));

let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-metadata-'));
});
afterEach(async () => {
  jest.restoreAllMocks();
  await fs.rm(directory, { recursive: true, force: true });
});

it.each(['cancel', 'partial-write', 'rename', 'cleanup'])(
  '元数据暂存失败保留原文件和原错误：%s',
  async (failureAt) => {
    const nfoPath = path.join(directory, 'episode.nfo');
    const temporary = `${nfoPath}.lani-1.tmp`;
    const original = '<episodedetails><title>原文件</title></episodedetails>';
    await fs.writeFile(nfoPath, original);
    const input: TaskInput = {
      type: 'DOWNLOAD' as const,
      sourcePath: null,
      batchEntries: null,
      id: 1,
      episodeId: 2,
      torrentLink: null,
      qbtTorrentHash: null,
      torrentTitle: null,
      downloadPath: null,
      importPath: null,
      filePath: path.join(directory, 'episode.mkv'),
      nfoPath: null,
      downloadTimeoutMinutes: null,
      jellyfinEpisodeId: null,
    };
    const context: AtomContext = {
      stepId: 'metadata',
      attempt: 1,
      checkpoint: {},
      assertActive: jest.fn(async () => undefined),
      transaction: jest.fn(),
      updateCheckpoint: jest.fn(),
      saveCheckpoint: jest.fn(),
      wait: jest.fn(),
      waitFor: async (operation) => operation,
    };
    const failure =
      failureAt === 'cancel' ? new ExecutionStopped() : new Error(failureAt);
    if (failureAt === 'cancel')
      jest
        .mocked(context.assertActive)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(failure);
    else if (failureAt === 'partial-write') {
      const writeFile = fs.writeFile.bind(fs);
      jest.spyOn(fs, 'writeFile').mockImplementation(async (filename) => {
        await writeFile(filename, 'partial');
        throw failure;
      });
    } else jest.spyOn(fs, 'rename').mockRejectedValueOnce(failure);
    if (failureAt === 'cleanup')
      jest.spyOn(fs, 'rm').mockRejectedValueOnce(new Error('cleanup failed'));
    const prisma = {
      episode: {
        findUnique: jest.fn(async () => ({
          id: 2,
          index: 1,
          episodeType: 'EPISODE',
          episodeNumber: null,
          title: '新标题',
          description: '',
          airTime: null,
        })),
      },
    } as unknown as PrismaService;
    await expect(
      new WriteMetadataAtom(prisma).run(1, input, context),
    ).rejects.toBe(failure);
    if (failureAt !== 'cleanup')
      await expect(fs.stat(temporary)).rejects.toMatchObject({
        code: 'ENOENT',
      });
    expect(await fs.readFile(nfoPath, 'utf8')).toBe(original);
  },
);
