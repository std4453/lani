import { PrismaService } from '@/common/prisma.service';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { Prisma } from '@lani/db';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MikanSyncService {
  constructor(
    private prisma: PrismaService,
    private fetchMikanService: FetchMikanService,
    private parseTorrentService: ParseTorrentService,
  ) {}

  @Cron('*/5 * * * *')
  async syncMikan() {
    console.debug('Syncing mikan...');
    try {
      const items = await this.fetchMikanService.fetchMikanRSSItems('Classic');
      const { count } = await this.prisma.torrent.createMany({
        data: items.map(
          ({
            hash,
            publishDate,
            size,
            title,
            torrentLink,
          }): Prisma.TorrentCreateManyInput => {
            return {
              title,
              torrentLink,
              size,
              publishDate,
              hash,
              ...this.parseTorrentService.titleToCreateInput(title),
            };
          },
        ),
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
