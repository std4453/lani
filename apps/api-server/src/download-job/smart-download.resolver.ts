import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { TorrentJson } from '@/admin/torrent-subtitle.resolver';
import { LaniError } from '@/utils/error';
import { Prisma } from '@lani/db';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { smartTorrent } from './smart-download.data';
import { summarizeWorkflow, TaskSummary } from '@lani/workflow';

export function decodePreviewCursor(
  value?: string,
): { date: Date; id: number } | undefined {
  if (!value) return undefined;
  try {
    const [date, id] = JSON.parse(Buffer.from(value, 'base64url').toString());
    if (
      typeof date !== 'string' ||
      !Number.isFinite(Date.parse(date)) ||
      !Number.isSafeInteger(id) ||
      id < 1
    )
      throw new Error();
    return { date: new Date(date), id };
  } catch {
    throw new LaniError('种子列表游标无效，请重新打开弹窗');
  }
}
@Resolver()
export class SmartDownloadResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => TorrentJson)
  async smartDownloadTasks(
    @Args('seasonId', { type: () => Int }) seasonId: number,
  ) {
    const tasks = await this.prisma.task.findMany({
      where: { isSmartDownload: true, episode: { seasonId } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        smartDownloadTorrentHash: true,
        version: true,
        workflow: true,
        legacyStage: true,
        isFailed: true,
        isCancelled: true,
      },
    });
    const seen = new Set<string>();
    return tasks.flatMap((task) => {
      const hash = task.smartDownloadTorrentHash?.toLowerCase();
      if (!hash || seen.has(hash)) return [];
      seen.add(hash);
      const summary: TaskSummary = { version: task.version };
      try {
        if (task.workflow) summary.workflow = summarizeWorkflow(task.workflow);
        else
          summary.legacy = {
            stage: task.legacyStage,
            isFailed: task.isFailed,
            isCancelled: task.isCancelled,
          };
      } catch {
        // 损坏的流程显示未知状态，不影响其他种子的刷新。
      }
      return [{ id: task.id, hash, summary }];
    });
  }

  @Query(() => TorrentJson)
  async smartDownloadPreview(
    @Args('seasonId', { type: () => Int }) seasonId: number,
    @Args('first', { type: () => Int, defaultValue: 30 }) first: number,
    @Args('snapshot') snapshot: string,
    @Args('after', { nullable: true }) after?: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('before', { nullable: true }) before?: string,
  ) {
    if (
      !Number.isInteger(first) ||
      first < 1 ||
      first > 300 ||
      !Number.isFinite(Date.parse(snapshot)) ||
      (from != null && !Number.isFinite(Date.parse(from))) ||
      (before != null && !Number.isFinite(Date.parse(before))) ||
      (before != null && (from != null || after != null))
    )
      throw new LaniError('种子预览参数无效');
    const cursor = decodePreviewCursor(after);
    const where: Prisma.TorrentWhereInput = {
      matchedSeasonId: seasonId,
      matchStatus: 'MATCHED',
      createdAt: { lte: new Date(snapshot) },
      publishDate: {
        lte: new Date(snapshot),
        ...(from != null ? { gte: new Date(from) } : {}),
        ...(before != null ? { lt: new Date(before) } : {}),
      },
      episodeNumberFrom: null,
      episodeNumberTo: null,
      ...(cursor
        ? {
            OR: [
              { publishDate: { gt: cursor.date } },
              { publishDate: cursor.date, id: { gt: cursor.id } },
            ],
          }
        : {}),
    };
    const rows = await this.prisma.torrent.findMany({
      where,
      orderBy: [
        { publishDate: before != null ? 'desc' : 'asc' },
        { id: before != null ? 'desc' : 'asc' },
      ],
      take: first + 1,
    });
    const nodes = rows.slice(0, first);
    // 向前取首集之前的上下文，返回值仍保持正序。
    if (before != null) nodes.reverse();
    const last = nodes[nodes.length - 1];
    return {
      nodes: nodes.map((row) => ({
        ...smartTorrent(row),
        size: row.size.toString(),
      })),
      hasMore: rows.length > first,
      cursor: last
        ? Buffer.from(
            JSON.stringify([last.publishDate.toISOString(), last.id]),
          ).toString('base64url')
        : null,
      excludes: config.smartDownload?.rules.title.excludes ?? [],
    };
  }
}
