import { FetchMikanService } from '@/fetch-mikan/index.service';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MikanSyncService {
  constructor(
    private prisma: PrismaService,
    private fetchMikanService: FetchMikanService,
  ) {}

  async syncMikan() {
    try {
      const items = await this.fetchMikanService.fetchMikanRSSItems('Classic');
      console.log(items.length, 'items found');
      await this.prisma.torrents.createMany({
        data: items.map(({ hash, publishDate, size, title, torrentLink }) => ({
          title,
          torrentLink,
          size,
          publishDate,
          hash,
        })),
        skipDuplicates: true,
      });
    } catch (e) {
      console.error(e);
    }
  }
}
