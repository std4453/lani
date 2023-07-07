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

const laniConfig = opt(
  obj({
    moveStrategy: opt(
      either(
        ...([
          'hardLinkOnly',
          'hardLinkOrCopy',
          'hardLinkOrMove',
          'copyOnly',
          'moveOnly',
        ] as const),
      ),
      'hardLinkOrMove',
    ),
    publicHost: opt(str()),
  }),
  {
    moveStrategy: 'hardLinkOrCopy',
  },
);

const s3Config = ext<AWS.S3.Types.ClientConfiguration>()(
  obj({
    bucket: str(),
    publicHost: opt(str()),
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
  postgresUrl: str(),
  s3: s3Config,
  downloadClient: downloadClientConfig,
  jellyfin: jellyfinConfig,
  notifications: notificationsConfig,
  lani: laniConfig,
  integrations: integrationsConfig,
  features: featuresConfig,
});

export type RootConfig = T<typeof rootConfig>;
