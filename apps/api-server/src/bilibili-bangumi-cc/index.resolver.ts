import { MetadataRefreshMode } from '@/api/jellyfin';
import { BilibiliBangumiCCService } from '@/bilibili-bangumi-cc/index.service';
import { BilibiliProxyRegion } from '@/bilibili-bangumi-cc/types';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { JellyfinHelp } from '@/utils/JellyfinHelp';
import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { DownloadStatus } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

@Resolver()
export class BilibiliBangumiCCResolver {
  constructor(
    private service: BilibiliBangumiCCService,
    private prisma: PrismaService,
    private config: ConfigService<ConfigType, true>,
  ) {}

  @Mutation(() => ID)
  async downloadBilibiliCC(@Args('episodeId') episodeId: number) {
    const {
      index,
      jellyfinEpisodeId,
      season: { bilibiliThmId, title },
      downloadJobs: [job],
    } = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
      },
      include: {
        season: true,
        downloadJobs: {
          where: {
            status: DownloadStatus.AVAILABLE,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    if (!jellyfinEpisodeId) {
      throw new ConflictException('jellyfinEpisodeId not set');
    }
    if (!bilibiliThmId) {
      throw new ConflictException('bilibiliThmId is not set');
    }
    if (!job) {
      throw new ConflictException('no finished job found');
    }
    // TODO: 下载完成后记录filePath
    const { filePath } = job;
    if (!filePath) {
      throw new ConflictException('last job does not have filePath');
    }
    const srtPath = filePath.replace(path.extname(filePath), '').concat('.srt');
    const actualSrtPath = path.join(this.config.get('mediaRoot'), srtPath);
    const srtText = await this.service.downloadSRT(
      bilibiliThmId,
      index,
      'zh-Hant',
      BilibiliProxyRegion.THM,
    );
    console.log(`Writing CC for '${title}' / #${index}...`);
    await fs.writeFile(actualSrtPath, srtText, 'utf-8');
    JellyfinHelp.refreshItem({
      itemId: jellyfinEpisodeId,
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    });
    return 'ok';
  }
}
