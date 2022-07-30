import config from '@/config';
import { Image, JellyfinFolder, Season } from '@lani/db';
import { resolveChroot } from '@lani/framework';
import { ConflictException, Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs/promises';
import xml2js from 'xml2js';
import { ensureXMLRoot, mergeXMLNode } from '@/utils/xml';
import { S3Service } from '@/common/s3.service';
import md5 from 'md5';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { MetadataRefreshMode } from '@/api/jellyfin';
import { PrismaService } from '@/common/prisma.service';

export type SeasonForWriteMetadata = Season & {
  jellyfinFolder: JellyfinFolder | null;
  bannerImage: Image | null;
  fanartImage: Image | null;
  posterImage: Image | null;
};

export type SeasonForSyncJellyfinSeriesId = Season & {
  jellyfinFolder: JellyfinFolder | null;
};

@Injectable()
export class SeasonEmitService {
  constructor(private s3: S3Service, private prisma: PrismaService) {}

  private readonly builder = new xml2js.Builder();
  private readonly parser = new xml2js.Parser();

  async writeSeasonMetadata({
    title,
    description,
    tags,
    tvdbId,
    bangumiId,
    id,
    yearAndSemester,
    jellyfinFolder,
    bannerImage,
    fanartImage,
    posterImage,
    jellyfinId,
  }: SeasonForWriteMetadata) {
    const seasonRoot = jellyfinFolder?.location;
    if (!seasonRoot) {
      throw new ConflictException('seasonRoot not set');
    }
    console.log(`writing metadata for season '${title}'`);
    const nfoPath = resolveChroot(
      path.join(config.lani.mediaRoot, seasonRoot, title, 'tvshow.nfo'),
    );
    let xmlObj: any = {};
    await fs.mkdir(path.dirname(nfoPath), { recursive: true });
    let modified = false;
    let currentContent = '';
    try {
      await fs.stat(nfoPath);
      currentContent = await fs.readFile(nfoPath, 'utf8');
      xmlObj = await this.parser.parseStringPromise(currentContent);
    } catch (error) {
      // 若文件不存在，xml格式有问题，无视报错，因为之后会覆盖它
      // 如果是没有读权限，或是目录，之后写入时肯定会报错，现在也可以无视
    }
    ensureXMLRoot(xmlObj, 'tvshow');
    // https://kodi.wiki/view/NFO_files/TV_shows
    mergeXMLNode(
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
      xmlObj.tvshow,
    );
    const nfoContent = this.builder.buildObject(xmlObj);
    if (currentContent !== nfoContent) {
      await fs.writeFile(nfoPath, nfoContent, 'utf-8');
      modified = true;
    }
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
        const newFileHash = md5(content);
        const filePath = resolveChroot(
          path.join(config.lani.mediaRoot, seasonRoot, title, `${type}${ext}`),
        );
        let currentFileHash = '';
        try {
          const currentFileContent = await fs.readFile(filePath);
          currentFileHash = md5(currentFileContent);
        } catch (error) {
          // 无论文件有没有问题，我们这里只是为了判断hash，因此忽略错误
        }
        console.log(currentFileHash, newFileHash);
        if (currentFileHash !== newFileHash) {
          await fs.writeFile(filePath, content);
          modified = true;
        }
      }),
    );
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
          itemId: jellyfinFolder.jellyfinId,
          recursive: true,
        });
      }
    }
  }

  async syncJellyfinSeriesId({
    id: seasonId,
    jellyfinId,
    title,
    jellyfinFolder,
  }: SeasonForSyncJellyfinSeriesId) {
    // TODO: 之后把folder改成non null就可以删掉了
    if (!jellyfinFolder) {
      return false;
    }
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
