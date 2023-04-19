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
export class AdminConfig {
  jellyfin?: JellyfinConfig;
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
}

@ObjectType()
export class DownloadJobStatus {
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
   * 做种人数
   */
  peers?: number;
}
