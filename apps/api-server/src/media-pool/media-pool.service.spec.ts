import { ImportFileAtom } from '@/task/atoms/import-file.atom';
import { removeDirectoryIdempotent } from '@/utils/idempotency';
import { TaskStore } from '@/task/task-store';
import { WorkflowRunner } from '@/task/workflow-runner';
import { buildWorkflowSnapshot } from '@lani/workflow';
import { PrismaClient, Prisma } from '@lani/db';
import { MediaPool, VersionInput } from './media-pool.service';
import { AtomContext, ExecutionStopped } from '@/task/atom';
import { identity } from './files';
import { applyPublication, preparePublication } from './publication-files';
import { applyBackfill, inspectBackfillFile } from './backfill';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
jest.mock('@/config', () => ({
  __esModule: true,
  default: {
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
  let active = true;
  const context = (): AtomContext => ({
    checkpoint: {},
    stepId: 'import',
    attempt: 1,
    assertActive: async () => {
      if (!active) throw new ExecutionStopped();
    },
    transaction: (run) =>
      db.$transaction(async (tx) => {
        if (!active) throw new ExecutionStopped();
        return run({ tx } as never);
      }),
    saveCheckpoint: jest.fn(),
    updateCheckpoint: jest.fn(),
    wait: jest.fn(),
    waitFor: (value) => value,
  });
  const input = async (
    key: string,
    extension = 'mkv',
    subtitles = true,
  ): Promise<VersionInput> => {
    const source = path.join(root, `${key}.${extension}`);
    const target = path.join(root, 'library', `Episode.${extension}`);
    await fs.writeFile(source, `content-${key}`);
    const files: VersionInput['files'] = [{ source, target, role: 'video' }];
    if (subtitles) {
      const sub = path.join(root, `${key}.ass`);
      await fs.writeFile(sub, `subtitle-${key}`);
      files.push({
        source: sub,
        target: path.join(root, 'library', 'Episode.ass'),
        role: 'subtitle',
      });
    }
    return { episodeId, operationKey: key, source: 'download', files };
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
          title: root,
          tags: [],
          aliases: [],
          jellyfinFolderId: folderId,
        },
      })
    ).id;
    episodeId = (await db.episode.create({ data: { seasonId, index: 1 } })).id;
    pool = new MediaPool(db, {
      root: path.join(root, 'pool'),
      painfullyAcceptCrossDeviceCopy: false,
    });
    await pool.initialize();
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await db.task.deleteMany({ where: { episodeId } });
    await db.mediaPublication.deleteMany({ where: { episodeId } });
    await db.episode.updateMany({
      where: { id: episodeId },
      data: { currentVersionId: null },
    });
    await db.episodeVersion.deleteMany({ where: { episodeId } });
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
    expect(await identity(first.files[0].target)).toBeUndefined();
    expect(await identity(first.files[1].target)).toBeUndefined();
    expect(await fs.readFile(second.files[0].target, 'utf8')).toBe(
      'content-second',
    );
    for (const asset of old)
      expect(await identity(asset.poolPath)).toBeDefined();
    await pool.unpublish(episodeId);
    expect(await current()).toBeNull();
    expect(await identity(second.files[0].target)).toBeUndefined();
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(2);
    const assets = await db.mediaAsset.findMany({
      where: { poolPath: { startsWith: root } },
    });
    expect(
      assets.every(
        (asset) =>
          asset.jellyfinMode === null && asset.downloadMode === 'hardlink',
      ),
    ).toBe(true);
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
    expect(await fs.readFile(first.files[0].target, 'utf8')).toBe(
      'content-first',
    );
    active = false;
    await expect(pool.publish(b, context())).rejects.toBeInstanceOf(
      ExecutionStopped,
    );
    expect(await current()).toBe(a);
  });
  it('切换完成、数据库提交失败时恢复旧视频与字幕', async () => {
    const first = await input('first');
    const a = await pool.register(first);
    await pool.publish(a, context());
    const b = await pool.register(await input('second', 'mp4', false));
    const ctx = context();
    ctx.transaction = async () => {
      throw new Error('commit failure');
    };
    await expect(pool.publish(b, ctx)).rejects.toThrow('commit failure');
    expect(await current()).toBe(a);
    expect(await fs.readFile(first.files[0].target, 'utf8')).toBe(
      'content-first',
    );
    expect(await fs.readFile(first.files[1].target, 'utf8')).toBe(
      'subtitle-first',
    );
    expect(await db.mediaPublication.count()).toBe(0);
  });
  it.each([false, true])(
    '重启恢复 durable journal，committed=%s',
    async (committed) => {
      const first = await input('first', 'mkv', false);
      const a = await pool.register(first);
      await pool.publish(a, context());
      const journal = await preparePublication(
        [
          {
            target: first.files[0].target,
            identity: (await identity(first.files[0].target))!,
          },
        ],
        [],
        false,
      );
      await db.mediaPublication.create({
        data: {
          episodeId,
          journal: JSON.parse(JSON.stringify(journal)),
          committed,
        },
      });
      await applyPublication(journal);
      if (committed) {
        await db.episode.update({
          where: { id: episodeId },
          data: { currentVersionId: null },
        });
        await db.mediaAsset.updateMany({
          where: { jellyfinPath: first.files[0].target },
          data: {
            jellyfinPath: null,
            jellyfinMode: null,
            jellyfinIdentity: Prisma.DbNull,
          },
        });
      }
      const restart = new MediaPool(db, {
        root: path.join(root, 'pool'),
        painfullyAcceptCrossDeviceCopy: false,
      });
      await restart.initialize();
      await restart.initialize();
      expect(!!(await identity(first.files[0].target))).toBe(!committed);
      expect(await db.mediaPublication.count()).toBe(0);
    },
  );
  it('未登记字幕阻止替换，原文件保持不动', async () => {
    const first = await input('first', 'mkv', false);
    const a = await pool.register(first);
    await pool.publish(a, context());
    await fs.writeFile(path.join(root, 'library', 'Episode.zh.srt'), 'unknown');
    const b = await pool.register(await input('second', 'mp4', false));
    await expect(pool.publish(b, context())).rejects.toThrow('未登记字幕');
    expect(await current()).toBe(a);
  });
  it('历史回填验证清单 hash，保留 Jellyfin ID，重复运行不增长版本', async () => {
    const legacy = await input('legacy', 'mkv', false);
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const entry = {
      episodeId,
      jellyfinEpisodeId: 'legacy-item',
      files: [await inspectBackfillFile(legacy.files[0].source, 'video')],
    };
    await applyBackfill(db, pool, [entry]);
    await applyBackfill(db, pool, [entry]);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    expect(
      (await db.episode.findUnique({ where: { id: episodeId } }))!
        .jellyfinEpisodeId,
    ).toBe('legacy-item');
    const asset = await db.mediaAsset.findUnique({
      where: { hash: entry.files[0].hash },
    });
    expect(asset!.downloadPath).toBeNull();
    expect(asset!.jellyfinMode).toBe('hardlink');
    await fs.writeFile(legacy.files[0].source, 'changed');
    await expect(applyBackfill(db, pool, [entry])).rejects.toThrow(
      '内容已变化',
    );
  });
  it('并发登记分配不同版本号；不同源路径相同内容拒绝隐式多链接', async () => {
    const first = await input('first', 'mkv', false);
    const second = await input('second', 'mp4', false);
    const ids = await Promise.all([
      pool.register(first),
      pool.register(second),
    ]);
    expect(new Set(ids).size).toBe(2);
    expect(
      (
        await db.episodeVersion.findMany({
          where: { episodeId },
          orderBy: { number: 'asc' },
        })
      ).map((v) => v.number),
    ).toEqual([1, 2]);
    await fs.copyFile(first.files[0].source, second.files[0].source);
    await expect(
      pool.register({ ...second, operationKey: 'third' }),
    ).rejects.toThrow('其他下载目录位置');
  });
  it('回填登记后失败，修改清单可以采用新文件集合；顺序不改变幂等键', async () => {
    const legacy = await input('legacy');
    await db.episode.update({
      where: { id: episodeId },
      data: { jellyfinEpisodeId: 'legacy-item' },
    });
    const entry = {
      episodeId,
      jellyfinEpisodeId: 'legacy-item',
      files: await Promise.all(
        legacy.files.map((file) => inspectBackfillFile(file.source, file.role)),
      ),
    };
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
    expect(adopted!.number).toBe(2);
    expect(adopted!.files.map((file) => file.targetPath)).toEqual([
      entry.files[0].path,
    ]);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(2);
  });
  it('删除含历史版本的季度，撤下目标并保留池原件和下载源', async () => {
    const first = await input('first');
    await pool.publish(await pool.register(first), context());
    const second = await input('second', 'mp4', false);
    await pool.publish(await pool.register(second), context());
    const remove = jest.fn(async () => {
      expect(await current()).toBeNull();
      expect(await identity(second.files[0].target)).toBeUndefined();
    });
    await pool.deleteSeason(seasonId, remove);
    expect(remove).toHaveBeenCalledTimes(1);
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
  it('删除季度的文件清理失败保留版本记录，重试可以完成', async () => {
    const first = await input('first');
    await pool.publish(await pool.register(first), context());
    await expect(
      pool.deleteSeason(seasonId, async () => {
        const remove = jest
          .spyOn(fs, 'rm')
          .mockRejectedValueOnce(
            Object.assign(new Error('Permission denied'), { code: 'EACCES' }),
          );
        try {
          await removeDirectoryIdempotent(path.join(root, 'library'));
        } finally {
          remove.mockRestore();
        }
      }),
    ).rejects.toThrow('Permission denied');
    expect(await current()).toBeNull();
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    await pool.deleteSeason(seasonId, async () => {
      await removeDirectoryIdempotent(path.join(root, 'library'));
    });
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
    await expect(pool.deleteSeason(seasonId, remove)).rejects.toThrow(
      '先取消任务',
    );
    expect(remove).not.toHaveBeenCalled();
    expect(await current()).toBe(version);
    expect(await fs.readFile(first.files[0].target, 'utf8')).toBe(
      'content-first',
    );
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
        sourcePath: selected.files[0].source,
        importPath: selected.files[0].source,
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
    await fs.unlink(selected.files[0].source);
    expect(await atom.recover(task.id, state.input, ctx)).toEqual(result);
    expect(await db.episodeVersion.count({ where: { episodeId } })).toBe(1);
    expect(await fs.readFile(result.filePath!, 'utf8')).toBe('content-atom');
  });
});
