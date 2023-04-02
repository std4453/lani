import { store } from '@/store';
import { selectConfig } from '@/store/config';

export function jellyfinEpisodeLink(jellyfinEpisodeId: string) {
  const config = selectConfig(store.getState());
  if (!config?.jellyfin) {
    return '';
  }
  const {
    jellyfin: { publicHost },
  } = config;
  return `${publicHost}/web/index.html#!/details?id=${jellyfinEpisodeId}`;
}

export function jellyfinSeasonLink(jellyfinSeasonId: string) {
  const config = selectConfig(store.getState());
  if (!config?.jellyfin) {
    return '';
  }
  const {
    jellyfin: { publicHost },
  } = config;
  return `${publicHost}/web/index.html#!/details?id=${jellyfinSeasonId}`;
}

export function jellyfinFolderLink(jellyfinFolderId: string, type = 'tv') {
  const config = selectConfig(store.getState());
  if (!config?.jellyfin) {
    return '';
  }
  const {
    jellyfin: { publicHost },
  } = config;
  return `${publicHost}/web/index.html#!/${type}.html?topParentId=${jellyfinFolderId}`;
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
