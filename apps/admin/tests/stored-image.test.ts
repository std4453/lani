import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import StoredImage from '../src/components/StoredImage';

for (const src of [undefined, null, '']) {
  test(`missing source (${String(src)}) renders nothing`, () => {
    const html = renderToStaticMarkup(
      createElement(StoredImage, { src, reload: async () => undefined }),
    );
    assert.equal(html, '');
  });
}

test('an existing source loads the real image with a loading indicator', () => {
  const html = renderToStaticMarkup(
    createElement(StoredImage, {
      src: '/api/gateway/storage/poster.jpg?Signature=test',
      reload: async () => undefined,
    }),
  );
  assert.match(html, /src="\/api\/gateway\/storage\/poster.jpg\?Signature=test"/);
  assert.match(html, /ant-spin/);
  assert.doesNotMatch(html, /暂无图片|图片加载失败|<button\b/);
});
