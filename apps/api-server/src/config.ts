import { PathMapping } from '@/utils/path';
import { mergeConfig } from '@lani/framework';

export interface COSBucket {
  bucket: string;
  region: string;
}

const config = mergeConfig({
  hk1Proxy: 'http://hk1.v2ray:8889',
  globalProxy: 'http://v2ray.v2ray:8889',
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
  timeoutChina: 15000,
  timeoutGlobal: 30000,
  mediaRoot: '/media',
  qbtPathMapping: [] as PathMapping,
  jellyfinEndpoint: 'http://jellyfin-server-prod.media:80',
  jellyfinToken: '231e55e0d1c240cd9e58cc47f61f521b',
  jellyfinUserId: '786d13a822ed4f6ba27b28f5cf374133',
  jellyfinPathMapping: [] as PathMapping,
  imagesBucket: {
    bucket: 'lani-images-1308701035',
    region: 'ap-shanghai',
  } as COSBucket,
})({
  dev: {
    sonarrEndpoint: 'https://sonarr.std4453.com:444/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://postgres:a*qLweVSC!4yRvBNP%405VGfyR@10.43.222.73:5432/lani-offline?schema=public',
    qbtEndpoint: 'https://qbittorrent.std4453.com:444/api/v2',
    redisPassword: 'Hd75x0NJNblIC9o9pSalT5x9KXr5Hamg',
    mediaRoot: '/data/std4453/services/media/media',
    qbtPathMapping: [
      {
        from: '/downloads',
        to: '/data/std4453/services/media/downloads',
      },
    ] as PathMapping,
    jellyfinEndpoint: 'https://jellyfin.std4453.com:444',
    jellyfinPathMapping: [
      {
        from: '/media',
        to: '/data/std4453/services/media/media',
      },
    ],
  },
  offline: {
    sonarrEndpoint: 'http://sonarr.media:80/api/v3',
    redisHost: 'redis-master.lani-offline',
    postgresURL:
      'postgresql://lani-api-server:DSyqrDALfxrBplO162VTAfkNsUqZXHgo@data-postgresql.postgres:5432/lani-offline?schema=public',
    qbtEndpoint: 'https://qbittorrent.std4453.com:444/api/v2',
    redisPassword: 'Hd75x0NJNblIC9o9pSalT5x9KXr5Hamg',
    mediaRoot: '/media/media',
    qbtPathMapping: [
      {
        from: '/downloads',
        to: '/media/downloads',
      },
    ] as PathMapping,
    jellyfinPathMapping: [
      {
        from: '/media',
        to: '/media/media',
      },
    ],
  },
});

export default config;

export type ConfigType = typeof config;
