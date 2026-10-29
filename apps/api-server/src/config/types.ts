import { torrentRetentionConfig } from './torrent-retention';
import { torrentsConfig } from './torrents';
import { matchingConfig } from './matching';
import { llmConfig } from './llm';
import { dandanplayConfig } from './dandanplay';
import {
  obj,
  opt,
  str,
  arr,
  ext,
  kind,
  enabled,
  either,
  num,
  or,
  T,
  root,
  bool,
} from '@lani/framework';

const pathMappingConfig = opt(
  arr(
    obj({
      from: str(),
      to: str(),
    }),
  ),
  [],
);

const qbittorrentConfig = obj({
  apiEndpoint: str(),
  publicHost: opt(str()),
  username: str(),
  password: str(),
  pathMapping: pathMappingConfig,
  retention: torrentRetentionConfig,
});
export type QBittorrentConfig = T<typeof qbittorrentConfig>;

const downloadClientConfig = kind({
  qbittorrent: qbittorrentConfig,
});

const jellyfinConfig = obj({
  apiEndpoint: str(),
  publicHost: opt(str()),
  apiToken: str(),
  dummyUserId: str(),
  pathMapping: pathMappingConfig,
});

const laniConfig = opt(obj({ publicHost: opt(str()) }), {});

export const s3Config = ext<AWS.S3.Types.ClientConfiguration>()(
  obj({
    bucket: str(),
    publicHost: opt(str()),
    proxyEnabled: opt(bool(), true),
  }),
);

const larkConfig = obj({
  appId: str(),
  appSecret: str(),
  encryptKey: opt(str()),
  verificationToken: opt(str()),
  adminChatId: str(),
});
export type LarkConfig = T<typeof larkConfig>;

const notificationsConfig = opt(
  obj({
    management: enabled(
      obj({
        kind: either('lark'),
      }),
    ),
    user: enabled(
      obj({
        kind: either('lark'),
      }),
    ),
    lark: opt(larkConfig),
  }),
  {
    management: { enabled: false },
    user: { enabled: false },
  },
);

const timeoutConfig = opt(
  or(
    num(),
    obj({
      global: num(),
      hk: opt(num()),
      china: num(),
      local: num(),
    }),
  ),
  {
    global: 30000,
    china: 15000,
    local: 5000,
  },
);

const proxyConfig = opt(
  or(
    str(),
    obj({
      global: str(),
      hk: str(),
    }),
  ),
);

const networkConfig = opt(
  obj({
    proxy: proxyConfig,
    timeout: timeoutConfig,
  }),
  {
    timeout: {
      global: 30000,
      hk: undefined,
      china: 15000,
      local: 5000,
    },
  },
);

const laniaConfig = enabled(
  obj({
    agentEndpoint: str(),
    authKey: opt(str(), ''),
    publicHost: str(),
  }),
);

const integrationsConfig = opt(
  obj({
    lania: laniaConfig,
  }),
  {
    lania: {
      enabled: false,
    },
  },
);

const featuresConfig = opt(
  obj({
    lania: opt(bool(), false),
  }),
  {
    lania: false,
  },
);

export const rootConfig = root({
  network: networkConfig,
  torrents: torrentsConfig,
  matching: matchingConfig,
  llm: llmConfig,
  dandanplay: dandanplayConfig,
  postgresUrl: str(),
  mediaPool: obj({
    root: str(),
    painfullyAcceptCrossDeviceCopy: opt(bool(), false),
  }),
  s3: s3Config,
  downloadClient: downloadClientConfig,
  jellyfin: jellyfinConfig,
  notifications: notificationsConfig,
  lani: laniConfig,
  integrations: integrationsConfig,
  features: featuresConfig,
});

export type RootConfig = T<typeof rootConfig>;
