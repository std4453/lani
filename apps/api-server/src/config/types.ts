import { PathMapping } from '@/utils/path';

export interface QBittorrentConfig {
  apiEndpoint: string;
  username: string;
  password: string;
}

export const downloadClientKinds = ['qbittorrent'] as const;
export type DownloadClientKind = typeof downloadClientKinds[number];

export interface DownloadClientConfig {
  kind: DownloadClientKind;
  qbittorrent?: QBittorrentConfig;
  pathMapping: PathMapping;
}

export interface JellyfinConfig {
  apiEndpoint: string;
  apiToken: string;
  dummyUserId: string;
  pathMapping: PathMapping;
  publicHost: string;
}

export interface LaniConfig {
  mediaRoot: string;
  publicHost: string;
}

export interface COSBucket {
  bucket: string;
  region: string;
}

export interface COSConfig {
  secretId: string;
  secretKey: string;
  imagesBucket: COSBucket;
}

export interface LarkConfig {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
  adminChatId: string;
}

export type Enabled<T> = { enabled: false } | ({ enabled: true } & T);

export const managementNotificationKinds = ['lark'] as const;
export type ManagementNotificationKind =
  typeof managementNotificationKinds[number];
export const userNotificationKinds = ['lark'] as const;
export type UserNotificationKind = typeof userNotificationKinds[number];

export interface NotificationsConfig {
  management: Enabled<{ kind: ManagementNotificationKind }>;
  user: Enabled<{ kind: UserNotificationKind }>;
  lark?: LarkConfig;
}

export interface TimeoutConfig {
  global: number;
  hk: number;
  local: number;
  default: number;
}

export interface ProxyConfig {
  hk?: string;
  global?: string;
  default?: string;
}

export interface NetworkConfig {
  proxy: Enabled<ProxyConfig>;
  timeout: TimeoutConfig;
}

export interface RootConfig {
  network: NetworkConfig;
  postgresUrl: string;
  cos: COSConfig;
  downloadClient: DownloadClientConfig;
  jellyfin: JellyfinConfig;
  notifications: NotificationsConfig;
  lani: LaniConfig;
}
