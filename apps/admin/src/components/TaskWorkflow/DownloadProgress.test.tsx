import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { DownloadProgress } from '@/generated/types';
import {
  DownloadProgressDetails,
  formatBytes,
  formatEta,
} from './DownloadProgress';

it('速度为零或 ETA 不可用时显示未知时间，正常时间补齐时分秒', () => {
  expect(formatEta(0, 60)).toBe('--:--:--');
  expect(formatEta(12, 8640000)).toBe('--:--:--');
  expect(formatEta(12, null)).toBe('--:--:--');
  expect(formatEta(12, 3661)).toBe('01:01:01');
  expect(formatBytes(1230000, 2)).toBe('1.23MB');
});
it('展示做种者和下载者，超额下载百分比不超过 100%', () => {
  const container = document.createElement('div');
  const progress: DownloadProgress = {
    id: 1,
    speed: 0,
    downloaded: '150',
    total: '100',
    eta: 12,
    seeds: 6,
    peers: 3,
  };
  const render = () =>
    act(() => {
      ReactDOM.render(
        <DownloadProgressDetails progress={progress} />,
        container,
      );
    });
  try {
    render();
    expect(container.textContent).toContain('下载进度');
    expect(container.textContent).toContain('100%');
    expect(container.textContent).toContain('--:--:--');
    expect(container.querySelector('[aria-label="check"]')).toBeNull();
    expect(container.querySelector('[title="做种者 6"]')).not.toBeNull();
    expect(container.querySelector('[title="下载者 3"]')).not.toBeNull();
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});
