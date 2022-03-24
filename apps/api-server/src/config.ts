import { mergeConfig } from '@lani/framework';

const config = mergeConfig({
  proxy: 'http://hk1.v2ray:8889',
  sonarrEndpoint: 'http://sonarr.media:80/api/v3',
  redisHost: 'redis-master.lani',
  redisPassword: '',
  postgresURL:
    'postgresql://lani-api-server:DSyqrDALfxrBplO162VTAfkNsUqZXHgo@data-postgresql.postgres:5432/lani?schema=public',
  cosSecretId: 'AKIDXtzoNfgPs88qIVQ4RYOxFH3YmiOnwpSo',
  cosSecretKey: '6vTkkTv72g5E6hBPN3SaS3NQChvsXx6y',
  cosBucket: 'temp-1308701035',
  cosRegion: 'ap-shanghai',
  qbtEndpoint: 'http://qbittorrent.media:80/api/v2',
  qbtUsername: 'std4453',
  qbtPassword: 'dyQB2QT&8kFqRBe#',
  timeoutLocal: 5000,
  timeoutChina: 10000,
  timeoutGlobal: 30000,
})({
  dev: {
    proxy: 'http://10.43.154.118:8889',
    sonarrEndpoint: 'https://sonarr.std4453.com:444/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://postgres:a*qLweVSC!4yRvBNP%405VGfyR@10.43.222.73:5432/lani-offline?schema=public',
    qbtEndpoint: 'https://qbittorrent.std4453.com:444/api/v2',
    redisPassword: 'Hd75x0NJNblIC9o9pSalT5x9KXr5Hamg',
  },
  offline: {
    proxy: 'http://hk1.v2ray:8889',
    sonarrEndpoint: 'http://sonarr.media:80/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://lani-api-server:DSyqrDALfxrBplO162VTAfkNsUqZXHgo@data-postgresql.postgres:5432/lani-offline?schema=public',
    qbtEndpoint: 'https://qbittorrent.std4453.com:444/api/v2',
    redisPassword: 'Hd75x0NJNblIC9o9pSalT5x9KXr5Hamg',
  },
});

export default config;

export type ConfigType = typeof config;
