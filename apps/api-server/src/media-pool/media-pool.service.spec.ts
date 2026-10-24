import { ImportFileAtom } from '@/task/atoms/import-file.atom';
import { removeDirectoryIdempotent } from '@/utils/idempotency';
import { TaskStore } from '@/task/task-store';
import { WorkflowRunner } from '@/task/workflow-runner';
import { requestCancellation, buildWorkflowSnapshot } from '@lani/workflow';
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
    return { episodeId, operationKey: key, source: 'download', files };
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
    await pool.unpublish(episodeId);
    expect(await current()).toBeNull();
    expect(
      await identity(path.join(root, 'library', second.files[0].target)),
    ).toBeUndefined();
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
    expect(
      await fs.readFile(
        path.join(root, 'library', first.files[0].target),
        'utf8',
      ),
    ).toBe('content-first');
    expect(
      await fs.readFile(
        path.join(root, 'library', first.files[1].target),
        'utf8',
      ),
    ).toBe('subtitle-first');
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
            target: path.join(root, 'library', first.files[0].target),
            assetId: 'old',
            identity: (await identity(
              path.join(root, 'library', first.files[0].target),
            ))!,
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
          where: {
            jellyfinPath: path.join(root, 'library', first.files[0].target),
          },
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
      expect(
        !!(await identity(path.join(root, 'library', first.files[0].target))),
      ).toBe(!committed);
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
  it('并发登记分配不同版本号；相同内容的独立导入保持不同 UUID', async () => {
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
    await fs.copyFile(first.files[0].source!, second.files[0].source!);
    await pool.register({ ...second, operationKey: 'third' });
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
    expect(adopted!.number).toBe(2);
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
    const remove = jest.fn(async () => {
      expect(await current()).toBeNull();
      expect(
        await identity(path.join(root, 'library', second.files[0].target)),
      ).toBeUndefined();
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
      operationKey: 'added-subtitle',
      source: 'import',
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
      pool.renameSeason(seasonId, oldPath, newPath, 'renamed'),
    ).rejects.toThrow('interrupted rename');
    transaction.mockRestore();
    await pool.renameSeason(seasonId, oldPath, newPath, 'renamed');
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
    await pool.deleteSeason(seasonId, () =>
      fs.rm(newPath, { recursive: true }),
    );
    expect(
      await db.mediaAsset.count({
        where: { poolPath: { startsWith: root }, jellyfinPath: { not: null } },
      }),
    ).toBe(0);
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
    const recover = jest.spyOn(pool as any, 'recover');
    await expect(atom.run(b.id, b.input, b.ctx)).rejects.toThrow(
      '其他任务正在发布',
    );
    expect(recover).not.toHaveBeenCalled();
    const versionB = b.ctx.checkpoint.mediaVersionId;
    expect(versionB).toBeDefined();
    expect(versionB).not.toBe(versionA);
    // 准备阶段的取消不能触碰 A 的恢复现场。
    await atom.cancel(b.id, b.input, b.ctx);
    expect(recover).not.toHaveBeenCalled();
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
