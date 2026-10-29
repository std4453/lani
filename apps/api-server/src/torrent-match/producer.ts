import { enqueueJob } from '@/background-queue/producer';
import config from '@/config';
import { Prisma } from '@lani/db';
import { MATCH_QUEUE } from './queues';
import { digest } from './catalog';
import { torrentQuery } from './query';

export const matchingEnabled = () => config.matching?.enabled === true;

export async function enqueueTorrentMatch(
  tx: Prisma.TransactionClient,
  ids: number[],
  onlyUnprocessed = false,
) {
  if (!matchingEnabled()) return 0;
  let enqueued = 0;
  for (const id of [...new Set(ids)].sort((a, b) => a - b)) {
    // 与结果提交一致，先业务行、再任务行；事务回滚时两者一起撤销。
    const changed = await tx.torrent.updateMany({
      where: {
        id,
        ...(onlyUnprocessed
          ? { matchStatus: null }
          : {
              OR: [
                { matchStatus: null },
                { matchStatus: { not: 'DISMISSED' as const } },
              ],
            }),
      },
      data: {
        matchedSeasonId: null,
        matchStatus: 'PENDING',
        matchDetails: Prisma.DbNull,
        matchedAt: null,
      },
    });
    if (changed.count) {
      enqueued += changed.count;
      await enqueueJob(tx, MATCH_QUEUE, String(id), {
        version: 1,
        torrentId: id,
      });
    }
  }
  return enqueued;
}

const inputs = {
  id: true,
  title: true,
  parseResult: true,
  publishDate: true,
  seasonTitleRaw: true,
  seasonTitleAliases: true,
  episodeType: true,
  episodeNumber: true,
  episodeNumberFrom: true,
  episodeNumberTo: true,
} as const;

/** 匹配输入变更才失效；仅字幕、解析版本等变更不重新调用模型。 */
export async function updateWithTorrentMatching(
  tx: Prisma.TransactionClient,
  ids: number[],
  update: () => Promise<unknown>,
) {
  if (!ids.length || !matchingEnabled()) return update();
  await tx.$queryRaw`SELECT id FROM torrents WHERE id IN (${Prisma.join(
    ids,
  )}) ORDER BY id FOR UPDATE`;
  const before = await tx.torrent.findMany({
    where: { id: { in: ids } },
    select: inputs,
  });
  const result = await update();
  const after = await tx.torrent.findMany({
    where: { id: { in: ids } },
    select: inputs,
  });
  const previous = new Map(
    before.map((row) => [row.id, digest(torrentQuery(row))]),
  );
  await enqueueTorrentMatch(
    tx,
    after
      .filter((row) => previous.get(row.id) !== digest(torrentQuery(row)))
      .map((row) => row.id),
  );
  return result;
}
