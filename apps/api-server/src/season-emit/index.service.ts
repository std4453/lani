import { WriteGate, MediaOperations } from '@/application-state/write-gate';
import { SeasonMediaService } from './media.service';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { SeasonJellyfinService } from '@/season-jellyfin/SeasonJellyfinService';
import {
  SeasonWithFolderAndImages,
  SeasonWithJellyfinFolder,
} from '@/types/entities';
import { getFileHash, writeXMLFileIdempotent } from '@/utils/idempotency';
import { mapPath } from '@/utils/path';
import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';
import xml2js from 'xml2js';
import { jellyfinNumber } from '@/utils/episode-number';
import {
  getSeasonDirectory,
  resolveSeasonPath,
  sanitizeSeasonDirectory,
} from '@/utils/season-directory';

@Injectable()
export class SeasonEmitService {
  private logger = new Logger(SeasonEmitService.name);

  constructor(
    private s3: S3Service,
    private seasonJellyfin: SeasonJellyfinService,
    private prisma: PrismaService,
    private media: SeasonMediaService,
    private gate: WriteGate,
    private operations: MediaOperations,
  ) {}

  async writeSeasonMetadata(season: SeasonWithFolderAndImages) {
    this.gate.assertReady();
    return this.operations.run(async () => {
      const current = await this.prisma.season.findUnique({
        where: { id: season.id },
        include: {
          jellyfinFolder: true,
          bannerImage: true,
          fanartImage: true,
          posterImage: true,
        },
      });
      if (!current) throw new Error('季度不存在');
      await this.writeMetadata(current);
    });
  }

