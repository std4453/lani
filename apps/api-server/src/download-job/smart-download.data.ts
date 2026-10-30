import { Episode, Season, Torrent } from '@lani/db';
import {
  SmartDownloadSettings,
  SmartEpisode,
  SmartTorrent,
  SubtitleRequirement,
} from '@lani/smart-download';
import { torrentSubtitleInfo } from '@/admin/torrent-subtitle';

export function seasonSettings(season: Season): SmartDownloadSettings {
  return {
    subtitle: season.smartDownloadSubtitle as SubtitleRequirement,
    preferBaha: season.smartDownloadPreferBaha,
    windowHours: season.smartDownloadWindowHours,
    timeoutMinutes: season.smartDownloadTimeoutMinutes,
  };
}
export function smartEpisode(episode: Episode, offset: number): SmartEpisode {
  return {
    id: episode.id,
    type: episode.episodeType.toLowerCase(),
    number:
      episode.episodeNumber == null
        ? episode.index
        : Number(episode.episodeNumber),
    sort: episode.bangumiSort == null ? null : Number(episode.bangumiSort),
    // 从原始时间计算，保存配置后即使派生 airTime 尚未刷新也不重复施加偏移。
    airTime: episode.rawAirTime
      ? new Date(episode.rawAirTime.getTime() - offset * 3600000).toISOString()
      : episode.airTime?.toISOString() ?? null,
  };
}
export function smartTorrent(torrent: Torrent): SmartTorrent {
  return {
    id: torrent.id,
    hash: torrent.hash,
    title: torrent.title,
    publishDate: torrent.publishDate.toISOString(),
    episodeInfo: (
      torrent.parseResult as {
        episodeInfo?: SmartTorrent['episodeInfo'];
      } | null
    )?.episodeInfo,
    subtitleInfo: torrentSubtitleInfo({
      ...torrent,
      subtitleHasChs: torrent.subtitleHasCHS,
      subtitleHasCht: torrent.subtitleHasCHT,
      subtitleHasJp: torrent.subtitleHasJP,
    }),
    sourceType: torrent.sourceType,
    ready:
      torrent.parseVersion != null &&
      (torrent.channel !== 'NYAA' || torrent.metadataFetchedAt != null),
  };
}
