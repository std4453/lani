import { PrismaService } from '@/common/prisma.service';
import { FetchMikanService } from '@/fetch-mikan/index.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { Prisma } from '@lani/db';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MikanSyncService {
  private readonly logger = new Logger(MikanSyncService.name);

  constructor(
    private prisma: PrismaService,
    private fetchMikanService: FetchMikanService,
    private parseTorrentService: ParseTorrentService,
  ) {}

  private async insertNewTorrents(
    items: Awaited<ReturnType<FetchMikanService['fetchMikanRSSItems']>>,
  ) {
    const hashes = new Set<string>();
    const uniqueItems = items.filter(({ hash }) => {
      if (hashes.has(hash)) {
        return false;
      }
      hashes.add(hash);
      return true;
    });
    if (uniqueItems.length === 0) {
      return 0;
    }

    // 插入前过滤已有 hash，避免重复的 RSS 条目消耗自增 ID
    const existing = await this.prisma.torrent.findMany({
      where: { hash: { in: [...hashes] } },
      select: { hash: true },
    });
    const existingHashes = new Set(existing.map(({ hash }) => hash));
    const newItems = uniqueItems.filter(
      ({ hash }) => !existingHashes.has(hash),
    );
    if (newItems.length === 0) {
      return 0;
    }

    const { count } = await this.prisma.torrent.createMany({
      data: newItems.map(
        ({
          hash,
          publishDate,
          size,
          title,
          torrentLink,
        }): Prisma.TorrentCreateManyInput => ({
          title,
          torrentLink,
          size,
          publishDate,
          hash,
          ...this.parseTorrentService.titleToCreateInput(title),
        }),
      ),
      // 查重后仍可能有其他同步任务插入相同 hash，由数据库处理并发冲突
      skipDuplicates: true,
    });
    return count;
  }

  @Cron('*/5 * * * *')
  @LaniFilterCron()
  async syncMikanCronTask() {
    return this.syncMikan();
  }

  async syncMikan() {
    this.logger.log('Syncing mikan...');
    const items = await this.fetchMikanService.fetchMikanRSSItems('Classic');
    this.logger.verbose(`Fetch mikan success, got ${items.length} items`);
    const count = await this.insertNewTorrents(items);
    this.logger.log(`Sync mikan success, ${count} items new`);
    return count;
  }

  async syncMikanHistory() {
    const maxPages = 10;
    this.logger.log(
      `Syncing mikan history, fetching maximum ${maxPages} pages...`,
    );
    const items: Awaited<ReturnType<FetchMikanService['fetchMikanRSSItems']>> =
      [];
    // 1~10 页右缓存，不影响服务性能
    for (let i = 0; i < 10; ++i) {
      this.logger.verbose(`Fetching mikan history page #${i}...`);
      const itemsOnPage = await this.fetchMikanService.fetchMikanRSSItems(
        `Classic/${i}`,
      );
      items.push(...itemsOnPage);
      this.logger.verbose(
        `Fetch mikan history page #${i} success, got ${itemsOnPage.length} items`,
      );
    }
    this.logger.verbose(
      `Fetch all mikan history success, got ${items.length} items`,
    );
    const count = await this.insertNewTorrents(items);
    this.logger.log(`Sync mikan history success, ${count} items new`);
    return count;
  }
}
