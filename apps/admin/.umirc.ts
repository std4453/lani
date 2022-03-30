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
          name: '元数据',
        },
        // {
        //   path: '/season/:id',
        //   exact: true,
        //   component: '@/pages/season',
        // },
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
});
