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
          redirect: '/seasons',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/seasons',
          exact: true,
          component: '@/pages/seasons',
          name: '季度列表',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/season/:id',
          exact: true,
          component: '@/pages/season',
          title: '季度详情',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/torrents',
          exact: true,
          component: '@/pages/torrents',
          name: '种子列表',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/jobs',
          exact: true,
          component: '@/pages/jobs',
          name: '下载任务',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/folders',
          exact: true,
          component: '@/pages/folders',
          name: '媒体库管理',
          wrappers: ['@/wrappers/auth'],
        },
        {
          path: '/redirect',
          exact: true,
          component: '@/pages/302',
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