  private async writeMetadata(season: SeasonWithFolderAndImages) {
    this.logger.log(
      `Writing metadata for season #${season.id} (${season.title})`,
    );

    const directory = sanitizeSeasonDirectory(season.title);
    const oldDirectory = getSeasonDirectory(season);
    // 先保存目标目录，让数据库唯一约束在任何文件操作之前检查冲突。
    await this.prisma.season.update({
      where: { id: season.id },
      data: { directory },
    });
    const renamed = oldDirectory !== directory;
    season = { ...season, directory };
    if (!renamed && !season.lastWriteTitle && !season.lastWriteDirectory) {
      const root = mapPath(
        config.jellyfin.pathMapping,
        season.jellyfinFolder.location,
      );
      const target = resolveSeasonPath(root, directory);
      let exists = false;
      try {
        await fs.lstat(target);
        exists = true;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      if (exists && !(await this.ownsDirectory(target, season.id))) {
        throw new Error('目标季度目录已存在，无法写入');
      }
    }
    if (renamed) {
      this.logger.verbose(
        `Season #${season.id} renamed (${oldDirectory} -> ${directory}), renaming folder...`,
      );
      const { newPath, oldPath } = await this.renameFolder(
        season,
        oldDirectory,
      );
      this.logger.verbose(
        `Folder of season #${season.id} rename success (${oldPath} -> ${newPath})`,
      );
    }

    // 文件移动成功即记录实际位置；后续 NFO、图片或刷新失败时可安全重试。
    await this.prisma.season.update({
      where: { id: season.id },
      data: {
        lastWriteDirectory: directory,
        ...(renamed ? { jellyfinId: '' } : {}),
      },
    });
    season = {
      ...season,
      lastWriteDirectory: directory,
      ...(renamed ? { jellyfinId: '' } : {}),
    };

    this.logger.verbose(
      `Writing .nfo file for season #${season.id} (${season.title})...`,
    );
    const { modified: nfoEmitted, nfoPath } = await this.emitNfo(season);
    if (nfoEmitted) {
      this.logger.verbose(
        `Write .nfo file for season #${season.id} (${season.title}) success, file written to ${nfoPath}`,
      );
    } else {
      this.logger.verbose(
        `Write .nfo file for season #${season.id} (${season.title}) skipped (no changes)`,
      );
    }

    this.logger.verbose(
      `Writing image files for season #${season.id} (${season.title})...`,
    );
    const {
      modified: imagesEmitted,
      banner,
      fanart,
      poster,
    } = await this.emitImages(season);
    if (imagesEmitted) {
      this.logger.verbose(
        `Write image files for season #${season.id} (${season.title}) success${
          banner ? `, banner -> ${banner}` : ''
        }${fanart ? `, fanart -> ${fanart}` : ''}${
          poster ? `, poster -> ${poster}` : ''
        }`,
      );
    } else {
      this.logger.verbose(
        `Write image files for season #${season.id} (${season.title}) skipped (no changes)`,
      );
    }

    // 显式同步始终刷新，保证上次文件写入成功但 Jellyfin 刷新失败后仍可重试。
    if (renamed) {
      await this.seasonJellyfin.refreshAfterFolderRename(season);
    } else {
      await this.seasonJellyfin.refreshAfterWriteToDisk(season);
    }
    await this.prisma.season.update({
      where: { id: season.id },
      data: {
        lastWriteToDisk: new Date(),
        lastWriteTitle: season.title,
        ...(renamed ? { jellyfinId: '' } : {}),
      },
    });
  }

  private async renameFolder(
    season: SeasonWithFolderAndImages,
    oldDirectory: string,
  ) {
    const root = mapPath(
      config.jellyfin.pathMapping,
      season.jellyfinFolder.location,
    );
    const oldPath = resolveSeasonPath(root, oldDirectory);
    const newPath = resolveSeasonPath(root, season.directory ?? '');
    await this.media.renameWithinOperation(
      season.id,
      oldPath,
      newPath,
      season.directory!,
    );
    return { oldPath, newPath };
  }

  private async ownsDirectory(directory: string, seasonId: number) {
    const ownsNfo = (node: any, id: number) =>
      [...(node?.uniqueid ?? []), ...(node?.uniqueId ?? [])].some(
        (value) =>
          value.$?.type?.toLowerCase() === 'lani' &&
          String(value._) === String(id),
      );
    try {
      const xml = await fs.readFile(path.join(directory, 'tvshow.nfo'), 'utf8');
      const { tvshow } = await xml2js.parseStringPromise(xml);
      return ownsNfo(tvshow, seasonId);
    } catch (error) {
      // 已有但归属不明、损坏或不可读的季度 NFO 不能被剧集证据覆盖。
      if (error.code !== 'ENOENT') return false;
    }

    // 手动导入和下载导入可能先于季度同步，只写了剧集 NFO。
    // 只认可当前季度的剧集在标准导入位置留下的 Lani ID。
    const episodes = await this.prisma.episode.findMany({
      where: { seasonId },
      select: { id: true, index: true, episodeType: true, episodeNumber: true },
    });
    for (const episode of episodes) {
      const { season, index } = jellyfinNumber(episode);
      const filename = path.join(
        directory,
        `Season ${season}`,
        `Episode - S${String(season).padStart(2, '0')}E${String(index).padStart(
          2,
          '0',
        )}.nfo`,
      );
      try {
        const xml = await fs.readFile(filename, 'utf8');
        const { episodedetails } = await xml2js.parseStringPromise(xml);
        if (ownsNfo(episodedetails, episode.id)) return true;
      } catch {
        // 缺失或无法解析的剧集 NFO 不构成归属证据。
      }
    }
    return false;
  }

  private async emitNfo({
    title,
    directory,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
    jellyfinFolder: { location: jellyfinFolderRoot },
  }: SeasonWithFolderAndImages) {
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);
    const nfoPath = path.join(
      resolveSeasonPath(seasonRoot, directory ?? ''),
      'tvshow.nfo',
    );
    // https://kodi.wiki/view/NFO_files/TV_shows
    const modified = await writeXMLFileIdempotent(
      nfoPath,
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        tag: tags,
        uniqueid: [
          {
            $: {
              type: 'lani',
              default: 'true',
            },
            _: id,
          },
          tvdbId
            ? {
                $: {
                  type: 'tvdb',
                },
                _: tvdbId,
              }
            : undefined,
          bangumiId
            ? {
                $: {
                  type: 'bangumi',
                },
                _: bangumiId,
              }
            : undefined,
        ].filter(Boolean),
        ...(yearAndSemester
          ? { year: [yearAndSemester.substring(0, 4)] }
          : undefined),
      },
      {
        rootType: 'tvshow',
        removeKeys: ['uniqueId'],
      },
    );
    return { modified, nfoPath };
  }

  private async emitImages({
    bannerImage,
    fanartImage,
    posterImage,
    directory,
    jellyfinFolder: { location: jellyfinFolderRoot },
  }: SeasonWithFolderAndImages) {
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);
    let modified = false;
    const [banner, fanart, poster] = await Promise.all(
      [
        { image: bannerImage, type: 'banner' },
        { image: fanartImage, type: 'fanart' },
        { image: posterImage, type: 'poster' },
      ].map(async ({ image, type }) => {
        if (!image) {
          return;
        }
        const { cosPath, hash } = image;
        const ext = cosPath.substring(cosPath.lastIndexOf('.'));
        const filePath = path.join(
          resolveSeasonPath(seasonRoot, directory ?? ''),
          `${type}${ext}`,
        );
        const currentHash = await getFileHash(filePath);

        if (hash && currentHash && currentHash === hash) {
          return;
        }

        const { Body: content } = await this.s3
          .getObject({
            Bucket: config.s3.bucket,
            Key: cosPath,
          })
          .promise();
        if (!content) {
          throw new Error('GetObject returns empty content');
        }
        if (!Buffer.isBuffer(content)) {
          throw new Error('GetObject returns non-buffer result');
        }

        await fs.writeFile(filePath, content);
        modified = true;
        return filePath;
      }),
    );
    return {
      banner,
      fanart,
      poster,
      modified,
    };
  }

  async deleteSeason(season: SeasonWithJellyfinFolder) {
    await this.media.delete(season.id, (current) =>
      this.seasonJellyfin.refreshAfterDelete(current),
    );
  }
}
