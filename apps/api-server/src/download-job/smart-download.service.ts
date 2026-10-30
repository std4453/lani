import { PrismaService } from '@/common/prisma.service';
import { lockEpisode } from '@/common/episode-lock';
import config from '@/config';
import { IDownloadClient } from '@/download-client/IDownloadClient';
import { createEpisodeTask } from '@/task/create-episode-task';
import { TaskService } from '@/task/index.service';
import { Prisma, Task, TaskType } from '@lani/db';
import { evaluateTorrents, isBaha, isMainEpisode } from '@lani/smart-download';
import { currentStep, parseWorkflow } from '@lani/workflow';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { downloadDefinition } from './definition';
import {
  seasonSettings,
  smartEpisode,
  smartTorrent,
} from './smart-download.data';

export function blocksSmartDownload(task: Task): boolean {
  if (task.isCancelled || task.legacyStage === 'AVAILABLE') return false;
  // 取消清理失败仍占用剧集，避免新任务与旧清理竞争同一个下载器种子。
  return (
    !task.isFailed ||
    !!(task.workflow && parseWorkflow(task.workflow).cancellation)
  );
}
export function excludedSmartDownloadHashes(tasks: Task[]): Set<string> {
  return new Set(
    tasks
      .filter(
        (task) =>
          task.isSmartDownload &&
          (task.isCancelled || task.isFailed) &&
          (!task.workflow ||
            parseWorkflow(task.workflow).cancellation?.code !== 'baha'),
      )
      .map((task) => task.smartDownloadTorrentHash?.toLowerCase())
      .filter((hash): hash is string => !!hash),
  );
}

@Injectable()
export class SmartDownloadService {
  private logger = new Logger(SmartDownloadService.name);
  private pending?: Promise<number>;
  constructor(
    private prisma: PrismaService,
    private tasks: TaskService,
    private client: IDownloadClient,
  ) {}

  @Cron('*/1 * * * *')
  run(): Promise<number> {
    if (this.pending) return this.pending;
    return (this.pending = this.scan()
      .catch((error) => {
        this.logger.error(`Smart download scan failed: ${error}`);
        return 0;
      })
      .finally(() => {
        this.pending = undefined;
      }));
  }

  private async load(
    tx: Prisma.TransactionClient,
    seasonId: number,
    now: number,
  ) {
    const season = await tx.season.findUnique({
      where: { id: seasonId },
      include: { episodes: true },
    });
    if (!season?.smartDownloadEnabled || !season.jellyfinId) return null;
    const episodes = season.episodes.map((episode) =>
      smartEpisode(episode, season.downloadOffsetHours),
    );
    const missing = episodes.filter(
      (episode) =>
        isMainEpisode(episode) &&
        episode.airTime &&
        Date.parse(episode.airTime) <= now &&
        !season.episodes.find((row) => row.id === episode.id)!
          .jellyfinEpisodeId,
    );
    if (!missing.length) return null;
    const settings = seasonSettings(season);
    const torrents = await tx.torrent.findMany({
      where: {
        matchedSeasonId: seasonId,
        matchStatus: 'MATCHED',
        parseVersion: { not: null },
        episodeNumberFrom: null,
        episodeNumberTo: null,
        AND: [
          {
            OR: [
              { channel: 'MIKAN' },
              { channel: 'NYAA', metadataFetchedAt: { not: null } },
            ],
          },
          {
            OR: missing.map((episode) => ({
              publishDate: {
                gte: new Date(episode.airTime!),
                lte: new Date(
                  Math.min(
                    now,
                    Date.parse(episode.airTime!) +
                      settings.windowHours * 3600000,
                  ),
                ),
              },
            })),
          },
        ],
      },
      orderBy: [{ publishDate: 'asc' }, { id: 'asc' }],
    });
    return { season, episodes, missing, settings, torrents };
  }

