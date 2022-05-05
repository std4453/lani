import { store } from '@/store';
import { selectConfig } from '@/store/config';

export function jellyfinEpisodeLink(jellyfinEpisodeId: string) {
  const config = selectConfig(store.getState());
  if (!config) {
    return '';
  }
  const {
    jellyfin: { host, serverId },
  } = config;
  return `${host}/web/index.html#!/details?serverId=${serverId}&id=${jellyfinEpisodeId}`;
}

export function jellyfinSeasonLink(jellyfinSeasonId: string) {
  const config = selectConfig(store.getState());
  if (!config) {
    return '';
  }
  const {
    jellyfin: { host, serverId },
  } = config;
  return `${host}/web/index.html#!/details?serverId=${serverId}&id=${jellyfinSeasonId}`;
}

export function bilibiliSeasonLink(ssid: string) {
  return `https://www.bilibili.com/bangumi/play/ss${ssid}`;
}

export function mikanAnimeLink(mikanAnimeId: string) {
  return `https://mikanani.me/Home/Bangumi/${mikanAnimeId}`;
}

export function bangumiLink(bangumiId: string) {
  return `https://bangumi.tv/subject/${bangumiId}`;
}

export function tvdbLinkById(tvdbId: string) {
  return `https://www.thetvdb.com/dereferrer/series/${tvdbId}`;
}
