import { TaskService } from '@/task/index.service';
import { ImportService } from '@/import/index.service';
import { ImportFileAtom } from '@/task/atoms/import-file.atom';
import { TaskStore } from '@/task/task-store';
import { WorkflowRunner } from '@/task/workflow-runner';
import { requestCancellation, buildWorkflowSnapshot } from '@lani/workflow';
import { PrismaClient, Prisma } from '@lani/db';
import { MediaPool, VersionInput } from './media-pool.service';
import { ExecutionStopped } from '@/task/atom';
import { identity } from './files';
import { MediaOperations } from '@/common/media-operations';
import { SeasonMediaService } from '@/season-emit/media.service';
import config from '@/config';
import {
  applyBackfill,
  inspectBackfillFile,
} from '@/media-initialization/backfill';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    mediaPool: {},
    jellyfin: { pathMapping: [] },
    downloadClient: { kind: 'test', test: { pathMapping: [] } },
  },
}));
const url = process.env.LANI_LIFECYCLE_TEST_DATABASE_URL;
(url ? describe : describe.skip)('媒体池数据库与文件系统恢复', () => {
  let db: PrismaClient;
  let root: string;
  let pool: MediaPool;
  let episodeId: number;
  let folderId: number;
  let seasonId: number;
  const renameSeason = (
    id: number,
    oldPath: string,
    newPath: string,
    directory: string,
  ) =>
    operations.run(() =>
      seasons.renameWithinOperation(id, oldPath, newPath, directory),
    );
  let active = true;
  let seasons: SeasonMediaService;
  let operations: MediaOperations;
  const context = () => ({
    assertActive: async () => {
      if (!active) throw new ExecutionStopped();
    },
    beforeFiles: async () => undefined,
    transaction: <T>(write: (tx: Prisma.TransactionClient) => Promise<T>) =>
      db.$transaction(write),
    commit: (write: (tx: Prisma.TransactionClient) => Promise<void>) =>
      db.$transaction(async (tx) => {
        if (!active) throw new ExecutionStopped();
        await write(tx);
      }),
  });
  const input = async (
    key: string,
    extension = 'mkv',
    subtitles = true,
  ): Promise<VersionInput> => {
    const source = path.join(root, `${key}.${extension}`);
    const target = `Episode.${extension}`;
    await fs.writeFile(source, `content-${key}`);
    const files: VersionInput['files'] = [{ source, target, role: 'video' }];
    if (subtitles) {
      const sub = path.join(root, `${key}.ass`);
      await fs.writeFile(sub, `subtitle-${key}`);
      files.push({
        source: sub,
        target: 'Episode.ass',
        role: 'subtitle',
      });
    }
    return { episodeId, registrationKey: key, mode: 'import', files };
  };
  const legacyEntry = async (legacy: VersionInput) => {
    await fs.mkdir(path.join(root, 'library'), { recursive: true });
    for (const file of legacy.files)
      await fs.link(file.source!, path.join(root, 'library', file.target));
    return {
      episodeId,
      jellyfinEpisodeId: 'legacy-item',
      files: await Promise.all(
        legacy.files.map((file) =>
          inspectBackfillFile(
            path.join(root, 'library', file.target),
            file.role,
          ),
        ),
      ),
    };
  };
  beforeAll(async () => {
    const parsed = new URL(url!);
    if (
      !['127.0.0.1', 'localhost'].includes(parsed.hostname) ||
      !parsed.pathname.endsWith('_test')
    )
      throw new Error('Isolated localhost *_test database required');
    db = new PrismaClient({
      datasources: { db: { url: url! } },
      rejectOnNotFound: { findUnique: true },
    });
  });
  beforeEach(async () => {
    active = true;
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'lani-media-db-'));
    folderId = (
      await db.jellyfinFolder.create({
        data: { name: root, jellyfinId: root, location: root },
      })
    ).id;
    seasonId = (
      await db.season.create({
        data: {
          title: 'library',
          directory: 'library',
          tags: [],
          aliases: [],
          jellyfinFolderId: folderId,
        },
      })
    ).id;
    episodeId = (await db.episode.create({ data: { seasonId, index: 1 } })).id;
    operations = new MediaOperations();

    pool = new MediaPool(
      db,
      {
        root: path.join(root, 'pool'),
        painfullyAcceptCrossDeviceCopy: false,
      },

      operations,
    );
    config.mediaPool.root = path.join(root, 'pool');
    seasons = new SeasonMediaService(
      db as never,
      pool as never,

      operations,
    );
    await pool.initialize();
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await db.task.deleteMany({ where: { episode: { seasonId } } });
    await db.episode.updateMany({
      where: { seasonId },
      data: { currentVersionId: null },
    });
    await db.episodeVersion.deleteMany({ where: { episode: { seasonId } } });
    await db.mediaAsset.deleteMany({
      where: { poolPath: { startsWith: root } },
    });
    await db.season.deleteMany({ where: { id: seasonId } });
    await db.jellyfinFolder.delete({ where: { id: folderId } });
    await fs.rm(root, { recursive: true, force: true });
  });
  afterAll(async () => {
    await db.$disconnect();
  });
  const current = async () =>
    (await db.episode.findUnique({ where: { id: episodeId } }))!
      .currentVersionId;

  it('下载登记幂等，换扩展名撤下旧字幕，取消发布保留所有原件和版本', async () => {
    const first = await input('first');
    const a = await pool.register(first);
    expect(await pool.register(first)).toBe(a);
    await pool.publish(a, context());
    const old = await db.mediaAsset.findMany();
    const second = await input('second', 'mp4', false);
    const b = await pool.register(second);
    await pool.publish(b, context());
    await pool.publish(b, context());
    expect(await current()).toBe(b);
    expect(
      await identity(path.join(root, 'library', first.files[0].target)),
    ).toBeUndefined();
    expect(
      await identity(path.join(root, 'library', first.files[1].target)),
    ).toBeUndefined();
    expect(
      await fs.readFile(
        path.join(root, 'library', second.files[0].target),
        'utf8',
      ),
    ).toBe('content-second');
    for (const asset of old)
      expect(await identity(asset.poolPath)).toBeDefined();
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(2);
  });
  it('准备失败及取消不改变当前版本和旧媒体', async () => {
    const first = await input('first');
    const a = await pool.register(first);
    await pool.publish(a, context());
    const second = await input('second');
    const b = await pool.register(second);
    const source = await db.episodeVersionFile.findFirst({
      where: { versionId: b, role: 'video' },
      include: { asset: true },
    });
    await fs.unlink(source!.asset.poolPath);
    await expect(pool.publish(b, context())).rejects.toThrow();
    expect(await current()).toBe(a);
    expect(
      await fs.readFile(
        path.join(root, 'library', first.files[0].target),
        'utf8',
      ),
    ).toBe('content-first');
    active = false;
    await expect(pool.publish(b, context())).rejects.toBeInstanceOf(
      ExecutionStopped,
    );
    expect(await current()).toBe(a);
  });
  it('文件完成但提交失败时重试完成目标版本，提交后再试保持文件身份', async () => {
    const a = await pool.register(await input('first'));
    await pool.publish(a, context());
    const b = await pool.register(await input('second', 'mp4', false));
    const ctx = context();
    ctx.commit = async () => {
      throw new Error('commit failure');
    };
    await expect(pool.publish(b, ctx)).rejects.toThrow('commit failure');
    expect(await current()).toBe(a);
    const target = path.join(root, 'library', 'Episode.mp4');
    const finished = await identity(target);
    expect(finished).toBeDefined();
    await pool.publish(b, context());
    await pool.publish(b, context());
    expect(await current()).toBe(b);
    expect(await identity(target)).toEqual(finished);
  });
  it('历史回填验证文件身份，保留 Jellyfin ID，重复运行不增长版本', async () => {
    const legacy = await input('legacy', 'mkv', false);
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const entry = await legacyEntry(legacy);
    await applyBackfill(db, pool, [entry]);
    await applyBackfill(db, pool, [entry]);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    expect(
      (await db.episode.findUnique({ where: { id: episodeId } }))!
        .jellyfinEpisodeId,
    ).toBe('legacy-item');
    const asset = await db.mediaAsset.findFirst({
      where: { jellyfinPath: entry.files[0].path },
    });
    expect(asset!.downloadPath).toBeNull();
    expect(asset!.jellyfinMode).toBe('hardlink');
    await fs.writeFile(legacy.files[0].source!, 'changed');
    await expect(applyBackfill(db, pool, [entry])).rejects.toThrow(
      '身份已变化',
    );
  });
  it('并发登记创建独立版本；相同内容的独立导入保持不同 UUID', async () => {
    const first = await input('first', 'mkv', false);
    const second = await input('second', 'mp4', false);
    const ids = await Promise.all([
      pool.register(first),
      pool.register(second),
    ]);
    expect(new Set(ids).size).toBe(2);
    await fs.copyFile(first.files[0].source!, second.files[0].source!);
    await pool.register({ ...second, registrationKey: 'third' });
    const files = await db.episodeVersionFile.findMany({
      where: { version: { episodeId } },
    });
    expect(new Set(files.map((file) => file.assetId)).size).toBe(3);
  });
  it('回填登记后失败，修改清单可以采用新文件集合；顺序不改变幂等键', async () => {
    const legacy = await input('legacy');
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const entry = await legacyEntry(legacy);
    const read = jest.spyOn(pool as any, 'version');
    read.mockRejectedValueOnce(new Error('Database read failed'));
    await expect(applyBackfill(db, pool, [entry])).rejects.toThrow(
      'Database read failed',
    );
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    // 同一清单换序后重试仍使用登记过的版本。
    read.mockRejectedValueOnce(new Error('Database read failed'));
    await expect(
      applyBackfill(db, pool, [
        { ...entry, files: [...entry.files].reverse() },
      ]),
    ).rejects.toThrow();
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    await fs.unlink(entry.files[1].path);
    const repaired = { ...entry, files: [entry.files[0]] };
    await applyBackfill(db, pool, [repaired]);
    await applyBackfill(db, pool, [repaired]);
    const adopted = await db.episodeVersion.findUnique({
      where: { id: (await current())! },
      include: { files: true },
    });
    expect(adopted!.files.map((file) => file.targetPath)).toEqual([
      path.relative(path.join(root, 'library'), entry.files[0].path),
    ]);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(2);
  });
  it('删除含历史版本的季度，撤下目标并保留池原件和下载源', async () => {
    const first = await input('first');
    await pool.publish(await pool.register(first), context());
    const second = await input('second', 'mp4', false);
    await pool.publish(await pool.register(second), context());
    await seasons.delete(seasonId, async () => undefined);
    expect(await db.season.count({ where: { id: seasonId } })).toBe(0);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(0);
    const assets = await db.mediaAsset.findMany({
      where: { poolPath: { startsWith: root } },
    });
    expect(assets).toHaveLength(3);
    for (const asset of assets) {
      expect(asset.jellyfinPath).toBeNull();
      expect(await identity(asset.poolPath)).toBeDefined();
      expect(await identity(asset.downloadPath!)).toBeDefined();
    }
  });
  it.each([false, true])(
    '删除部分完成或目录已不存在时继续删除，missing=%s',
    async (missing) => {
      const version = await pool.register(await input('first'));
      await pool.publish(version, context());
      const target = path.join(root, 'library');
      const original = fs.rm.bind(fs);
      const remove = jest.spyOn(fs, 'rm').mockImplementationOnce(async () => {
        if (missing) await original(target, { recursive: true });
        else await fs.unlink(path.join(target, 'Episode.ass'));
        throw Object.assign(new Error('Permission denied'), { code: 'EACCES' });
      });
      await expect(
        seasons.delete(seasonId, async () => undefined),
      ).rejects.toThrow('Permission denied');
      remove.mockRestore();
      expect(await current()).toBe(version);
      expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
      await seasons.delete(seasonId, async () => undefined);
      await seasons.delete(seasonId, async () => undefined);
      expect(await db.season.count({ where: { id: seasonId } })).toBe(0);
    },
  );
  it('删除目录期间的新导入等待生命周期完成，不能在删除后提交孤立任务', async () => {
    const version = await pool.register(await input('admission', 'mkv', false));
    await pool.publish(version, context());

    const tasks = new TaskService(
      db as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,

      operations,
    );
    const imports = new ImportService(tasks);
    let entered!: () => void, release!: () => void;
    const started = new Promise<void>((resolve) => {
      entered = resolve;
    });
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });
    const original = fs.rm.bind(fs);
    jest.spyOn(fs, 'rm').mockImplementationOnce(async (target, options) => {
      entered();
      await blocked;
      return original(target, options);
    });
    const deletion = seasons.delete(seasonId, async () => undefined);
    await started;
    const creation = imports.importSingle(episodeId, '/source/video.mkv');
    const rejected = expect(creation).rejects.toThrow('部分剧集不存在');
    await new Promise((resolve) => setImmediate(resolve));
    expect(await db.task.count({ where: { episodeId } })).toBe(0);
    release();
    await deletion;
    await rejected;
    expect(await db.task.count({ where: { episodeId } })).toBe(0);
  });
  it('目录删除后播放器刷新失败保留业务记录，重试刷新成功后才提交删除', async () => {
    const version = await pool.register(
      await input('delete-refresh', 'mkv', false),
    );
    await pool.publish(version, context());
    const refresh = jest
      .fn()
      .mockRejectedValueOnce(new Error('player offline'))
      .mockResolvedValue(undefined);
    await expect(seasons.delete(seasonId, refresh)).rejects.toThrow(
      'player offline',
    );
    expect(await current()).toBe(version);
    expect(
      await identity(path.join(root, 'library', 'Episode.mkv')),
    ).toBeUndefined();
    await seasons.delete(seasonId, refresh);
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(await db.season.count({ where: { id: seasonId } })).toBe(0);
  });
  it('季度有活动任务时删除在文件变动前失败', async () => {
    const first = await input('first', 'mkv', false);
    const version = await pool.register(first);
    await pool.publish(version, context());
    await db.task.create({
      data: {
        type: 'IMPORT',
        legacyStage: 'IMPORTING',
        episodeId,
        workflow: { status: 'running' },
        episodes: { create: { episodeId } },
      },
    });
    const remove = jest.fn();
    await expect(
      seasons.delete(seasonId, async () => undefined),
    ).rejects.toThrow('先处理任务');
    expect(remove).not.toHaveBeenCalled();
    expect(await current()).toBe(version);
    expect(
      await fs.readFile(
        path.join(root, 'library', first.files[0].target),
        'utf8',
      ),
    ).toBe('content-first');
  });
  it('真实任务事务保存版本检查点，源文件消失后恢复不重复入池或改目标', async () => {
    const selected = await input('atom', 'mkv', false);
    const workflow = buildWorkflowSnapshot(
      [{ id: 'import', atom: 'importFile', title: '导入' }],
      { importFile: { wants: [] } } as never,
      new Date().toISOString(),
    );
    const task = await db.task.create({
      data: {
        type: 'IMPORT',
        legacyStage: 'IMPORTING',
        episodeId,
        sourcePath: selected.files[0].source!,
        importPath: selected.files[0].source!,
        workflow: JSON.parse(JSON.stringify(workflow)),
        episodes: { create: { episodeId } },
      },
    });
    const store = new TaskStore(db as never);
    const state = await store.read(task.id);
    const ctx = new WorkflowRunner(store, {} as never, jest.fn())['context'](
      state,
      'import',
    );
    const atom = new ImportFileAtom(db as never, pool as never);
    const result = await atom.run(task.id, state.input, ctx);
    expect(ctx.checkpoint.mediaVersionId).toBe(await current());
    await fs.unlink(selected.files[0].source!);
    expect(await atom.recover(task.id, state.input, ctx)).toEqual(result);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    expect(await fs.readFile(result.filePath!, 'utf8')).toBe('content-atom');
  });
  it('明确沿用视频 UUID 增删字幕，视频身份和外部关联不变', async () => {
    const first = await input('retained', 'mkv', false);
    const a = await pool.register(first);
    await pool.publish(a, context());
    const video = await db.episodeVersionFile.findFirst({
      where: { versionId: a },
      include: { asset: true },
    });
    const subtitle = path.join(root, 'added.ass');
    await fs.writeFile(subtitle, 'subtitle');
    const b = await pool.register({
      episodeId,
      registrationKey: 'added-subtitle',
      mode: 'import',
      files: [
        { assetId: video!.assetId, target: 'Episode.mkv', role: 'video' },
        { source: subtitle, target: 'Episode.ass', role: 'subtitle' },
      ],
    });
    await pool.publish(b, context());
    expect(
      await db.mediaAsset.findUnique({ where: { id: video!.assetId } }),
    ).toEqual(video!.asset);
    await pool.publish(a, context());
    expect(
      await identity(path.join(root, 'library', 'Episode.ass')),
    ).toBeUndefined();
    expect(
      await db.mediaAsset.findUnique({ where: { id: video!.assetId } }),
    ).toEqual(video!.asset);
  });
  it('目录移动前失败撤销意图，后续发布不被失败改名阻塞', async () => {
    const a = await pool.register(await input('rename-denied'));
    await pool.publish(a, context());
    const oldPath = path.join(root, 'library');
    const originalRename = fs.rename.bind(fs);
    const rename = jest.spyOn(fs, 'rename').mockImplementation((from, to) => {
      if (from === oldPath)
        return Promise.reject(
          Object.assign(new Error('denied'), { code: 'EACCES' }),
        );
      return originalRename(from, to);
    });
    await expect(
      renameSeason(seasonId, oldPath, path.join(root, 'renamed'), 'renamed'),
    ).rejects.toThrow('denied');
    rename.mockRestore();
    expect(
      await fs.readdir(path.join(root, 'pool', 'directory-moves')),
    ).toEqual([]);
    const b = await pool.register(await input('after-denied', 'mp4', false));
    await pool.publish(b, context());
    expect(await current()).toBe(b);
    expect(await fs.readFile(path.join(oldPath, 'Episode.mp4'), 'utf8')).toBe(
      'content-after-denied',
    );
  });
  it('改名中断后重试，历史布局不变且可重新采用旧版本、替换及删除', async () => {
    const a = await pool.register(await input('rename-a'));
    await pool.publish(a, context());
    const b = await pool.register(await input('rename-b', 'mp4', false));
    await pool.publish(b, context());
    const before = await db.episodeVersionFile.findMany({
      where: { version: { episodeId } },
      orderBy: { versionId: 'asc' },
    });
    const oldPath = path.join(root, 'library'),
      newPath = path.join(root, 'renamed');
    const transaction = jest
      .spyOn(db, '$transaction')
      .mockRejectedValueOnce(new Error('interrupted rename'));
    await expect(
      renameSeason(seasonId, oldPath, newPath, 'renamed'),
    ).rejects.toThrow('interrupted rename');
    transaction.mockRestore();
    await renameSeason(seasonId, oldPath, newPath, 'renamed');
    expect(
      await db.episodeVersionFile.findMany({
        where: { version: { episodeId } },
        orderBy: { versionId: 'asc' },
      }),
    ).toEqual(before);
    await pool.publish(a, context());
    expect(await fs.readFile(path.join(newPath, 'Episode.mkv'), 'utf8')).toBe(
      'content-rename-a',
    );
    await pool.publish(b, context());
    await seasons.delete(seasonId, async () => undefined);
    expect(
      await db.mediaAsset.count({
        where: { poolPath: { startsWith: root }, jellyfinPath: { not: null } },
      }),
    ).toBe(0);
  });
  it('回填仅暂缓待登记剧集的发布和所在季度的改名删除，无关剧集可准备及发布', async () => {
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const legacy = await legacyEntry(
      await input('pending-legacy', 'mkv', false),
    );
    const replacement = await input('pending-replacement', 'mp4', false);
    const version = await pool.register(replacement);
    await expect(pool.publish(version, context())).rejects.toThrow(
      '历史媒体回填',
    );
    expect(await pool.register(replacement)).toBe(version);
    const oldPath = path.join(root, 'library');
    const newPath = path.join(root, 'renamed');
    await expect(
      renameSeason(seasonId, oldPath, newPath, 'renamed'),
    ).rejects.toThrow('历史媒体待回填');
    await expect(
      seasons.delete(seasonId, async () => undefined),
    ).rejects.toThrow('历史媒体待回填');
    expect(await fs.readFile(legacy.files[0].path, 'utf8')).toBe(
      'content-pending-legacy',
    );
    expect(
      (await db.season.findUnique({ where: { id: seasonId } }))!.directory,
    ).toBe('library');

    // 同季度没有历史播放关联的另一集也可正常准备、发布。
    const other = await db.episode.create({ data: { seasonId, index: 2 } });
    const independent = await input('independent', 'mkv', false);
    independent.episodeId = other.id;
    independent.files[0].target = 'Other.mkv';
    const otherVersion = await pool.register(independent);
    await pool.publish(otherVersion, context());
    expect(
      (await db.episode.findUnique({ where: { id: other.id } }))!
        .currentVersionId,
    ).toBe(otherVersion);

    const unrelated = await db.season.create({
      data: {
        title: 'unrelated',
        directory: 'unrelated',
        tags: [],
        aliases: [],
        jellyfinFolderId: folderId,
      },
    });
    try {
      await fs.mkdir(path.join(root, 'unrelated'));
      await renameSeason(
        unrelated.id,
        path.join(root, 'unrelated'),
        path.join(root, 'other-season'),
        'other-season',
      );
    } finally {
      await seasons.delete(unrelated.id, async () => undefined);
    }

    // 该剧集回填提交后即可继续，无需等待其他剧集的后台登记。
    await applyBackfill(db, pool, [legacy]);
    await pool.publish(version, context());
    await renameSeason(seasonId, oldPath, newPath, 'renamed');
    expect(await fs.readFile(path.join(newPath, 'Episode.mp4'), 'utf8')).toBe(
      'content-pending-replacement',
    );
    await seasons.delete(seasonId, async () => undefined);
  });
  it('排队中的发布、改名和删除在取得互斥后重新判断待回填状态', async () => {
    const version = await pool.register(await input('queued', 'mkv', false));
    let release!: () => void;
    const barrier = operations.run(
      () => new Promise<void>((resolve) => (release = resolve)),
    );
    await new Promise((resolve) => setImmediate(resolve));
    const results = Promise.allSettled([
      pool.publish(version, context()),
      renameSeason(
        seasonId,
        path.join(root, 'library'),
        path.join(root, 'renamed'),
        'renamed',
      ),
      seasons.delete(seasonId, async () => undefined),
    ]);
    try {
      await db.episode.update({
        where: { id: episodeId },
        data: { jellyfinEpisodeId: 'legacy-item' },
      });
    } finally {
      release();
    }
    await barrier;
    for (const result of await results) {
      expect(result.status).toBe('rejected');
      if (result.status === 'rejected')
        expect(result.reason.message).toMatch(/回填/);
    }
    expect(await current()).toBeNull();
  });
  it('同内容的不同剧集独立回填，替换一份不影响另一份', async () => {
    const legacy = await input('duplicate', 'mkv', false);
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const first = await legacyEntry(legacy);
    const other = await db.episode.create({
      data: { seasonId, index: 2, jellyfinEpisodeId: 'other-item' },
    });
    try {
      const otherPath = path.join(root, 'library', 'Other.mkv');
      await fs.copyFile(first.files[0].path, otherPath);
      const entries = [
        first,
        {
          episodeId: other.id,
          jellyfinEpisodeId: 'other-item',
          files: [await inspectBackfillFile(otherPath, 'video')],
        },
      ];
      await applyBackfill(db, pool, entries);
      await applyBackfill(db, pool, entries);
      const assets = await db.mediaAsset.findMany({
        where: { poolPath: { startsWith: root } },
      });
      expect(assets).toHaveLength(2);
      expect(assets[0].id).not.toBe(assets[1].id);
      const otherIdentity = await identity(otherPath);
      await pool.publish(
        await pool.register(await input('new-copy', 'mp4', false)),
        context(),
      );
      expect(await identity(otherPath)).toEqual(otherIdentity);
      expect(
        (await db.episode.findUnique({ where: { id: other.id } }))!
          .jellyfinEpisodeId,
      ).toBe('other-item');
    } finally {
      await db.episode.update({
        where: { id: other.id },
        data: { currentVersionId: null },
      });
      await db.episodeVersion.deleteMany({ where: { episodeId: other.id } });
    }
  });
  it('版本事务失败后重启准备，复用原 UUID 和池路径', async () => {
    const selected = await input('prepared-restart');
    const ctx = context();
    ctx.transaction = async () => {
      throw new Error('interrupted');
    };
    await expect(pool.register(selected, ctx)).rejects.toThrow('interrupted');
    const before = await fs.readdir(path.join(root, 'pool', 'files'), {
      recursive: true,
    } as never);
    const a = await pool.register(selected);
    expect(await pool.register(selected)).toBe(a);
    expect(
      await fs.readdir(path.join(root, 'pool', 'files'), {
        recursive: true,
      } as never),
    ).toEqual(before);
    expect(
      await db.mediaAsset.count({ where: { poolPath: { startsWith: root } } }),
    ).toBe(2);
  });
  it('版本事务已提交但任务检查点尚未保存，重试复用版本和文件 UUID', async () => {
    const selected = await input('lost-checkpoint', 'mkv', false);
    const workflow = buildWorkflowSnapshot(
      [{ id: 'import', atom: 'importFile', title: '导入' }],
      { importFile: { wants: [] } } as never,
      new Date().toISOString(),
    );
    const task = await db.task.create({
      data: {
        type: 'IMPORT',
        legacyStage: 'IMPORTING',
        episodeId,
        sourcePath: selected.files[0].source,
        importPath: selected.files[0].source,
        workflow: JSON.parse(JSON.stringify(workflow)),
        episodes: { create: { episodeId } },
      },
    });
    const store = new TaskStore(db as never);
    const runner = new WorkflowRunner(store, {} as never, jest.fn());
    const state = await store.read(task.id);
    const ctx = runner['context'](state, 'import');
    jest
      .spyOn(ctx, 'saveCheckpoint')
      .mockRejectedValueOnce(new Error('lost checkpoint'));
    const atom = new ImportFileAtom(db as never, pool as never);
    await expect(atom.run(task.id, state.input, ctx)).rejects.toThrow(
      'lost checkpoint',
    );
    const version = await db.episodeVersion.findUnique({
      where: { registrationKey: `task:${task.id}:single` },
      include: { files: true },
    });
    expect(ctx.checkpoint.mediaVersionId).toBeUndefined();
    const retry = runner['context'](await store.read(task.id), 'import');
    await atom.recover(task.id, state.input, retry);
    expect(retry.checkpoint.mediaVersionId).toBe(version!.id);
    expect(retry.checkpoint.mediaPublished).toBe(true);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    expect(
      await db.episodeVersionFile.findMany({
        where: { versionId: version!.id },
      }),
    ).toEqual(version!.files);
  });
  it('同集任务可准备独立版本，采用直到取消前互斥，旧回调不能在交接后提交', async () => {
    const store = new TaskStore(db as never);
    const atom = new ImportFileAtom(db as never, pool as never);
    const runner = new WorkflowRunner(
      store,
      { importFile: atom } as never,
      jest.fn(),
    );
    const create = async (name: string) => {
      const selected = await input(name, 'mkv', false);
      const workflow = buildWorkflowSnapshot(
        [{ id: 'import', atom: 'importFile', title: '导入' }],
        { importFile: { wants: [] } } as never,
        new Date().toISOString(),
      );
      const task = await db.task.create({
        data: {
          type: 'IMPORT',
          legacyStage: 'IMPORTING',
          episodeId,
          sourcePath: selected.files[0].source,
          importPath: selected.files[0].source,
          workflow: JSON.parse(JSON.stringify(workflow)),
          episodes: { create: { episodeId } },
        },
      });
      const state = await store.read(task.id);
      return {
        id: task.id,
        input: state.input,
        ctx: runner['context'](state, 'import'),
      };
    };
    const a = await create('claim-a'),
      b = await create('claim-b');
    await atom.run(a.id, a.input, a.ctx);
    const versionA = await current();
    const publish = jest.spyOn(pool, 'publish');
    publish.mockClear();
    await expect(atom.run(b.id, b.input, b.ctx)).rejects.toThrow(
      '其他任务正在发布',
    );
    expect(publish).not.toHaveBeenCalled();
    const versionB = b.ctx.checkpoint.mediaVersionId;
    expect(versionB).toBeDefined();
    expect(versionB).not.toBe(versionA);
    // 准备阶段的取消不能触碰 A 的恢复现场。
    await atom.cancel(b.id, b.input, b.ctx);
    expect(publish).not.toHaveBeenCalled();
    expect(await current()).toBe(versionA);
    await expect(atom.recover(b.id, b.input, b.ctx)).rejects.toThrow(
      '其他任务正在发布',
    );
    await runner.transition(a.id, (workflow) =>
      requestCancellation(workflow, new Date().toISOString()),
    );
    await runner.start(a.id);
    await atom.recover(b.id, b.input, b.ctx);
    expect(await current()).toBe(versionB);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(2);
    await expect(
      a.ctx.transaction(async ({ tx }) => {
        await tx.episode.update({
          where: { id: episodeId },
          data: { jellyfinEpisodeId: 'late-a' },
        });
      }),
    ).rejects.toBeInstanceOf(ExecutionStopped);
    expect(
      (await db.episode.findUnique({ where: { id: episodeId } }))!
        .jellyfinEpisodeId,
    ).toBeNull();
  });
});
