import { MetadataSource } from '@lani/db';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

@InputType()
export class DownloadSourcesInput {
  id: number;
  pattern: string;
  offset: number;
}

@ObjectType()
export class SearchBangumiSeason {
  id: string;
  name: string;
  airDate?: string;
  image?: string;
  added: boolean;
}

@ObjectType()
export class JellyfinConfig {
  publicHost: string;
}

@ObjectType()
export class LaniaConfig {
  publicHost: string;
}

@ObjectType()
export class FeaturesConfig {
  lania: boolean;
}

@ObjectType()
export class PublicMatchingConfig {
  enabled: boolean;
  backend: string;
  mode?: string;
}

@ObjectType()
export class AdminConfig {
  jellyfin?: JellyfinConfig;
  lania?: LaniaConfig;
  features: FeaturesConfig;
  env: string;
  matching?: PublicMatchingConfig;
  smartDownloadTitleExcludes?: string[];
}

registerEnumType(MetadataSource, {
  name: 'MetadataSource',
});

// 部分字段不允许编辑
@InputType()
export class SaveSeasonPatch {
  airTime?: string;
  bangumiId?: string;
  bannerImageId?: number;
  bilibiliMainlandId?: string;
  bilibiliThmId?: string;
  // createdAt
  description?: string;
  downloadOffsetHours?: number;
  smartDownloadEnabled?: boolean;
  smartDownloadSubtitle?: string;
  smartDownloadPreferBaha?: boolean;
  smartDownloadWindowHours?: number;
  smartDownloadTimeoutMinutes?: number;
  episodesAutoSync?: boolean;
  // episodesLastSync
  @Field(() => MetadataSource)
  episodesSource?: MetadataSource;
  fanartImageId?: number;
  @Field(() => MetadataSource)
  infoSource?: MetadataSource;
  isMonitoring?: boolean;
  // jellyfinFolderId
  // jellyfinId
  // lastWriteTitle
  // lastWriteToDisk
  // mikanAnimeId
  needDownloadCc?: boolean;
  notifyMissing?: boolean;
  notifyPublish?: boolean;
  posterImageId?: number;
  tags?: string[];
  title?: string;
  tvdbId?: string;
  tvdbSeason?: number;
  weekday?: number;
  yearAndSemester?: string;
  sources: DownloadSourcesInput[];
  laniaSync?: boolean;
}

@ObjectType()
export class DownloadProgress {
  id: number;
  /**
   * 当前速度，单位: byte/s
   */
  speed: number;
  /**
   * 已下载量，单位：byte
   */
  @Field(() => BigInt)
  downloaded: bigint;
  /**
   * 总大小，单位：byte
   */
  @Field(() => BigInt)
  total: bigint;
  /**
   * 预期时间，单位：秒
   */
  eta?: number;
  /**
   * 下载者人数
   */
  peers?: number;
  /** 已连接的做种者人数 */
  seeds?: number;
}
