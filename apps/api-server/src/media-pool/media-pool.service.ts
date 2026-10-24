import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AtomContext } from '@/task/atom';
import { lockEpisode } from '@/task/atoms/publication';
import { FileIdentity } from '@lani/workflow';
import path from 'path';
import fs from 'fs/promises';
import {
  companions,
  identity,
  importToPool,
  sameFile,
  writeRecord,
  verifyTransfer,
} from './files';
import { createHash, randomUUID } from 'crypto';
import { mediaTarget, relativeMediaPath, seasonMediaRoot } from './paths';
import { moveSeasonDirectory, recoverDirectoryMoves } from './directory-move';
import { MediaWriteState } from './write-state';
import { activeTaskWhere } from '@/task/atoms/publication';
import {
  applyPublication,
  cleanupPublication,
  preparePublication,
  PublicationJournal,
  rollbackPublication,
} from './publication-files';

export interface VersionInput {
  episodeId: number;
  operationKey: string;
  source: 'download' | 'import' | 'unknown';
  files: Array<{
    source?: string;
    assetId?: string;
    target: string;
    role: 'video' | 'subtitle';
  }>;
}
const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value));

/** 当前只支持单 API 实例；串行保护固定外部位置，同时把可恢复状态持久化。 */
export class MediaPool {
  private pending: Promise<unknown> = Promise.resolve();
  constructor(
    private db: PrismaClient,
    private settings: { root: string; painfullyAcceptCrossDeviceCopy: boolean },
    private guard: () => void = () => undefined,
  ) {}

  private exclusive<T>(run: () => Promise<T>): Promise<T> {
    const resume = async () => {
      await recoverDirectoryMoves(this.db, this.settings.root);
      return run();
    };
    const next = this.pending.then(resume, resume);
    this.pending = next.catch(() => undefined);
    return next;
  }

  async initialize() {
    if (
      !path.isAbsolute(this.settings.root) ||
      path.resolve(this.settings.root) === path.parse(this.settings.root).root
    )
      throw new Error('mediaPool.root 必须是独立目录的绝对路径');
    this.settings.root = path.resolve(this.settings.root);
    await fs.mkdir(this.settings.root, { recursive: true });
    if ((await fs.realpath(this.settings.root)) !== this.settings.root)
      throw new Error('媒体池根目录不能经过符号链接');
    await recoverDirectoryMoves(this.db, this.settings.root);
    for (const row of await this.db.mediaPublication.findMany())
      await this.recover(row.episodeId);
  }

  private async recover(episodeId: number) {
    const operation = await this.db.mediaPublication.findUnique({
      rejectOnNotFound: false,
      where: { episodeId },
    });
    if (!operation) return;
    const journal = operation.journal as unknown as PublicationJournal;
    if (journal.version !== 1) throw new Error('不支持的媒体恢复记录');
    if (!operation.committed) await rollbackPublication(journal);
    await cleanupPublication(journal);
    await this.db.mediaPublication.delete({ where: { episodeId } });
  }

  recoverEpisode(episodeId: number) {
    return this.exclusive(() => this.recover(episodeId));
  }

