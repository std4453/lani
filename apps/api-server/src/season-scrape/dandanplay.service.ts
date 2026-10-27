import { GlobalAxiosService } from '@/common/axios.service';
import { Injectable, Logger } from '@nestjs/common';
import { SeasonEpisode } from './index.model';

interface DandanEpisode {
  episodeId: number | string;
  episodeNumber: string;
}

interface DandanResponse {
  success: boolean;
  bangumi?: { animeId: number | string; episodes: DandanEpisode[] };
}

const endpoint = 'https://api.danmaku.weeblify.app/ddp/v1';

export function dandanId(value: unknown): string | undefined {
  const id = String(value ?? '');
  return /^[1-9]\d*$/.test(id) ? id : undefined;
}

/** 正片按整数集号匹配；SP 按 Bangumi 出现顺序对应 S1、S2，其他类型忽略。 */
export function mapDandanEpisodes(
  episodes: SeasonEpisode[],
  remote: DandanEpisode[],
): Map<SeasonEpisode, string> {
  const byNumber = new Map<string, string | undefined>();
  for (const item of remote) {
    if (!item || typeof item.episodeNumber !== 'string') continue;
    const number = String(item.episodeNumber).toUpperCase();
    const id = dandanId(item.episodeId);
    byNumber.set(number, byNumber.has(number) ? undefined : id);
  }
  let special = 0;
  const result = new Map<SeasonEpisode, string>();
  for (const episode of episodes) {
    const type = episode.episodeType ?? 'EPISODE';
    const value = episode.episodeNumber ?? episode.index;
    const number = value == null ? NaN : Number(value);
    const key =
      type === 'SP'
        ? `S${++special}`
        : type === 'EPISODE' && Number.isInteger(number) && number >= 0
        ? String(number)
        : undefined;
    const id = key === undefined ? undefined : byNumber.get(key);
    if (id) result.set(episode, id);
  }
  return result;
}

@Injectable()
export class DandanplayService {
  private readonly logger = new Logger(DandanplayService.name);

  constructor(private readonly http: GlobalAxiosService) {}

  private async fetch(path: string) {
    try {
      const { data } = await this.http.get<DandanResponse>(endpoint, {
        params: { path },
        timeout: 10000,
      });
      if (!data.success || !data.bangumi || !dandanId(data.bangumi.animeId)) {
        this.logger.warn(`Dandanplay lookup returned no mapping for ${path}`);
        return undefined;
      }
      return data.bangumi;
    } catch (error) {
      this.logger.warn(
        `Dandanplay lookup failed for ${path}: ${error.message}`,
      );
      return undefined;
    }
  }

  async findAnime(bangumiId: string) {
    if (!dandanId(bangumiId)) return undefined;
    const bangumi = await this.fetch(`/v2/bangumi/bgmtv/${bangumiId}`);
    return bangumi ? dandanId(bangumi.animeId) : undefined;
  }

  async findEpisodes(animeId: string, episodes: SeasonEpisode[]) {
    if (!dandanId(animeId)) return undefined;
    const bangumi = await this.fetch(`/v2/bangumi/${animeId}`);
    if (
      !bangumi ||
      dandanId(bangumi.animeId) !== animeId ||
      !Array.isArray(bangumi.episodes)
    )
      return undefined;
    return mapDandanEpisodes(episodes, bangumi.episodes);
  }
}
