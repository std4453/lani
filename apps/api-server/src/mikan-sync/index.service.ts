import { PrismaService } from '@/common/prisma.service';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { concatMap } from 'rxjs';

@Injectable()
export class MikanSyncService {
  constructor(
    private prisma: PrismaService,
    private fetchMikanService: FetchMikanService,
  ) {}

  @Cron('*/5 * * * *')
  syncMikan() {
    return this.fetchMikanService.fetchMikanRSSItems('Classic').pipe(
      concatMap(async (items) => {
        const { count } = await this.prisma.torrents.createMany({
          data: items.map(
            ({ hash, publishDate, size, title, torrentLink }) => ({
              title,
              torrentLink,
              size,
              publishDate,
              hash,
            }),
          ),
          skipDuplicates: true,
        });
        console.log(items.length, 'items found', count, 'items new');
        return count;
      }),
    );
  }
}
