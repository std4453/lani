import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import { SeasonJellyfinService } from '@/season-jellyfin/SeasonJellyfinService';
import {
  SeasonWithFolderAndImages,
  SeasonWithJellyfinFolder,
} from '@/types/entities';
import {
  getFileHash,
  removeDirectoryIdempotent,
  writeXMLFileIdempotent,
} from '@/utils/idempotency';
import { mapPath } from '@/utils/path';
import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class SeasonEmitService {
  private logger = new Logger(SeasonEmitService.name);

  constructor(
    private s3: S3Service,
    private seasonJellyfin: SeasonJellyfinService,
    private prisma: PrismaService,
  ) {}

  async writeSeasonMetadata(season: SeasonWithFolderAndImages) {
    this.logger.log(
      `Writing metadata for season #${season.id} (${season.title})`,
    );

    const oldTitle = season.lastWriteTitle;
    const renamed = oldTitle !== null && oldTitle !== season.title;
    if (renamed) {
      this.logger.verbose(
        `Season #${season.id} renamed (${oldTitle} -> ${season.title}), renaming folder...`,
      );
      const { newPath, oldPath } = await this.renameFolder(season);
      this.logger.verbose(
        `Folder of season #${season.id} rename success (${oldPath} -> ${newPath})`,
      );
    }

    // 如果重命名了，自动视为已修改
    let modified = renamed;

    this.logger.verbose(
      `Writing .nfo file for season #${season.id} (${season.title})...`,
    );
    const { modified: nfoEmitted, nfoPath } = await this.emitNfo(season);
    if (nfoEmitted) {
      this.logger.verbose(
        `Write .nfo file for season #${season.id} (${season.title}) success, file written to ${nfoPath}`,
      );
      modified = true;
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
      modified = true;
    } else {
      this.logger.verbose(
        `Write image files for season #${season.id} (${season.title}) skipped (no changes)`,
      );
    }

    if (modified) {
      this.logger.log(
        `Season #${season.id} (${season.title}) files changed, refreshing Jellyfin...`,
      );
      if (renamed) {
        await this.seasonJellyfin.refreshAfterFolderRename(season);
      } else {
        await this.seasonJellyfin.refreshAfterWriteToDisk(season);
      }

      this.logger.verbose(
        `Updating last write status for season #${season.id} (${season.title}) in db...`,
      );
      await this.prisma.season.update({
        where: {
          id: season.id,
        },
        data: {
          lastWriteToDisk: new Date(),
          lastWriteTitle: season.title,
          ...(renamed
            ? {
                jellyfinId: '',
              }
            : undefined),
        },
      });
    } else {
      this.logger.log(
        `Season #${season.id} (${season.title}) unchanged, skipping Jellyfin refresh`,
      );
    }
  }

  private async renameFolder({
    lastWriteTitle: oldTitle,
    title: newTitle,
    jellyfinFolder: { location: jellyfinFolderRoot },
  }: SeasonWithFolderAndImages) {
    if (oldTitle === null) {
      throw new Error('oldTitle is null');
    }
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);
    const oldPath = path.join(seasonRoot, oldTitle);
    const newPath = path.join(seasonRoot, newTitle);
    // 目录已经存在时会报错，不会覆盖
    await fs.rename(oldPath, newPath);
    return { oldPath, newPath };
  }

  private async emitNfo({
    title,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
    jellyfinFolder: { location: jellyfinFolderRoot },
  }: SeasonWithFolderAndImages) {
    const seasonRoot = mapPath(config.jellyfin.pathMapping, jellyfinFolderRoot);
    const nfoPath = path.join(seasonRoot, title, 'tvshow.nfo');
    // https://kodi.wiki/view/NFO_files/TV_shows
    const modified = await writeXMLFileIdempotent(
      nfoPath,
      {
        title: [title],
        ...(description ? { plot: [description] } : undefined),
        tag: tags.length > 0 ? tags : undefined,
        uniqueId: [
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
      },
    );
    return { modified, nfoPath };
  }

  private async emitImages({
    bannerImage,
    fanartImage,
    posterImage,
    title,
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
        const filePath = path.join(seasonRoot, title, `${type}${ext}`);
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

  async deleteSeasonFiles(season: SeasonWithJellyfinFolder) {
    const { jellyfinFolder, title } = season;
    const seasonRoot = mapPath(
      config.jellyfin.pathMapping,
      jellyfinFolder.location,
    );
    const folderPath = path.join(seasonRoot, title);
    this.logger.log(
      `Deleting files for season #${season.id} (${season.title}), located under ${folderPath}`,
    );
    const deleted = await removeDirectoryIdempotent(folderPath);
    if (!deleted) {
      this.logger.warn(
        `Delete files for season #${season.id} (${season.title}) under ${folderPath} failed, perhaps files were already deleted?`,
      );
    }
    await this.seasonJellyfin.refreshAfterDelete(season);
  }
}
