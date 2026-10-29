import {
  isMainEpisode,
  SmartEpisode,
  SmartTorrent,
} from '@lani/smart-download';

export type PreviewTorrent = SmartTorrent & { size: string };
export interface PreviewPage {
  nodes: PreviewTorrent[];
  cursor: string | null;
  hasMore: boolean;
  excludes: string[];
}

/** 获取与展示分离：补齐发布区间后，界面仍只增加 30 行。 */
export class PreviewCache {
  nodes: PreviewTorrent[] = [];
  excludes: string[] = [];
  hasMore = true;
  private cursor: string | null = null;
  private pending?: Promise<void>;
  constructor(
    private fetchPage: (
      first: number,
      after: string | null,
    ) => Promise<PreviewPage>,
  ) {}

  private fetch(first: number) {
    if (this.pending) return this.pending;
    return (this.pending = this.fetchPage(first, this.cursor)
      .then((page) => {
        const existing = new Set(this.nodes.map((row) => row.id));
        this.nodes.push(...page.nodes.filter((row) => !existing.has(row.id)));
        this.excludes = page.excludes;
        if (page.hasMore && (!page.cursor || page.cursor === this.cursor))
          throw new Error('种子列表分页未推进');
        this.cursor = page.cursor;
        this.hasMore = page.hasMore;
      })
      .finally(() => {
        this.pending = undefined;
      }));
  }

  async ensure(
    count: number,
    episodes: SmartEpisode[],
    now: number,
  ): Promise<number> {
    const releases = [
      ...new Set(
        episodes
          .filter(isMainEpisode)
          .map((episode) => Date.parse(episode.airTime ?? '')),
      ),
    ]
      .filter((time) => Number.isFinite(time) && time <= now)
      .sort((a, b) => a - b);
    let size = 30;
    while (this.hasMore) {
      if (this.nodes.length < count) {
        await this.fetch(30);
        continue;
      }
      const oldestVisible = Date.parse(
        this.nodes[Math.min(count, this.nodes.length) - 1].publishDate,
      );
      const boundary = [...releases]
        .reverse()
        .find((time) => time <= oldestVisible);
      // 已跨过最早剧集，后续种子只需正常分页。
      if (
        boundary === undefined ||
        Date.parse(this.nodes[this.nodes.length - 1].publishDate) <= boundary
      )
        break;
      size = Math.min(300, size * 2);
      await this.fetch(size);
    }
    if (!this.hasMore || !releases.length || !this.nodes.length)
      return -Infinity;
    const oldest = Date.parse(this.nodes[this.nodes.length - 1].publishDate);
    return releases.find((time) => time >= oldest) ?? Infinity;
  }
}
