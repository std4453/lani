const JELLYFIN_HOST = `https://jellyfin.std4453.com:444`;
const JELLYFIN_SERVER_ID = '510e48488c4e4a6b981894df79711cdc';

export function jellyfinEpisodeLink(jellyfinEpisodeId: string) {
  return `${JELLYFIN_HOST}/web/index.html#!/details?serverId=${JELLYFIN_SERVER_ID}&id=${jellyfinEpisodeId}`;
}
