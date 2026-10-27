import { Episode } from '@lani/db';
import dayjs from 'dayjs';
import { DateFormat } from '@/constants/date-format';
import { episodeLabel, jellyfinNumber } from './episode-number';

export function episodeNfo(episode: Episode) {
  const { season, index } = jellyfinNumber(episode);
  return {
    title: [
      season === 0
        ? `${episodeLabel(episode)} - ${episode.title}`
        : episode.title,
    ],
    ...(episode.description ? { plot: [episode.description] } : {}),
    season: [season],
    episode: [index],
    ...(episode.airTime
      ? { aired: [dayjs(episode.airTime).format(DateFormat.BarDay)] }
      : {}),
    uniqueid: [
      { $: { type: 'lani', default: 'true' }, _: episode.id },
      ...(episode.dandanplayEpisodeId
        ? [
            {
              $: { type: 'DanmuID' },
              _: `dandan:${episode.dandanplayEpisodeId}`,
            },
          ]
        : []),
    ],
  };
}
