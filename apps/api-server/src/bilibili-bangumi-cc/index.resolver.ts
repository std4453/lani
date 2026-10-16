import { taskEpisodeOutput } from '@/task/task-input';
import { MetadataRefreshMode } from '@/api/jellyfin';
import { BilibiliBangumiCCService } from '@/bilibili-bangumi-cc/index.service';
import { BilibiliProxyRegion } from '@/bilibili-bangumi-cc/types';
import { PrismaService } from '@/common/prisma.service';
import { JellyfinHelp } from '@/api/jellyfin';
import { ConflictException } from '@nestjs/common';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { LegacyTaskStage } from '@lani/db';
import fs from 'fs/promises';
import path from 'path';

@Resolver()
export class BilibiliBangumiCCResolver {
  constructor(
    private service: BilibiliBangumiCCService,
    private prisma: PrismaService,
  ) {}

  @Mutation(() => ID)
  async downloadBilibiliCC(@Args('episodeId') episodeId: number) {
    const {
      index,
      jellyfinEpisodeId,
      season: { bilibiliThmId, title },
      taskEpisodes: [job],
    } = await this.prisma.episode.findUnique({
      where: {
        id: episodeId,
      },
      include: {
        season: true,
        taskEpisodes: {
          include: { task: true },
          where: {
            task: { legacyStage: LegacyTaskStage.AVAILABLE },
          },
          orderBy: {
            taskId: 'desc',
          },
          take: 1,
        },
      },
    });
    if (index == null || index < 1) {
      throw new ConflictException(
        'Bilibili CC requires an ordinary integer episode',
      );
    }
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
    const filePath = taskEpisodeOutput(job.task, episodeId)?.filePath;
    if (!filePath) {
      throw new ConflictException('last job does not have filePath');
    }
    const srtPath = filePath.replace(path.extname(filePath), '').concat('.srt');
    const srtText = await this.service.downloadSRT(
      bilibiliThmId,
      index,
      'zh-Hant',
      BilibiliProxyRegion.THM,
    );
    console.log(`Writing CC for '${title}' / #${index}...`);
    await fs.writeFile(srtPath, srtText, 'utf-8');
    JellyfinHelp.refreshItem({
      itemId: jellyfinEpisodeId,
      metadataRefreshMode: MetadataRefreshMode.FULL_REFRESH,
    });
    return 'ok';
  }
}
