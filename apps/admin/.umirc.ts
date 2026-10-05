import { defineConfig } from 'umi';
import { initializeTheme, THEME_STORAGE_KEY } from './src/theme/bootstrap';

export default defineConfig({
  headScripts: [
    {
      content: `(${initializeTheme.toString()})(${JSON.stringify(
        THEME_STORAGE_KEY,
      )});`,
    },
  ],
  chainWebpack(config) {
    const rule = config.module.rule('less').oneOf('css');
    const postcssLoader = rule.use('postcss-loader').get('loader');
    for (const use of rule.uses.values()) {
      const loader = use.get('loader');
      if (loader?.includes('less-loader')) {
        const options = use.get('options');
        use.loader(require.resolve('./config/theme-loader.cjs')).options({
          loader,
          options,
          postcss: require.resolve('postcss', { paths: [postcssLoader] }),
        });
      }
    }
  },
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
    '/api/gateway': {
      target: 'http://localhost:8080/',
      changeOrigin: true,
      pathRewrite: { '^/api/gateway': '' },
    },
  },
  cssModulesTypescriptLoader: {},
  hash: true,
  ignoreMomentLocale: true,
  esbuild: {},
  antd: {},
  title: 'Lani管理后台',
});
