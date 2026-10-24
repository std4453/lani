import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { AtomContext } from '@/task/atom';
import { lockEpisode } from '@/task/atoms/publication';
import { FileIdentity } from '@lani/workflow';
import path from 'path';
import fs from 'fs/promises';
import { companions, digest, identity, importToPool, sameFile } from './files';
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
  files: Array<{ source: string; target: string; role: 'video' | 'subtitle' }>;
}
const json = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value));

/** 当前只支持单 API 实例；串行保护固定外部位置，同时把可恢复状态持久化。 */
export class MediaPool {
  private pending: Promise<unknown> = Promise.resolve();
  constructor(
    private db: PrismaClient,
    private settings: { root: string; painfullyAcceptCrossDeviceCopy: boolean },
  ) {}

  private exclusive<T>(run: () => Promise<T>): Promise<T> {
    const next = this.pending.then(run, run);
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

  register(input: VersionInput, context?: AtomContext) {
    return this.exclusive(async () => {
      await this.recover(input.episodeId);
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
      if (
        new Set(input.files.map((file) => path.resolve(file.target))).size !==
        input.files.length
      )
        throw new Error('媒体目标路径重复');
      const imported: Array<
        VersionInput['files'][number] & {
          asset: Awaited<ReturnType<typeof importToPool>>;
        }
      > = [];
      for (const file of input.files) {
        await context?.assertActive();
        if (!path.isAbsolute(file.target))
          throw new Error('媒体目标必须是绝对路径');
        if (
          path
            .resolve(file.target)
            .startsWith(`${this.settings.root}${path.sep}`)
        )
          throw new Error('媒体目标不能位于媒体池内');
        imported.push({
          ...file,
          target: path.resolve(file.target),
          asset: await importToPool(
            this.settings.root,
            file.source,
            this.settings.painfullyAcceptCrossDeviceCopy,
          ),
        });
      }
      if (
        new Set(imported.map((file) => file.asset.hash)).size !==
        imported.length
      )
        throw new Error('同一媒体文件不支持写入多个目标');
      const commit = async (tx: Prisma.TransactionClient) => {
        await lockEpisode(tx, input.episodeId);
        const duplicate = await tx.episodeVersion.findUnique({
          rejectOnNotFound: false,
          where: { operationKey: input.operationKey },
        });
        if (duplicate) return duplicate.id;
        for (const { asset } of imported) {
          const saved = await tx.mediaAsset.findUnique({
            rejectOnNotFound: false,
            where: { hash: asset.hash },
          });
          if (
            saved &&
            (saved.poolPath !== asset.poolPath ||
              !sameFile(
                saved.poolIdentity as unknown as FileIdentity,
                asset.poolIdentity,
              ))
          )
            throw new Error('媒体池文件身份与登记不一致');
          if (
            input.source !== 'unknown' &&
            saved?.downloadPath &&
            saved.downloadPath !== asset.source
          )
            throw new Error(
              '同一媒体文件已有其他下载目录位置，不支持多个外部目标',
            );
          const download =
            input.source === 'unknown'
              ? {}
              : {
                  downloadPath: asset.source,
                  downloadMode: asset.mode,
                  downloadIdentity: json(asset.sourceIdentity),
                };
          await tx.mediaAsset.upsert({
            where: { hash: asset.hash },
            create: {
              hash: asset.hash,
              size: asset.size,
              poolPath: asset.poolPath,
              poolIdentity: json(asset.poolIdentity),
              ...download,
            },
            update: download,
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
              create: imported.map(({ asset, target, role }) => ({
                assetHash: asset.hash,
                targetPath: target,
                role,
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
    return this.register({ ...input, source: 'unknown' }).then((versionId) =>
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
          current: Awaited<ReturnType<typeof digest>>;
          mode: string;
        }> = [];
        for (const file of version.files) {
          const current = await digest(file.targetPath);
          if (current.hash !== file.assetHash)
            throw new Error('历史媒体内容与媒体池不一致');
          if (
            file.asset.jellyfinPath &&
            file.asset.jellyfinPath !== file.targetPath
          )
            throw new Error('同一媒体文件已有其他播放器目标');
          const pool = await identity(file.asset.poolPath);
          files.push({
            file,
            current,
            mode:
              pool?.dev === current.identity.dev &&
              pool?.ino === current.identity.ino
                ? 'hardlink'
                : 'copy',
          });
        }
        await this.db.$transaction(async (tx) => {
          await lockEpisode(tx, input.episodeId);
          for (const { file, current, mode } of files)
            await tx.mediaAsset.update({
              where: { hash: file.assetHash },
              data: {
                jellyfinPath: file.targetPath,
                jellyfinMode: mode,
                jellyfinIdentity: json(current.identity),
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
      include: { files: { include: { asset: true } } },
    });
    if (!version) throw new Error('媒体版本不存在');
    return version;
  }

  publish(versionId: number, context: AtomContext) {
    return this.exclusive(async () => {
      const version = await this.version(versionId);
      await this.switchVersion(version.episodeId, versionId, context);
      return version.files.find((file) => file.role === 'video')!.targetPath;
    });
  }

  unpublish(episodeId: number, context?: AtomContext) {
    return this.exclusive(() => this.switchVersion(episodeId, null, context));
  }

  /** 删除季度沿用可恢复的撤下流程，原件与下载源仍保留。 */
  deleteSeason(seasonId: number, deleteFiles: () => Promise<void>) {
    return this.exclusive(async () => {
      const busy = await this.db.$queryRaw<{ id: number }[]>`
        SELECT t.id FROM download_jobs t
        WHERE t.workflow->>'status' IN ('running', 'cancelling', 'failed')
          AND (EXISTS (SELECT 1 FROM episodes e
            WHERE e.id=t.episode_id AND e.season_id=${seasonId})
            OR EXISTS (SELECT 1 FROM task_episodes te JOIN episodes e ON e.id=te.episode_id
              WHERE te.task_id=t.id AND e.season_id=${seasonId}))
        LIMIT 1`;
      if (busy.length)
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
            previous.assetHash === file.assetHash &&
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
      if ((await digest(file.asset.poolPath)).hash !== file.assetHash)
        throw new Error('媒体池文件内容校验失败');
    }
    const journal = await preparePublication(
      oldFiles.map((file) => ({
        target: file.targetPath,
        identity: file.asset.jellyfinIdentity as unknown as FileIdentity,
      })),
      (next?.files ?? []).map((file) => ({
        target: file.targetPath,
        source: file.asset.poolPath,
        hash: file.assetHash,
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
        for (const file of oldFiles)
          await tx.mediaAsset.update({
            where: { hash: file.assetHash },
            data: {
              jellyfinPath: null,
              jellyfinMode: null,
              jellyfinIdentity: Prisma.DbNull,
            },
          });
        for (const file of next?.files ?? []) {
          const prepared = journal.files.find(
            (item) => item.target === file.targetPath,
          )!;
          await tx.mediaAsset.update({
            where: { hash: file.assetHash },
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
  constructor(prisma: PrismaService) {
    super(prisma, config.mediaPool);
  }
  async onModuleInit() {
    if (config.mediaPool.painfullyAcceptCrossDeviceCopy)
      new Logger(MediaPoolService.name).warn(
        'Cross-device media copy enabled: slow copies and loss of cross-device atomicity are explicitly accepted.',
      );
    await this.initialize();
  }
}