  private async scan() {
    const started = Date.now();
    const seasons = await this.prisma.season.findMany({
      where: { smartDownloadEnabled: true, jellyfinId: { not: '' } },
      select: { id: true },
    });
    let created = 0;
    let checked = 0;
    for (const { id } of seasons) {
      try {
        const state = await this.load(this.prisma, id, Date.now());
        if (!state) continue;
        checked += state.torrents.length;
        const possible = new Set(
          evaluateTorrents(
            state.episodes,
            state.torrents.map(smartTorrent),
            { ...state.settings, preferBaha: false },
            Date.now(),
            config.smartDownload?.rules.title.excludes ?? [],
          )
            .filter((decision) => !decision.reasons.length)
            .map((decision) => decision.episodeId),
        );
        for (const episode of state.missing) {
          if (!possible.has(episode.id)) continue;
          // 短事务内重新读取配置、目录、资源和占用，任务与关联同时写入。
          const result = await this.tasks.creationTransaction(async (tx) => {
            await tx.$queryRaw`SELECT id FROM seasons WHERE id=${id} FOR SHARE`;
            await lockEpisode(tx, episode.id);
            const current = await this.load(tx, id, Date.now());
            if (
              !current ||
              !current.missing.some((row) => row.id === episode.id)
            )
              return null;
            const history = await tx.task.findMany({
              where: { episodes: { some: { episodeId: episode.id } } },
            });
            const excluded = excludedSmartDownloadHashes(history);
            const candidates = current.torrents.filter(
              (torrent) => !excluded.has(torrent.hash.toLowerCase()),
            );
            const decisions = evaluateTorrents(
              current.episodes,
              candidates.map(smartTorrent),
              current.settings,
              Date.now(),
              config.smartDownload?.rules.title.excludes ?? [],
            );
            const decision = decisions.find(
              (row) => row.episodeId === episode.id && !row.reasons.length,
            );
            if (!decision) return null;
            const torrent = candidates.find(
              (row) => row.id === decision.torrentId,
            )!;
            const active = history.filter(blocksSmartDownload);
            if (active.length) {
              const replace =
                active.length === 1 &&
                active[0].isSmartDownload &&
                current.settings.preferBaha &&
                isBaha(torrent) &&
                active[0].smartDownloadTorrentHash?.toLowerCase() !==
                  torrent.hash.toLowerCase() &&
                !isBaha({
                  title:
                    (
                      active[0].smartDownloadDecision as {
                        torrent?: { title?: string };
                      } | null
                    )?.torrent?.title ??
                    active[0].torrentTitle ??
                    '',
                }) &&
                active[0].workflow &&
                currentStep(parseWorkflow(active[0].workflow)).atom ===
                  'download';
              return replace ? { cancel: active[0], start: null } : null;
            }
            const task = await createEpisodeTask(
              this.tasks,
              tx,
              TaskType.DOWNLOAD,
              downloadDefinition,
              {
                episodeId: episode.id,
                torrentLink: torrent.torrentLink,
                torrentTitle: torrent.title,
                isSmartDownload: true,
                smartDownloadTorrentHash: torrent.hash,
                downloadTimeoutMinutes: current.settings.timeoutMinutes || null,
                smartDownloadDecision: {
                  version: 1,
                  at: new Date().toISOString(),
                  torrent: smartTorrent(torrent),
                  seasonId: id,
                  matchedAt: torrent.matchedAt?.toISOString() ?? null,
                  matchDetails: torrent.matchDetails,
                  metadataFetchedAt:
                    torrent.metadataFetchedAt?.toISOString() ?? null,
                  createdAt: torrent.createdAt.toISOString(),
                  episode: current.episodes.find(
                    (row) => row.id === episode.id,
                  ),
                  offset: current.season.downloadOffsetHours,
                  settings: current.settings,
                  excludes: config.smartDownload?.rules.title.excludes ?? [],
                  decision,
                } as unknown as Prisma.InputJsonValue,
              },
              [episode.id],
            );
            return { start: task.id, cancel: null };
          });
          if (result?.start) {
            created++;
            void this.tasks.start(result.start);
          }
          if (result?.cancel?.qbtTorrentHash) {
            // 下载器已经完成时即使流程尚未推进，也保留现有成果。
            const [status] = await this.client.lookupTorrents([
              result.cancel.qbtTorrentHash,
            ]);
            if (status?.status === 'pending')
              await this.tasks.cancel(result.cancel.id, {
                code: 'baha',
                reason: '智能下载任务取消（Baha 优先）',
              });
          }
        }
      } catch (error) {
        this.logger.error(`Smart download season ${id} failed: ${error}`);
      }
    }
    this.logger.debug(
      `Smart download scan: seasons=${
        seasons.length
      }, torrents=${checked}, created=${created}, elapsedMs=${
        Date.now() - started
      }`,
    );
    return created;
  }
}
