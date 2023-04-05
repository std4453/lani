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
import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class SeasonEmitService {
  constructor(
    private s3: S3Service,
    private seasonJellyfin: SeasonJellyfinService,
    private prisma: PrismaService,
  ) {}

  async writeSeasonMetadata(season: SeasonWithFolderAndImages) {
    console.log(`writing metadata for season '${season.title}'`);

    const oldTitle = season.lastWriteTitle;
    const renamed = oldTitle !== null && oldTitle !== season.title;
    if (renamed) {
      console.log(
        `title changed from '${oldTitle}' to '${season.title}', renaming folder...`,
      );
      await this.renameFolder(season);
    }

    // 如果重命名了，自动视为已修改
    let modified = renamed;
    // ||=会短路，不能用
    if (await this.emitNfo(season)) {
      modified = true;
    }
    if (await this.emitImages(season)) {
      modified = true;
    }

    if (modified) {
      console.log(
        `files modified, refreshing Jellyfin for season '${season.title}'`,
      );
      if (renamed) {
        await this.seasonJellyfin.refreshAfterFolderRename(season);
      } else {
        await this.seasonJellyfin.refreshAfterWriteToDisk(season);
      }

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
      console.log(`files unchanged for season '${season.title}'`);
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
    return await writeXMLFileIdempotent(
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
    await Promise.all(
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
      }),
    );
    return modified;
  }

  async deleteSeasonFiles(season: SeasonWithJellyfinFolder) {
    const { jellyfinFolder, title } = season;
    const seasonRoot = mapPath(
      config.jellyfin.pathMapping,
      jellyfinFolder.location,
    );
    const folderPath = path.join(seasonRoot, title);
    await removeDirectoryIdempotent(folderPath);
    await this.seasonJellyfin.refreshAfterDelete(season);
  }
}
