import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { TorrentJson } from '@/admin/torrent-subtitle.resolver';
import { LaniError } from '@/utils/error';
import { Prisma } from '@lani/db';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { smartTorrent } from './smart-download.data';

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
  async smartDownloadPreview(
    @Args('seasonId', { type: () => Int }) seasonId: number,
    @Args('first', { type: () => Int, defaultValue: 30 }) first: number,
    @Args('snapshot') snapshot: string,
    @Args('after', { nullable: true }) after?: string,
  ) {
    if (
      !Number.isInteger(first) ||
      first < 1 ||
      first > 300 ||
      !Number.isFinite(Date.parse(snapshot))
    )
      throw new LaniError('种子预览参数无效');
    const cursor = decodePreviewCursor(after);
    const where: Prisma.TorrentWhereInput = {
      matchedSeasonId: seasonId,
      matchStatus: 'MATCHED',
      createdAt: { lte: new Date(snapshot) },
      publishDate: { lte: new Date(snapshot) },
      episodeNumberFrom: null,
      episodeNumberTo: null,
      ...(cursor
        ? {
            OR: [
              { publishDate: { lt: cursor.date } },
              { publishDate: cursor.date, id: { lt: cursor.id } },
            ],
          }
        : {}),
    };
    const rows = await this.prisma.torrent.findMany({
      where,
      orderBy: [{ publishDate: 'desc' }, { id: 'desc' }],
      take: first + 1,
    });
    const nodes = rows.slice(0, first);
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
