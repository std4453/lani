import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import loader from '../config/theme-loader.cjs';

const umiRequire = createRequire(require.resolve('umi/package.json'));
const bundlerRequire = createRequire(
  umiRequire.resolve('@umijs/bundler-webpack/package.json'),
);
const postcssPath = require.resolve('postcss', {
  paths: [bundlerRequire.resolve('postcss-loader')],
});
const postcss = require(postcssPath);

function compile(
  resourcePath: string,
  source = readFileSync(resourcePath, 'utf8'),
): Promise<string> {
  return new Promise((resolve, reject) =>
    loader.call(
      {
        resourcePath,
        getOptions: () => ({
          loader: require.resolve('./fixtures/less-loader.cjs'),
          options: { javascriptEnabled: true },
          postcss: postcssPath,
        }),
        async: () => (error: Error, css: string) =>
          error ? reject(error) : resolve(css),
      },
      source,
    ),
  );
}

function declaration(css: string, selector: string, property: string) {
  let result;
  postcss.parse(css).walkRules((rule) => {
    if (rule.selectors.includes(selector))
      rule.walkDecls(property, (decl) => (result = decl.value));
  });
  return result;
}

test('antd and Pro compile genuinely different palettes, including imported mixins', async () => {
  const css = await compile(require.resolve('antd/es/table/style/index.less'));
  assert.equal(declaration(css, '.ant-table', 'background'), '#fff');
  assert.equal(
    declaration(
      css,
      ':where(html[data-theme="dark"]) .ant-table',
      'background',
    ),
    '#141414',
  );
  const pro = await compile(
    require.resolve(
      '@ant-design/pro-layout/es/components/SiderMenu/index.less',
    ),
  );
  assert.notEqual(
    declaration(pro, '.ant-pro-sider', 'background-color'),
    declaration(
      pro,
      ':where(html[data-theme="dark"]) .ant-pro-sider',
      'background-color',
    ),
  );
});

test('business variables match the two component palettes', async () => {
  const css = await compile(require.resolve('../src/styles/theme.less'));
  assert.equal(declaration(css, ':root', '--lani-surface'), '#fff');
  assert.equal(
    declaration(css, "html[data-theme='dark']", '--lani-surface'),
    '#141414',
  );
});

test('dark selectors include root rules and isolate animation names', async () => {
  const css = await compile(
    require.resolve('antd/es/table/style/index.less'),
    'html, body { color: red; } @keyframes demo { to { opacity: 1; } } .demo { animation: demo 1s; }',
  );
  assert.equal(
    declaration(css, 'html:where([data-theme="dark"])', 'color'),
    'red',
  );
  assert.equal(
    declaration(css, ':where(html[data-theme="dark"]) body', 'color'),
    'red',
  );
  assert.equal(declaration(css, '.demo', 'animation'), 'demo 1s');
  assert.equal(
    declaration(css, ':where(html[data-theme="dark"]) .demo', 'animation'),
    'lani-dark-demo 1s',
  );
  assert.match(css, /@keyframes lani-dark-demo/);
  assert.doesNotMatch(css, /:where\([^\n]+\) to/);
});

test('Less compilation failures propagate to the build', async () => {
  await assert.rejects(
    compile(
      require.resolve('../src/styles/theme.less'),
      '.x { color: @missing; }',
    ),
  );
});
