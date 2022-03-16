import { mergeConfig } from '@lani/framework';

const config = mergeConfig({
  proxy: 'http://hk1.v2ray:8889',
  endpoint: 'http://data-server:8080/graphql',
  dbAddress: 'data-postgresql.postgres',
  dbPort: 5432,
  dbUser: '',
  dbPassword: '',
  dbName: 'lani',
})({
  dev: {
    proxy: 'http://10.43.154.118:8889',
    endpoint: 'https://lani.i.std4453.com/api/data-server/graphql',
    dbAddress: '10.43.222.73',
    dbUser: 'postgres',
    dbPassword: 'a*qLweVSC!4yRvBNP@5VGfyR',
    dbName: 'lani-offline',
  },
});

export default config;

export type ConfigType = typeof config;
