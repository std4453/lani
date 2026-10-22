import { PrismaService } from '@/common/prisma.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { TorrentChannel } from '@lani/db';
import { enqueueTorrentMatch } from '@/torrent-match/producer';
import { Injectable } from '@nestjs/common';

export interface TorrentItem {
  hash: string;
  title: string;
  torrentLink: string;
  permalink: string;
  size: bigint;
  publishDate: Date;
}

@Injectable()
export class TorrentSyncService {
  constructor(
    private prisma: PrismaService,
    private parser: ParseTorrentService,
  ) {}

  async insert(items: TorrentItem[], channel: TorrentChannel) {
    const unique = new Map(
      items.map((item) => [item.hash.toLowerCase(), item]),
    );
    if (!unique.size) return 0;
    return this.prisma.$transaction(async (tx) => {
      // 所有来源共用此入口；串行化批量去重，确保只为本次实际新增的行入队。
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(1634625901, 1)`;
      const existing = await tx.torrent.findMany({
        where: { hash: { in: [...unique.keys()] } },
        select: { hash: true },
      });
      for (const { hash } of existing) unique.delete(hash.toLowerCase());
      if (!unique.size) return 0;
      // 首次收录决定来源和标题；重复同步不改写既有下载规则依赖的字段。
      const { count } = await tx.torrent.createMany({
        data: [...unique].map(([hash, item]) => ({
          ...item,
          hash,
          channel,
          ...this.parser.titleToCreateInput(item.title),
        })),
        skipDuplicates: true,
      });
      const created = await tx.torrent.findMany({
        where: { hash: { in: [...unique.keys()] } },
        select: { id: true },
      });
      await enqueueTorrentMatch(
        tx,
        created.map(({ id }) => id),
      );
      return count;
    });
  }
}