  /** 创建即完整且不可变；准备不取得发布权，也不恢复其他任务的发布现场。 */
  register(input: VersionInput, context?: AtomContext, backfill = false) {
    if (!backfill) this.guard();
    return this.exclusive(async () => {
      const existing = await this.db.episodeVersion.findUnique({
        rejectOnNotFound: false,
        where: { operationKey: input.operationKey },
      });
      if (existing) {
        if (existing.episodeId !== input.episodeId)
          throw new Error('媒体版本操作标识冲突');
        return existing.id;
      }
      if (input.files.filter((file) => file.role === 'video').length !== 1)
        throw new Error('每个版本必须包含且只能包含一个视频');
      for (const file of input.files) {
        relativeMediaPath(file.target);
        if (!!file.source === !!file.assetId)
          throw new Error('文件必须指定导入源或已有 UUID');
      }
      if (
        new Set(input.files.map((file) => file.target)).size !==
        input.files.length
      )
        throw new Error('媒体目标路径重复');
      // 仅对操作标识编码，不读取或合并文件内容。记录独立 UUID 与源快照以续跑未完成准备。
      const directory = path.join(this.settings.root, 'preparations');
      await fs.mkdir(directory, { recursive: true });
      const filename = path.join(
        directory,
        createHash('sha256').update(input.operationKey).digest('hex') + '.json',
      );
      type Preparation = {
        input: VersionInput;
        files: Array<{ id: string; identity?: FileIdentity }>;
      };
      let preparation: Preparation;
      try {
        preparation = JSON.parse(await fs.readFile(filename, 'utf8'));
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        preparation = { input, files: [] };
        for (const file of input.files) {
          const sourceIdentity = file.source
            ? await identity(file.source)
            : undefined;
          if (file.source && !sourceIdentity)
            throw new Error('导入源文件不存在');
          preparation.files.push({
            id: file.assetId ?? randomUUID(),
            identity: sourceIdentity,
          });
        }
        await writeRecord(filename, preparation);
      }
      if (JSON.stringify(preparation.input) !== JSON.stringify(input))
        throw new Error('媒体准备操作内容已变化，请使用新的操作标识');
      const imported = [] as Array<{
        id: string;
        data?: Awaited<ReturnType<typeof importToPool>>;
      }>;
      for (const [index, file] of input.files.entries()) {
        await context?.assertActive();
        const record = preparation.files[index];
        if (file.assetId) {
          const asset = await this.db.mediaAsset.findUnique({
            where: { id: file.assetId },
          });
          if (
            !asset ||
            !sameFile(
              await identity(asset.poolPath),
              asset.poolIdentity as unknown as FileIdentity,
            )
          )
            throw new Error('已有媒体文件不存在或身份已变化');
          imported.push({ id: asset.id });
        } else {
          const data = await importToPool(
            this.settings.root,
            file.source!,
            this.settings.painfullyAcceptCrossDeviceCopy,
            record.id,
            record.identity,
          );
          imported.push({ id: data.id, data });
        }
      }
      if (new Set(imported.map((file) => file.id)).size !== imported.length)
        throw new Error('同一媒体文件不支持写入多个目标');
      const commit = async (tx: Prisma.TransactionClient) => {
        await lockEpisode(tx, input.episodeId);
        for (const { data: asset } of imported) {
          if (!asset) continue;
          await tx.mediaAsset.create({
            data: {
              id: asset.id,
              size: asset.size,
              poolPath: asset.poolPath,
              poolIdentity: json(asset.poolIdentity),
              ...(input.source === 'unknown'
                ? {}
                : {
                    downloadPath: asset.source,
                    downloadMode: asset.mode,
                    downloadIdentity: json(asset.sourceIdentity),
                  }),
            },
          });
        }
        const last = await tx.episodeVersion.findFirst({
          where: { episodeId: input.episodeId },
          orderBy: { number: 'desc' },
        });
        const version = await tx.episodeVersion.create({
          data: {
            episodeId: input.episodeId,
            number: (last?.number ?? 0) + 1,
            operationKey: input.operationKey,
            source: input.source,
            files: {
              create: input.files.map((file, index) => ({
                assetId: imported[index].id,
                targetPath: file.target,
                role: file.role,
              })),
            },
          },
        });
        return version.id;
      };
      return context
        ? context.transaction(({ tx }) => commit(tx))
        : this.db.$transaction(commit);
    });
  }

  /** 历史回填只登记已存在的目标，不改名、不删除、也不猜测下载来源。 */
  adopt(input: VersionInput) {
    return this.register({ ...input, source: 'unknown' }, undefined, true).then(
      (versionId) =>
        this.exclusive(async () => {
          await this.recover(input.episodeId);
          const version = await this.version(versionId);
          const episode = await this.db.episode.findUnique({
            rejectOnNotFound: false,
            where: { id: input.episodeId },
          });
          if (!episode) throw new Error('剧集不存在');
          if (episode.currentVersionId === versionId) return versionId;
          if (episode.currentVersionId)
            throw new Error('剧集已有当前版本，不能重复回填');
          const files: Array<{
            file: typeof version.files[number];
            current: FileIdentity;
            mode: string;
          }> = [];
          for (const file of version.files) {
            const current = await identity(file.targetPath);
            if (!current) throw new Error('历史媒体文件不存在');
            if (
              file.asset.jellyfinPath &&
              file.asset.jellyfinPath !== file.targetPath
            )
              throw new Error('同一媒体文件已有其他播放器目标');
            const pool = await identity(file.asset.poolPath);
            if (!pool) throw new Error('媒体池文件不存在');
            await verifyTransfer(
              file.asset.poolPath,
              file.targetPath,
              pool,
              pool.dev === current.dev && pool.ino === current.ino
                ? 'hardlink'
                : 'copy',
            );
            files.push({
              file,
              current,
              mode:
                pool?.dev === current.dev && pool?.ino === current.ino
                  ? 'hardlink'
                  : 'copy',
            });
          }
          await this.db.$transaction(async (tx) => {
            await lockEpisode(tx, input.episodeId);
            for (const { file, current, mode } of files)
              await tx.mediaAsset.update({
                where: { id: file.assetId },
                data: {
                  jellyfinPath: file.targetPath,
                  jellyfinMode: mode,
                  jellyfinIdentity: json(current),
                },
              });
            await tx.episode.update({
              where: { id: input.episodeId },
              data: { currentVersionId: versionId },
            });
          });
          return versionId;
        }),
    );
  }

