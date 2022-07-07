import {
  DownloadClientConfig,
  downloadClientKinds,
  Enabled,
  JellyfinConfig,
  LaniConfig,
  LarkConfig,
  managementNotificationKinds,
  NetworkConfig,
  NotificationsConfig,
  ProxyConfig,
  QBittorrentConfig,
  RootConfig,
  S3Config,
  TimeoutConfig,
  userNotificationKinds,
} from '@/config/types';
import { PathMapping } from '@/utils/path';
import Joi from 'joi';

function pathMappingSchema(): Joi.AnySchema<PathMapping> {
  return Joi.array()
    .items(
      Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
      }),
    )
    .default([]);
}

function qbittorrentConfigSchema(): Joi.ObjectSchema<QBittorrentConfig> {
  return Joi.object({
    apiEndpoint: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
}

function downloadClientConfigSchema(): Joi.ObjectSchema<DownloadClientConfig> {
  return Joi.object({
    kind: Joi.allow(...downloadClientKinds).required(),
    qbittorrent: qbittorrentConfigSchema(),
    pathMapping: pathMappingSchema(),
  });
}

function jellyfinConfigSchema(): Joi.ObjectSchema<JellyfinConfig> {
  return Joi.object({
    apiEndpoint: Joi.string().uri().required(),
    apiToken: Joi.string().required(),
    dummyUserId: Joi.string().required(),
    pathMapping: pathMappingSchema(),
    publicHost: Joi.string().uri().default(Joi.ref('apiEndpoint')),
  });
}

function laniConfigSchema(): Joi.ObjectSchema<LaniConfig> {
  return Joi.object({
    mediaRoot: Joi.string().required(),
    publicHost: Joi.string().uri().required(),
  });
}

function s3ConfigSchema(): Joi.ObjectSchema<S3Config> {
  return Joi.object({
    bucket: Joi.string().required(),
  }).pattern(Joi.string(), Joi.any());
}

function larkConfigSchema(): Joi.ObjectSchema<LarkConfig> {
  return Joi.object({
    appId: Joi.string().required(),
    appSecret: Joi.string().required(),
    encryptKey: Joi.string(),
    verificationToken: Joi.string(),
    adminChatId: Joi.string().required(),
  });
}

function enabledSchema<T>(
  schema: Joi.ObjectSchema<T>,
): Joi.AnySchema<Enabled<T>> {
  return Joi.alternatives()
    .try(
      Joi.object({
        enabled: Joi.allow(true).required(),
      }),
      schema.append({
        enabled: Joi.allow(false).required(),
      }),
    )
    .default({
      enabled: false,
    });
}

function notificationsConfigSchema(): Joi.ObjectSchema<NotificationsConfig> {
  return Joi.object({
    management: enabledSchema(
      Joi.object({
        kind: Joi.allow(...managementNotificationKinds).required(),
      }),
    ),
    user: enabledSchema(
      Joi.object({
        kind: Joi.allow(...userNotificationKinds).required(),
      }),
    ),
    lark: larkConfigSchema(),
  });
}

function timeoutConfigSchema(): Joi.ObjectSchema<TimeoutConfig> {
  return Joi.object({
    global: Joi.number().min(0).default(Joi.ref('default')),
    hk: Joi.number().min(0).default(Joi.ref('global')),
    local: Joi.number().min(0).default(Joi.ref('default')),
    default: Joi.number().min(0).default(0),
  }).default({
    global: 0,
    hk: 0,
    local: 0,
    default: 0,
  });
}

function proxySchema() {
  return Joi.string().uri({
    scheme: ['http'],
  });
}

function proxyConfigSchema(): Joi.ObjectSchema<ProxyConfig> {
  return Joi.object({
    hk: proxySchema(),
    global: proxySchema(),
    default: proxySchema(),
  });
}

function networkConfigSchema(): Joi.ObjectSchema<NetworkConfig> {
  return Joi.object({
    proxy: enabledSchema(proxyConfigSchema()),
    timeout: timeoutConfigSchema(),
  });
}

export function rootConfigSchema(): Joi.ObjectSchema<RootConfig> {
  return Joi.object({
    network: networkConfigSchema().required(),
    postgresUrl: Joi.string().required(),
    s3: s3ConfigSchema().required(),
    downloadClient: downloadClientConfigSchema().required(),
    jellyfin: jellyfinConfigSchema().required(),
    notifications: notificationsConfigSchema().required(),
    lani: laniConfigSchema().required(),
  });
}
