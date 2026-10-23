import config from '@/config';
import { PrismaClient } from '@lani/db';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { mapPath } from '@/utils/path';
import { MediaPool } from './media-pool.service';
import { applyBackfill, BackfillEntry, inspectBackfillFile } from './backfill';
import { BaseItemDto } from '@/api/jellyfin/generated/models/BaseItemDto';

/** 独立进程入口，不加载 AppModule，不恢复下载任务或启动定时器。 */
async function main() {
  const [mode, filename] = process.argv.slice(2);
  if (
    !['--scan', '--apply'].includes(mode) ||
    !filename ||
    process.argv.length !== 4
  )
    throw new Error('Usage: media:backfill --scan|--apply plan.json');
  const db = new PrismaClient({
    datasources: { db: { url: config.postgresUrl } },
  });
  try {
    if (mode === '--scan') {
      const entries: BackfillEntry[] = [];
      const episodes = await db.episode.findMany({
        where: { jellyfinEpisodeId: { not: null }, currentVersionId: null },
        include: { season: { include: { jellyfinFolder: true } } },
        orderBy: { id: 'asc' },
      });
      const client = axios.create({
        baseURL: config.jellyfin.apiEndpoint,
        headers: { 'X-Emby-Token': config.jellyfin.apiToken },
        timeout: 30000,
      });
      for (const episode of episodes) {
        const { data: item } = await client.get<BaseItemDto>(
          `/Users/${encodeURIComponent(
            config.jellyfin.dummyUserId,
          )}/Items/${encodeURIComponent(episode.jellyfinEpisodeId!)}`,
        );
        if (!item.Path || (item.MediaSources?.length ?? 0) > 1)
          throw new Error(
            `Episode ${episode.id}: ambiguous or missing media source`,
          );
        const root = path.resolve(
          mapPath(
            config.jellyfin.pathMapping,
            episode.season.jellyfinFolder.location,
          ),
        );
        const mapped = (value: string) => {
          const local = path.resolve(
            mapPath(config.jellyfin.pathMapping, value),
          );
          if (!local.startsWith(`${root}${path.sep}`))
            throw new Error(
              `Episode ${episode.id}: media path is outside the library`,
            );
          return local;
        };
        const files = [await inspectBackfillFile(mapped(item.Path), 'video')];
        const streams =
          item.MediaSources?.[0]?.MediaStreams ?? item.MediaStreams ?? [];
        for (const stream of streams.filter(
          (stream) => stream.IsExternal && stream.Type === 'Subtitle',
        )) {
          if (!stream.Path)
            throw new Error(`Episode ${episode.id}: subtitle has no path`);
          files.push(
            await inspectBackfillFile(mapped(stream.Path), 'subtitle'),
          );
        }
        entries.push({
          episodeId: episode.id,
          jellyfinEpisodeId: episode.jellyfinEpisodeId!,
          files,
        });
      }
      await fs.writeFile(
        filename,
        JSON.stringify({ version: 1, entries }, null, 2) + '\n',
        { flag: 'wx', mode: 0o600 },
      );
      console.log(
        `Backfill plan written: ${entries.length} episode(s). Review before applying.`,
      );
    } else {
      const plan = JSON.parse(await fs.readFile(filename, 'utf8'));
      if (plan.version !== 1 || !Array.isArray(plan.entries))
        throw new Error('Unsupported backfill plan');
      if (config.mediaPool.painfullyAcceptCrossDeviceCopy)
        console.warn('Cross-device copy enabled; atomicity is reduced.');
      const pool = new MediaPool(db, config.mediaPool);
      await pool.initialize();
      await applyBackfill(db, pool, plan.entries);
      console.log(`Backfill completed: ${plan.entries.length} episode(s).`);
    }
  } finally {
    await db.$disconnect();
  }
}
main().catch((error) => {
  // HTTP 错误对象可能包含鉴权头；CLI 只报告状态，不打印完整对象。
  console.error(
    axios.isAxiosError(error)
      ? `Jellyfin request failed (${error.response?.status ?? 'network error'})`
      : error.message,
  );
  process.exitCode = 1;
});