  private async version(id: number) {
    const version = await this.db.episodeVersion.findUnique({
      rejectOnNotFound: false,
      where: { id },
      include: {
        files: { include: { asset: true } },
        episode: { include: { season: { include: { jellyfinFolder: true } } } },
      },
    });
    if (!version) throw new Error('媒体版本不存在');
    const root = seasonMediaRoot(version.episode.season);
    return {
      ...version,
      files: version.files.map((file) => ({
        ...file,
        targetPath: mediaTarget(root, file.targetPath),
      })),
    };
  }

  publish(versionId: number, context: AtomContext) {
    this.guard();
    return this.exclusive(async () => {
      const version = await this.version(versionId);
      await this.switchVersion(version.episodeId, versionId, context);
      return version.files.find((file) => file.role === 'video')!.targetPath;
    });
  }

  unpublish(episodeId: number, context?: AtomContext) {
    this.guard();
    return this.exclusive(() => this.switchVersion(episodeId, null, context));
  }

  /** 删除季度沿用可恢复的撤下流程，原件与下载源仍保留。 */
  deleteSeason(seasonId: number, deleteFiles: () => Promise<void>) {
    this.guard();
    return this.exclusive(async () => {
      const busy = await this.db.task.findFirst({
        where: {
          AND: [
            activeTaskWhere,
            {
              OR: [
                { episode: { seasonId } },
                { episodes: { some: { episode: { seasonId } } } },
              ],
            },
          ],
        },
        select: { id: true },
      });
      if (busy)
        throw new Error('季度仍有进行中或失败的任务，请先取消任务再删除');
      const episodes = await this.db.episode.findMany({ where: { seasonId } });
      for (const episode of episodes) {
        await this.recover(episode.id);
        if (episode.currentVersionId)
          await this.switchVersion(episode.id, null);
      }
      // 文件或刷新失败时保留版本记录，重新删除可继续完成。
      await deleteFiles();
      await this.db.$transaction(async (tx) => {
        for (const episode of episodes) await lockEpisode(tx, episode.id);
        await tx.episodeVersion.deleteMany({
          where: { episode: { seasonId } },
        });
        await tx.season.delete({ where: { id: seasonId } });
      });
    });
  }

  assertWritable() {
    this.guard();
  }

  renameSeason(
    seasonId: number,
    oldPath: string,
    newPath: string,
    directory: string,
  ) {
    this.guard();
    return this.exclusive(async () => {
      const busy = await this.db.task.findFirst({
        where: {
          AND: [
            activeTaskWhere,
            {
              OR: [
                { episode: { seasonId } },
                { episodes: { some: { episode: { seasonId } } } },
              ],
            },
          ],
        },
        select: { id: true },
      });
      if (busy)
        throw new Error('季度仍有进行中或失败的任务，请先处理任务再改名');
      for (const episode of await this.db.episode.findMany({
        where: { seasonId },
      }))
        await this.recover(episode.id);
      // exclusive 开始时可能刚恢复上次同一移动；无需再次移动。
      const season = await this.db.season.findUnique({
        where: { id: seasonId },
      });
      if (season?.lastWriteDirectory === directory) return;
      await moveSeasonDirectory(this.db, this.settings.root, {
        seasonId,
        oldPath,
        newPath,
        directory,
      });
    });
  }

