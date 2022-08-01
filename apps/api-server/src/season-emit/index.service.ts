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
import { resolveChroot } from '@lani/framework';
import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class SeasonEmitService {
  constructor(
    private s3: S3Service,
    private seasonJellyfin: SeasonJellyfinService,
  ) {}

  async writeSeasonMetadata(season: SeasonWithFolderAndImages) {
    console.log(`writing metadata for season '${season.title}'`);

    let modified = false;
    modified ||= await this.emitNfo(season);
    modified ||= await this.emitImages(season);

    if (modified) {
      console.log(
        `files modified, refreshing Jellyfin for season '${season.title}'`,
      );
      this.seasonJellyfin.refreshAfterUpdate(season);
    } else {
      console.log(`files unchanged for season '${season.title}'`);
    }
  }

  private async emitNfo({
    title,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
    jellyfinFolder: { location: seasonRoot },
  }: SeasonWithFolderAndImages) {
    const nfoPath = resolveChroot(
      path.join(config.lani.mediaRoot, seasonRoot, title, 'tvshow.nfo'),
    );
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
    jellyfinFolder: { location: seasonRoot },
  }: SeasonWithFolderAndImages) {
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
        const filePath = resolveChroot(
          path.join(config.lani.mediaRoot, seasonRoot, title, `${type}${ext}`),
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
      }),
    );
    return modified;
  }

  async deleteSeasonFiles(season: SeasonWithJellyfinFolder) {
    const { jellyfinFolder, title } = season;
    const folderPath = resolveChroot(
      path.join(config.lani.mediaRoot, jellyfinFolder.location, title),
    );
    await removeDirectoryIdempotent(folderPath);
    await this.seasonJellyfin.refreshAfterDelete(season);
  }
}
