import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DownloadStatusTag, EpisodeStatus } from './download-status';

it.each<[EpisodeStatus, string, string]>([
  ['DOWNLOAD_FAILED', '任务失败', 'red'],
  ['CANCELLING', '取消中', 'orange'],
  ['CANCELLED', '已取消', 'default'],
])('状态 %s 覆盖步骤文案，并使用任务状态颜色', (status, text, color) => {
  const html = renderToStaticMarkup(
    <DownloadStatusTag status={status} label="写入元数据 · 旧状态" />,
  );
  expect(html).toContain(text);
  if (color !== 'default') expect(html).toContain(`ant-tag-${color}`);
  else expect(html).not.toMatch(/ant-tag-(red|orange|purple)/);
  expect(html).not.toContain('写入元数据');
});

it('进行中的任务仍显示自定义步骤标题及步骤颜色', () => {
  const html = renderToStaticMarkup(
    <DownloadStatusTag status="writeMetadata" label="自定义元数据步骤" />,
  );
  expect(html).toContain('自定义元数据步骤');
  expect(html).toContain('ant-tag-purple');
});