  private async switchVersion(
    episodeId: number,
    versionId: number | null,
    context?: AtomContext,
  ) {
    await this.recover(episodeId);
    await context?.assertActive();
    const episode = await this.db.episode.findUnique({
      rejectOnNotFound: false,
      where: { id: episodeId },
    });
    if (!episode) throw new Error('剧集不存在');
    const old = episode.currentVersionId
      ? await this.version(episode.currentVersionId)
      : null;
    const next = versionId ? await this.version(versionId) : null;
    if (next && next.episodeId !== episodeId)
      throw new Error('媒体版本不属于此剧集');
    if (versionId === episode.currentVersionId) {
      for (const file of old?.files ?? []) {
        if (
          !sameFile(
            await identity(file.targetPath),
            file.asset.jellyfinIdentity as unknown as FileIdentity,
          )
        )
          throw new Error('已发布媒体已变化或丢失');
      }
      return;
    }
    if (!old && episode.jellyfinEpisodeId)
      throw new Error('已有媒体尚未登记，请先完成历史媒体回填');
    const oldFiles = old?.files ?? [];
    for (const file of oldFiles) {
      if (
        file.asset.jellyfinPath !== file.targetPath ||
        !file.asset.jellyfinIdentity
      )
        throw new Error('当前版本媒体关联不完整');
    }
    // 未登记的字幕不能因视频同名而无提示混用，也不能自动删除。
    for (const video of [...oldFiles, ...(next?.files ?? [])].filter(
      (file) => file.role === 'video',
    )) {
      const subtitles = await companions(video.targetPath).catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
      if (
        subtitles.some(
          (name) => !oldFiles.some((file) => file.targetPath === name),
        )
      )
        throw new Error('媒体目录存在未登记字幕，请确认归属后再替换');
    }
    for (const file of next?.files ?? []) {
      if (
        file.asset.jellyfinPath &&
        !oldFiles.some(
          (previous) =>
            previous.assetId === file.assetId &&
            previous.targetPath === file.asset.jellyfinPath,
        )
      )
        throw new Error('同一媒体文件已有其他播放器目标，不支持一集多写');
      if (
        !sameFile(
          await identity(file.asset.poolPath),
          file.asset.poolIdentity as unknown as FileIdentity,
        )
      )
        throw new Error('媒体池文件身份已变化');
    }
    const journal = await preparePublication(
      oldFiles.map((file) => ({
        target: file.targetPath,
        assetId: file.assetId,
        identity: file.asset.jellyfinIdentity as unknown as FileIdentity,
      })),
      (next?.files ?? []).map((file) => ({
        target: file.targetPath,
        source: file.asset.poolPath,
        assetId: file.assetId,
        identity: file.asset.poolIdentity as unknown as FileIdentity,
      })),
      this.settings.painfullyAcceptCrossDeviceCopy,
    );
    try {
      await this.db.mediaPublication.create({
        data: { episodeId, journal: json(journal) },
      });
    } catch (error) {
      // 创建结果未知时保留文件；恢复器按数据库记录决定后续行为。
      if (
        !(await this.db.mediaPublication.findUnique({
          rejectOnNotFound: false,
          where: { episodeId },
        }))
      )
        await cleanupPublication(journal);
      throw error;
    }
    try {
      await context?.assertActive();
      await applyPublication(journal);
      const commit = async (tx: Prisma.TransactionClient) => {
        await lockEpisode(tx, episodeId);
        const current = await tx.episode.findUnique({
          rejectOnNotFound: false,
          where: { id: episodeId },
        });
        if (current?.currentVersionId !== episode.currentVersionId)
          throw new Error('剧集当前版本已变化');
        const retained = new Set(
          (next?.files ?? [])
            .filter((file) =>
              oldFiles.some(
                (old) =>
                  old.assetId === file.assetId &&
                  old.targetPath === file.targetPath,
              ),
            )
            .map((file) => file.assetId),
        );
        for (const file of oldFiles.filter(
          (file) => !retained.has(file.assetId),
        ))
          await tx.mediaAsset.update({
            where: { id: file.assetId },
            data: {
              jellyfinPath: null,
              jellyfinMode: null,
              jellyfinIdentity: Prisma.DbNull,
            },
          });
        for (const file of next?.files ?? []) {
          if (retained.has(file.assetId)) continue;
          const prepared = journal.files.find(
            (item) => item.target === file.targetPath,
          )!;
          await tx.mediaAsset.update({
            where: { id: file.assetId },
            data: {
              jellyfinPath: file.targetPath,
              jellyfinMode: prepared.mode,
              jellyfinIdentity: json(prepared.next),
            },
          });
        }
        await tx.episode.update({
          where: { id: episodeId },
          data: { currentVersionId: versionId, jellyfinEpisodeId: null },
        });
        await tx.mediaPublication.update({
          where: { episodeId },
          data: { committed: true },
        });
      };
      if (context) await context.transaction(({ tx }) => commit(tx));
      else await this.db.$transaction(commit);
    } catch (error) {
      // 必须回读提交结果；数据库不可用时保留日志，避免把已提交版本误回滚。
      await this.recover(episodeId);
      throw error;
    }
    await this.recover(episodeId);
  }
}

@Injectable()
export class MediaPoolService extends MediaPool implements OnModuleInit {
  constructor(prisma: PrismaService, state: MediaWriteState) {
    super(prisma, config.mediaPool, () => state.assertReady());
  }
  async onModuleInit() {
    if (config.mediaPool.painfullyAcceptCrossDeviceCopy)
      new Logger(MediaPoolService.name).warn(
        'Cross-device media copy enabled: slow copies and loss of cross-device atomicity are explicitly accepted.',
      );
    // 初始化和恢复由启动预检通过后的受管理回填流程执行。
  }
}
