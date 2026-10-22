const mutate = jest.fn();
const modify = jest.fn();
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({
    mutate,
    cache: { identify: ({ id }: { id: number }) => `Torrent:${id}`, modify },
  }),
}));
jest.mock('umi', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { message } from 'antd';
import { TorrentMatchStatus } from '@/generated/types';
import TorrentSeason from './TorrentSeason';

const torrent = {
  id: 42,
  matchStatus: TorrentMatchStatus.Matched,
  matchedAt: '2026-10-22T00:00:00Z',
  matchedSeasonId: 7,
  seasonByMatchedSeasonId: { id: 7, title: '测试动画 第二季' },
};
let container: HTMLDivElement;
beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(message, 'success').mockImplementation(jest.fn());
  jest.spyOn(message, 'error').mockImplementation(jest.fn());
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  jest.restoreAllMocks();
});
function render(status: TorrentMatchStatus = TorrentMatchStatus.Matched) {
  act(() => {
    ReactDOM.render(
      <>
        <TorrentSeason torrent={{ ...torrent, matchStatus: status }}>
          <span>原始名称标签</span>
        </TorrentSeason>
        <TorrentSeason torrent={{ ...torrent, id: 43 }}>
          <span>另一行名称标签</span>
        </TorrentSeason>
      </>,
      container,
    );
  });
}
function click() {
  act(() => {
    container
      .querySelector('button')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

it('shows the season link and only refreshes its own cell after cancellation', async () => {
  let complete!: (value: unknown) => void;
  mutate.mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    }),
  );
  render();
  expect(container.querySelector('a')?.getAttribute('href')).toBe('/season/7');
  expect(container.textContent).not.toContain('原始名称标签');
  click();
  expect(container.querySelector('button')!.className).toContain(
    'ant-btn-loading',
  );
  click();
  expect(mutate).toHaveBeenCalledTimes(1);
  expect(mutate.mock.calls[0][0].variables).toEqual({ torrentId: 42 });
  await act(async () => {
    complete({ data: { cancelTorrentSeasonMatch: true } });
  });
  expect(container.querySelectorAll('a')).toHaveLength(1);
  expect(container.textContent).toContain('原始名称标签');
  expect(container.textContent).not.toContain('用户主动取消关联');
  expect(container.textContent).not.toContain('另一行名称标签');
  expect(modify).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'Torrent:42' }),
  );
  expect(message.success).toHaveBeenCalledWith('取消关联成功');
});

it.each([new Error('offline'), { data: { cancelTorrentSeasonMatch: false } }])(
  'preserves the link and clears loading when cancellation fails',
  async (result) => {
    mutate.mockImplementation(() =>
      result instanceof Error
        ? Promise.reject(result)
        : Promise.resolve(result),
    );
    render();
    await act(async () => {
      click();
    });
    expect(container.querySelectorAll('a')).toHaveLength(2);
    expect(container.querySelector('button')!.className).not.toContain(
      'ant-btn-loading',
    );
    expect(modify).not.toHaveBeenCalled();
    expect(message.error).toHaveBeenCalledWith('取消关联失败');
    expect(message.success).not.toHaveBeenCalled();
  },
);

it.each([
  TorrentMatchStatus.NoMatch,
  TorrentMatchStatus.Pending,
  TorrentMatchStatus.Unsupported,
  TorrentMatchStatus.Dismissed,
])(
  'keeps parsed names for %s without exposing a stale season link',
  (status) => {
    render(status);
    expect(container.querySelectorAll('a')).toHaveLength(1);
    expect(container.textContent).toContain('原始名称标签');
    expect(container.textContent?.includes('用户主动取消关联')).toBe(false);
  },
);
