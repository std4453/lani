import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@lani/db';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { lockEpisode } from '@/common/episode-lock';
import { FileIdentity } from '@lani/workflow';
import path from 'path';
import fs from 'fs/promises';
import {
  identity,
  importToPool,
  sameFile,
  writeRecord,
  verifyTransfer,
} from './files';
import { createHash, randomUUID } from 'crypto';
import { mediaTarget, relativeMediaPath, seasonMediaRoot } from './paths';
import { WriteGate, MediaOperations } from '@/application-state/write-gate';
import { executePublication, finishPublication } from './publication-files';
import { LinkMode } from './files';

export interface RegistrationContext {
  assertActive(): Promise<void>;
  transaction<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T>;
}
export interface PublicationContext {
  assertActive(): Promise<void>;
  beforeFiles(
    files: Array<{ targetPath: string; role: string }>,
  ): Promise<void>;
  commit(
    write: (tx: Prisma.TransactionClient) => Promise<void>,
    video: string,
  ): Promise<void>;
}
export interface VersionInput {
  episodeId: number;
  registrationKey: string;
  mode: 'import' | 'backfill';
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
  constructor(
    private db: PrismaClient,
    private settings: { root: string; painfullyAcceptCrossDeviceCopy: boolean },
    private guard: () => void,
    private operations: MediaOperations,
  ) {}

  private exclusive<T>(run: () => Promise<T>): Promise<T> {
    return this.operations.run(run);
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
  }

  /** 创建即完整且不可变；准备不取得发布权，也不恢复其他任务的发布现场。 */
  register(
    input: VersionInput,
    context?: RegistrationContext,
    backfill = false,
  ) {
    if (!backfill) this.guard();
    return this.exclusive(async () => {
      const existing = await this.db.episodeVersion.findUnique({
        rejectOnNotFound: false,
        where: { registrationKey: input.registrationKey },
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
        createHash('sha256').update(input.registrationKey).digest('hex') +
          '.json',
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
            rejectOnNotFound: false,
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
              ...(input.mode === 'backfill'
                ? {}
                : {
                    downloadPath: asset.source,
                    downloadMode: asset.mode,
                    downloadIdentity: json(asset.sourceIdentity),
                  }),
            },
          });
        }
        const version = await tx.episodeVersion.create({
          data: {
            episodeId: input.episodeId,
            registrationKey: input.registrationKey,
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
        ? context.transaction(commit)
        : this.db.$transaction(commit);
    });
  }

  /** 历史回填只登记已存在的目标，不改名、不删除、也不猜测下载来源。 */
  adopt(input: VersionInput) {
    return this.register({ ...input, mode: 'backfill' }, undefined, true).then(
      (versionId) =>
        this.exclusive(async () => {
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

  /** 文件操作完成后，由调用方在同一短事务提交版本与业务检查点。 */
  publish(versionId: number, context: PublicationContext) {
    this.guard();
    return this.exclusive(async () => {
      await context.assertActive();
      const next = await this.version(versionId);
      const episode = next.episode;
      const old =
        episode.currentVersionId === versionId
          ? next
          : episode.currentVersionId
          ? await this.version(episode.currentVersionId)
          : null;
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
      for (const file of next.files) {
        if (
          file.asset.jellyfinPath &&
          !oldFiles.some(
            (old) =>
              old.assetId === file.assetId &&
              old.targetPath === file.asset.jellyfinPath,
          )
        )
          throw new Error('同一媒体文件已有其他播放器目标');
      }
      await context.beforeFiles([...oldFiles, ...next.files]);
      const sources = next.files.map((file) => ({
        target: file.targetPath,
        source: file.asset.poolPath,
        assetId: file.assetId,
        identity: file.asset.poolIdentity as unknown as FileIdentity,
      }));
      const published = await executePublication(
        oldFiles.map((file) => ({
          target: file.targetPath,
          assetId: file.assetId,
          identity: file.asset.jellyfinIdentity as unknown as FileIdentity,
          mode: file.asset.jellyfinMode as LinkMode,
        })),
        sources,
        next.registrationKey,
        this.settings.painfullyAcceptCrossDeviceCopy,
      );
      const video = next.files.find(
        (file) => file.role === 'video',
      )!.targetPath;
      await context.commit(async (tx) => {
        await lockEpisode(tx, next.episodeId);
        const current = await tx.episode.findUnique({
          where: { id: next.episodeId },
        });
        if (current?.currentVersionId !== episode.currentVersionId)
          throw new Error('剧集当前版本已变化');
        // 提交前重新确认文件身份，事务只包含短查询与 stat。
        for (const file of published)
          if (!sameFile(file.identity, await identity(file.target)))
            throw new Error('提交前媒体目标发生变化');
        if (episode.currentVersionId !== versionId) {
          const retained = new Set(
            oldFiles
              .filter((file) =>
                next.files.some(
                  (item) =>
                    item.assetId === file.assetId &&
                    item.targetPath === file.targetPath,
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
          for (const file of published.filter(
            (file) => !retained.has(file.assetId),
          ))
            await tx.mediaAsset.update({
              where: { id: file.assetId },
              data: {
                jellyfinPath: file.target,
                jellyfinMode: file.mode,
                jellyfinIdentity: json(file.identity),
              },
            });
          await tx.episode.update({
            where: { id: next.episodeId },
            data: {
              currentVersionId: versionId,
              jellyfinEpisodeId: null,
            },
          });
        }
      }, video);
      await finishPublication(sources, next.registrationKey);
      return video;
    });
  }

  /** 只迁移实际位置；版本的文件集合与相对布局保持不变。 */
  async relocatePublished(
    tx: Prisma.TransactionClient,
    oldPath: string,
    newPath: string,
  ) {
    const assets = await tx.mediaAsset.findMany({
      where: { jellyfinPath: { startsWith: oldPath + path.sep } },
    });
    for (const asset of assets) {
      const target = path.join(
        newPath,
        path.relative(oldPath, asset.jellyfinPath!),
      );
      if (
        !sameFile(
          await identity(target),
          asset.jellyfinIdentity as unknown as FileIdentity,
        )
      )
        throw new Error('季度改名后的媒体身份不一致');
      await tx.mediaAsset.update({
        where: { id: asset.id },
        data: { jellyfinPath: target },
      });
    }
  }
}

@Injectable()
export class MediaPoolService extends MediaPool implements OnModuleInit {
  constructor(
    prisma: PrismaService,
    state: WriteGate,
    operations: MediaOperations,
  ) {
    super(prisma, config.mediaPool, () => state.assertReady(), operations);
  }
  async onModuleInit() {
    if (config.mediaPool.painfullyAcceptCrossDeviceCopy)
      new Logger(MediaPoolService.name).warn(
        'Cross-device media copy enabled: slow copies and loss of cross-device atomicity are explicitly accepted.',
      );
    // 初始化和恢复由启动预检通过后的受管理回填流程执行。
  }
}
