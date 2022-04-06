import { PrismaService } from '@/common/prisma.service';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MikanSyncService {
  constructor(
    private prisma: PrismaService,
    private fetchMikanService: FetchMikanService,
  ) {}

  static episodeRegex =
    /((?<=-\s)\d{1,3}(?=\s))|((?<=\[)\d{1,3}(?=((\sEND)|(v\d+))?\]))|(?<=\u7b2c)\d{1,3}(?=\u96c6)/;

  private matchTorrentEpisode(title: string) {
    const result = title.match(MikanSyncService.episodeRegex);
    const matched = result?.[0];
    if (!matched) {
      return null;
    }
    return parseInt(matched);
  }

  @Cron('*/5 * * * *')
  async syncMikan() {
    console.debug('Syncing mikan...');
    try {
      const items = await this.fetchMikanService.fetchMikanRSSItems('Classic');
      const { count } = await this.prisma.torrent.createMany({
        data: items.map(({ hash, publishDate, size, title, torrentLink }) => ({
          title,
          torrentLink,
          size,
          publishDate,
          hash,
          episodeIndex: this.matchTorrentEpisode(title),
        })),
        skipDuplicates: true,
      });
      console.log(items.length, 'items found', count, 'items new');
      return count;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
