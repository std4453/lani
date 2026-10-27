import { GlobalAxiosService } from '@/common/axios.service';
import config from '@/config';
import { DandanplayConfig } from '@/config/dandanplay';
import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { SeasonEpisode } from './index.model';

interface DandanEpisode {
  episodeId: number | string;
  episodeNumber: string;
}

interface DandanResponse {
  success: boolean;
  bangumi?: { animeId: number | string; episodes: DandanEpisode[] };
}

export function dandanplayRequest(
  path: string,
  channel: Exclude<DandanplayConfig, false>,
  timestamp = Math.floor(Date.now() / 1000),
) {
  if (channel.kind === 'publicProxy') {
    return {
      url: 'https://api.danmaku.weeblify.app/ddp/v1',
      options: { params: { path }, timeout: 10000 },
    };
  }
  const apiPath = `/api${path}`;
  // 官方签名只包含 URL path，不包含域名或 query。密钥不发送给公开代理。
  const signature = createHash('sha256')
    .update(`${channel.appId}${timestamp}${apiPath}${channel.appSecret}`)
    .digest('base64');
  return {
    url: `https://api.dandanplay.net${apiPath}`,
    options: {
      headers: {
        'X-AppId': channel.appId,
        'X-Timestamp': String(timestamp),
        'X-Signature': signature,
      },
      timeout: 10000,
    },
  };
}

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
    if (!config.dandanplay) return undefined;
    try {
      const request = dandanplayRequest(path, config.dandanplay);
      this.logger.debug(
        `Dandanplay request ${path} via ${config.dandanplay.kind}`,
      );
      const { data } = await this.http.get<DandanResponse>(
        request.url,
        request.options,
      );
      if (!data.success || !data.bangumi || !dandanId(data.bangumi.animeId)) {
        this.logger.warn(`Dandanplay lookup returned no mapping for ${path}`);
        return undefined;
      }
      return data.bangumi;
    } catch {
      // Axios 错误可能包含带认证头的请求配置，不输出原始错误。
      this.logger.warn(`Dandanplay lookup failed for ${path}`);
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
