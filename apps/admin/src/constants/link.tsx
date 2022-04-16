const JELLYFIN_HOST = `https://jellyfin.std4453.com:444`;
const JELLYFIN_SERVER_ID = '510e48488c4e4a6b981894df79711cdc';

export function jellyfinEpisodeLink(jellyfinEpisodeId: string) {
  return `${JELLYFIN_HOST}/web/index.html#!/details?serverId=${JELLYFIN_SERVER_ID}&id=${jellyfinEpisodeId}`;
}

export function jellyfinSeasonLink(jellyfinSeasonId: string) {
  return `${JELLYFIN_HOST}/web/index.html#!/details?serverId=${JELLYFIN_SERVER_ID}&id=${jellyfinSeasonId}`;
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
