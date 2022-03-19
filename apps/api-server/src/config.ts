import { mergeConfig } from '@lani/framework';

export interface ConfigType {
  proxy: string;
  sonarrEndpoint: string;
  redisHost: string;
  postgresURL: string;
}

const config = mergeConfig<ConfigType>({
  proxy: 'http://hk1.v2ray:8889',
  sonarrEndpoint: 'http://sonarr.media:80/api/v3',
  redisHost: 'redis-master.lani',
  postgresURL:
    'postgresql://lani-api-server:DSyqrDALfxrBplO162VTAfkNsUqZXHgo@data-postgresql.postgres:5432/lani?schema=public',
})({
  dev: {
    proxy: 'http://10.43.154.118:8889',
    sonarrEndpoint: 'https://sonarr.std4453.com:444/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://postgres:a*qLweVSC!4yRvBNP%405VGfyR@10.43.222.73:5432/lani-offline?schema=public',
  },
  offline: {
    proxy: 'http://hk1.v2ray:8889',
    sonarrEndpoint: 'http://sonarr.media:80/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://lani-api-server:DSyqrDALfxrBplO162VTAfkNsUqZXHgo@data-postgresql.postgres:5432/lani-offline?schema=public',
  },
});

export default config;
