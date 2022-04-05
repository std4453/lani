import { defineConfig } from 'umi';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/index',
      routes: [
        {
          path: '/',
          exact: true,
          component: '@/pages/index',
          name: '首页',
        },
        {
          path: '/metadata',
          exact: true,
          component: '@/pages/metadata',
          name: '季度列表',
        },
        {
          path: '/season/:id',
          exact: true,
          component: '@/pages/season',
          title: '季度详情',
        },
        {
          path: '/torrents',
          exact: true,
          component: '@/pages/torrents',
          name: '种子列表',
        },
        { component: '@/pages/404' },
      ],
    },
  ],
  fastRefresh: {},
  mfsu: {},
  proxy: {
    '/api': {
      target: 'https://lani.i.std4453.com',
      changeOrigin: true,
    },
  },
  cssModulesTypescriptLoader: {},
  hash: true,
  ignoreMomentLocale: true,
  esbuild: {},
  antd: {},
  title: 'Lani管理后台',
});
