import { SmartEpisode, SmartTorrent } from '@lani/smart-download';

import { compareTorrents, episodeReleases } from './rows';

export type PreviewTorrent = SmartTorrent & { size: string };
export interface PreviewPage {
  nodes: PreviewTorrent[];
  cursor: string | null;
  hasMore: boolean;
  excludes: string[];
}
export interface PreviewRequest {
  first: number;
  after?: string | null;
  from?: string;
  before?: string;
  snapshot?: string;
}
export interface PreviewSnapshot {
  nodes: PreviewTorrent[];
  excludes: string[];
  hasMore: boolean;
  coverage: { from: number; through: number; completeUntil: number };
}
const date = (time: number) => new Date(time).toISOString();
const published = (torrent: PreviewTorrent) => Date.parse(torrent.publishDate);
const merge = (...groups: PreviewTorrent[][]) =>
  [...new Map(groups.flat().map((row) => [row.id, row])).values()].sort(
    compareTorrents,
  );
function check(signal: AbortSignal) {
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
}

/** 内存保留完整连续区间；请求按 90 条补齐发布边界，展示独立按 30 行展开。 */
export class PreviewCache {
  nodes: PreviewTorrent[] = [];
  excludes: string[] = [];
  hasMore = true;
  private initialized = false;
  private cursor: string | null = null;
  private from?: number;
  private lowerBound = Infinity;
  private snapshot?: string;
  private revision = 0;
  constructor(
    private fetchPage: (
      request: PreviewRequest,
      signal: AbortSignal,
    ) => Promise<PreviewPage>,
  ) {}

  needsEarlier(first: number | undefined) {
    return this.initialized && first !== undefined && first <= this.lowerBound;
  }
  private async fetch(request: PreviewRequest, signal: AbortSignal) {
    check(signal);
    const page = await this.fetchPage(
      { snapshot: this.snapshot, ...request },
      signal,
    );
    check(signal);
    if (
      page.hasMore &&
      (!page.nodes.length || !page.cursor || page.cursor === request.after)
    )
      throw new Error('种子列表分页未推进');
    return page;
  }

  /** 补齐旧缓存前方缺口后一次提交，取消或失败都保留旧的连续区间。 */
  private async prepend(first: number | undefined, signal: AbortSignal) {
    const context =
      first === undefined
        ? undefined
        : await this.fetch({ first: 10, before: date(first) }, signal);
    let added = context?.nodes ?? [];
    const oldFirst = this.nodes[0];
    let page: PreviewPage;
    let cursor: string | null = null;
    do {
      page = await this.fetch(
        {
          first: 90,
          from: first === undefined ? undefined : date(first),
          after: cursor,
        },
        signal,
      );
      added = merge(added, page.nodes);
      cursor = page.cursor;
    } while (
      page.hasMore &&
      oldFirst &&
      (!added.length || compareTorrents(added[added.length - 1], oldFirst) < 0)
    );
    check(signal);
    const oldLast = this.nodes[this.nodes.length - 1];
    const newLast = page.nodes[page.nodes.length - 1];
    if (
      !this.initialized ||
      !oldLast ||
      (newLast && compareTorrents(newLast, oldLast) >= 0)
    ) {
      this.cursor = page.cursor;
      this.hasMore = page.hasMore;
    }
    this.nodes = merge(added, this.nodes);
    this.excludes = page.excludes;
    this.from = first;
    this.lowerBound = context?.hasMore
      ? published(context.nodes[0])
      : -Infinity;
    this.initialized = true;
  }

  async ensure(
    count: number,
    episodes: SmartEpisode[],
    now: number,
    signal: AbortSignal,
    anchorId?: number,
  ): Promise<PreviewSnapshot> {
    this.revision++;
    const releases = episodeReleases(episodes);
    const first = releases[0]?.at;
    if (!this.initialized || this.needsEarlier(first))
      await this.prepend(first, signal);
    const anchor = releases.find((release) =>
      release.episodeIds.includes(anchorId!),
    );
    while (this.hasMore) {
      const visibleTime = this.nodes.length
        ? published(this.nodes[Math.min(count, this.nodes.length) - 1])
        : -Infinity;
      const target = Math.max(visibleTime, anchor?.at ?? first ?? -Infinity);
      const next = releases.find(
        (release) => release.at > target && release.at <= now,
      );
      const tail = this.nodes[this.nodes.length - 1];
      // 没有后续已发布剧集时读到末尾；没有日程时保留普通分页。
      if (
        this.nodes.length >= count &&
        (!releases.length || (next && tail && published(tail) >= next.at))
      )
        break;
      const page = await this.fetch(
        {
          first: 90,
          from: this.from === undefined ? undefined : date(this.from),
          after: this.cursor,
        },
        signal,
      );
      this.nodes = merge(this.nodes, page.nodes);
      this.excludes = page.excludes;
      this.cursor = page.cursor;
      this.hasMore = page.hasMore;
    }
    const tailTime = this.nodes.length
      ? published(this.nodes[this.nodes.length - 1])
      : -Infinity;
    const crossed = releases.filter((release) => release.at <= tailTime);
    return {
      nodes: [...this.nodes],
      excludes: this.excludes,
      hasMore: this.hasMore,
      coverage: {
        from: this.lowerBound,
        through: this.hasMore ? tailTime : Infinity,
        completeUntil: this.hasMore
          ? crossed[crossed.length - 1]?.at ?? -Infinity
          : Infinity,
      },
    };
  }

  /** 尾部增量在副本中完成；翻页、偏移或取消使旧刷新失效，失败保留当前表格。 */
  async refresh(
    count: number,
    episodes: SmartEpisode[],
    now: number,
    signal: AbortSignal,
  ) {
    const revision = this.revision;
    const next = new PreviewCache(this.fetchPage);
    Object.assign(next, {
      nodes: [...this.nodes],
      excludes: this.excludes,
      hasMore: this.hasMore,
      initialized: this.initialized,
      cursor: this.cursor,
      from: this.from,
      lowerBound: this.lowerBound,
      snapshot: date(now),
    });
    if (!next.nodes.length) next.initialized = false;
    else {
      const page = await next.fetch(
        {
          first: 90,
          after: next.cursor,
        },
        signal,
      );
      next.nodes = merge(next.nodes, page.nodes);
      next.excludes = page.excludes;
      next.hasMore = page.hasMore;
      if (page.cursor) next.cursor = page.cursor;
    }
    const result = await next.ensure(count, episodes, now, signal);
    check(signal);
    if (revision !== this.revision)
      throw new DOMException('Superseded', 'AbortError');
    Object.assign(this, {
      nodes: next.nodes,
      excludes: next.excludes,
      hasMore: next.hasMore,
      cursor: next.cursor,
      snapshot: next.snapshot,
      initialized: next.initialized,
      lowerBound: next.lowerBound,
      from: next.from,
    });
    this.revision++;
    return result;
  }
}
