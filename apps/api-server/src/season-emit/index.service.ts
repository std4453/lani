import { MetadataRefreshMode } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';
import { S3Service } from '@/common/s3.service';
import config from '@/config';
import {
  writeFileIdempotent,
  writeXMLFileIdempotent,
} from '@/utils/idempotency';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { Image, JellyfinFolder, Season } from '@lani/db';
import { resolveChroot } from '@lani/framework';
import { Injectable } from '@nestjs/common';
import path from 'path';

export type SeasonForWriteMetadata = Season & {
  jellyfinFolder: JellyfinFolder;
  bannerImage: Image | null;
  fanartImage: Image | null;
  posterImage: Image | null;
};

export type SeasonForSyncJellyfinSeriesId = Season & {
  jellyfinFolder: JellyfinFolder;
};

@Injectable()
export class SeasonEmitService {
  constructor(private s3: S3Service, private prisma: PrismaService) {}

  async writeSeasonMetadata(season: SeasonForWriteMetadata) {
    const {
      title,
      jellyfinFolder: { jellyfinId: folderJellyfinId },
      jellyfinId,
    } = season;
    console.log(`writing metadata for season '${title}'`);

    let modified = false;
    modified ||= await this.emitNfo(season);
    modified ||= await this.emitImages(season);

    if (modified) {
      if (jellyfinId) {
        // TODO: 通过mq触发？
        await JellyfinHelp.refreshItem({
          itemId: jellyfinId,
          metadataRefreshMode: MetadataRefreshMode.DEFAULT,
          imageRefreshMode: MetadataRefreshMode.DEFAULT,
        });
      } else {
        await JellyfinHelp.refreshItem({
          itemId: folderJellyfinId,
          recursive: true,
        });
      }
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
  }: SeasonForWriteMetadata) {
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
  }: SeasonForWriteMetadata) {
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
        const { cosPath } = image;
        if (!cosPath) {
          console.warn('cosPath not set');
          return;
        }
        const ext = cosPath.substring(cosPath.lastIndexOf('.'));
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
        const filePath = resolveChroot(
          path.join(config.lani.mediaRoot, seasonRoot, title, `${type}${ext}`),
        );
        modified ||= await writeFileIdempotent(filePath, content);
      }),
    );
    return modified;
  }

  async syncJellyfinSeriesId({
    id: seasonId,
    jellyfinId,
    title,
    jellyfinFolder,
  }: SeasonForSyncJellyfinSeriesId) {
    const items = await JellyfinHelp.getItemsByUserId({
      userId: config.jellyfin.dummyUserId,
      searchTerm: title,
      limit: 10,
      parentId: jellyfinFolder.jellyfinId,
      recursive: true,
      includeItemTypes: ['Series'],
    });
    const id = (items.Items ?? []).find((item) => item.Name === title)?.Id;
    if (!id) {
      return false;
    }
    if (id === jellyfinId) {
      return true;
    }
    await this.prisma.season.update({
      where: { id: seasonId },
      data: {
        jellyfinId: id,
      },
    });
    return true;
  }
}
