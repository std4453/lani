import { GlobalAxiosService } from '@/common/axios.service';
import config from '@/config';
import { TorrentSyncService } from '@/torrent-sync/index.service';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { TorrentChannel } from '@lani/db';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { NyaaHistorySync } from './index.model';
import { parseHistory, parseRSS } from './parse';
import { RateLimitedClient } from './rate-limited-client';

// 以每页 75 条、日均约 200/80/45 条估算，分别覆盖约十天。
export const NYAA_HISTORY_PAGES = { '1_2': 30, '1_3': 12, '1_4': 7 } as const;
type Category = keyof typeof NYAA_HISTORY_PAGES;

@Injectable()
export class NyaaSyncService {
  private readonly logger = new Logger(NyaaSyncService.name);
  private readonly client = new RateLimitedClient(config.nyaa.qps);
  private history?: Promise<number>;
  private historyState: NyaaHistorySync = {
    id: '',
    running: false,
    added: 0,
    error: null,
  };
  private readonly running = new Map<Category, Promise<number>>();

  constructor(
    private axios: GlobalAxiosService,
    private torrents: TorrentSyncService,
  ) {}

  private fetch(params: Record<string, string | number>) {
    return this.client.request(async () => {
      const { data } = await this.axios.get<string>('https://nyaa.si/', {
        params,
        responseType: 'text',
        // 禁止客户端自动跟随跳转绕过限速或访问非预期页面。
        maxRedirects: 0,
      });
      return data;
    });
  }

  syncCategory(category: Category): Promise<number> {
    const running = this.running.get(category);
    if (running) return running;
    const task = (async () => {
      const items = await parseRSS(
        await this.fetch({ page: 'rss', c: category }),
      );
      const count = await this.torrents.insert(items, TorrentChannel.NYAA);
      this.logger.log(`Synced Nyaa ${category}: ${count} new torrents`);
      return count;
    })().finally(() => this.running.delete(category));
    this.running.set(category, task);
    return task;
  }

  @Cron('0 */5 * * * *')
  @LaniFilterCron()
  syncEnglish() {
    return this.syncCategory('1_2');
  }

  @Cron('20 */5 * * * *')
  @LaniFilterCron()
  syncNonEnglish() {
    return this.syncCategory('1_3');
  }

  @Cron('40 */5 * * * *')
  @LaniFilterCron()
  syncRaw() {
    return this.syncCategory('1_4');
  }

  async syncNyaa() {
    const results = await Promise.allSettled(
      (Object.keys(NYAA_HISTORY_PAGES) as Category[]).map((c) =>
        this.syncCategory(c),
      ),
    );
    return this.total(results);
  }

  private total(results: PromiseSettledResult<number>[]) {
    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length) {
      for (const r of failed)
        if (r.status === 'rejected') this.logger.warn(r.reason);
      throw new Error('Nyaa 部分分类同步失败，已入库的种子保留，请重试');
    }
    return results.reduce(
      (sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0),
      0,
    );
  }

  getHistorySync(): NyaaHistorySync {
    return { ...this.historyState };
  }

  startHistorySync(): NyaaHistorySync {
    if (this.historyState.running) return this.getHistorySync();
    this.historyState = {
      id: randomUUID(),
      running: true,
      added: 0,
      error: null,
    };
    // 后台请求不占用 Gateway 长连接；拒绝在此收敛并供前端轮询。
    void this.syncNyaaHistory().then(
      (added) => {
        this.historyState = { ...this.historyState, running: false, added };
      },
      (error: unknown) => {
        this.logger.error(
          'Nyaa history synchronization failed',
          error instanceof Error ? error.stack : String(error),
        );
        this.historyState = {
          ...this.historyState,
          running: false,
          error: 'Nyaa 历史同步失败，已入库的种子保留，请重试',
        };
      },
    );
    return this.getHistorySync();
  }

  syncNyaaHistory(): Promise<number> {
    if (this.history) return this.history;
    this.history = this.fetchHistory().finally(() => {
      this.history = undefined;
    });
    return this.history;
  }

  private async fetchHistory() {
    const results: PromiseSettledResult<number>[] = [];
    for (const [category, pages] of Object.entries(NYAA_HISTORY_PAGES)) {
      let count = 0;
      try {
        for (let page = 1; page <= pages; page++) {
          const items = parseHistory(
            await this.fetch({ c: category, p: page }),
          );
          const added = await this.torrents.insert(items, TorrentChannel.NYAA);
          count += added;
          if (this.historyState.running) this.historyState.added += added;
          if (!items.length) break;
        }
        this.logger.log(
          `Synced Nyaa history ${category}: ${count} new torrents`,
        );
        results.push({ status: 'fulfilled', value: count });
      } catch (reason) {
        results.push({ status: 'rejected', reason });
      }
    }
    return this.total(results);
  }
}
