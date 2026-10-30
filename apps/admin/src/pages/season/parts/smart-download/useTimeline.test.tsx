import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { defaultSettings, SmartEpisode } from '@lani/smart-download';
import { previewRows } from './preview-rows';
import { PreviewCache, PreviewPage, PreviewRequest } from './preview-cache';

import { useTimeline } from './useTimeline';

const base = Date.parse('2020-01-01T00:00:00Z');
const hour = 3600000;
const now = base + 100 * hour;
const torrents = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  hash: String(i),
  title: 'test',
  size: '100',
  publishDate: new Date(base + (i - 60) * hour).toISOString(),
}));
function page({ first, before, from, after }: PreviewRequest): PreviewPage {
  const filtered = torrents.filter(
    (torrent) =>
      (!before || Date.parse(torrent.publishDate) < Date.parse(before)) &&
      (!from || Date.parse(torrent.publishDate) >= Date.parse(from)) &&
      (!after || torrent.id > Number(after)),
  );
  const nodes = before ? filtered.slice(-first) : filtered.slice(0, first);
  return {
    nodes,
    cursor: String(nodes[nodes.length - 1]?.id ?? ''),
    hasMore: filtered.length > first,
    excludes: [],
  };
}
let container: HTMLDivElement;
let current: ReturnType<typeof useTimeline>;
let offset: (hours: number) => void;
let fetch: jest.Mock;
let cache: PreviewCache;
function Harness({
  cache,
  enabled = true,
}: {
  cache: PreviewCache;
  enabled?: boolean;
}) {
  const [hours, setHours] = useState(0);
  const makeDirectory = (value: number): SmartEpisode[] =>
    [0, 12, 24].map((time, i) => ({
      id: i + 1,
      number: i + 1,
      sort: i + 1,
      type: 'episode',
      airTime: new Date(base + (time - value) * hour).toISOString(),
    }));
  const directory = useMemo(() => makeDirectory(hours), [hours]);
  current = useTimeline(cache, directory, now, enabled);
  offset = (value) => {
    current.beforeOffsetChange(makeDirectory(value));
    setHours(value);
  };
  const view = current.view;
  const rows = view
    ? previewRows(
        view.directory,
        view.preview.nodes,
        defaultSettings,
        now,
        [],
        view.preview.coverage,
      )
    : [];
  return (
    <div ref={current.viewport}>
      <table>
        <tbody>
          {rows.slice(0, current.count).map((row) => (
            <tr
              key={row.key}
              data-release-ids={row.release?.episodeIds.join(',')}
            >
              <td>{row.key}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
    await Promise.resolve();
  });
}
beforeEach(async () => {
  jest.useFakeTimers();
  container = document.createElement('div');
  document.body.appendChild(container);
  fetch = jest.fn(async (request: PreviewRequest) => page(request));
  cache = new PreviewCache(fetch);
  act(() => {
    ReactDOM.render(<Harness cache={cache} />, container);
  });
  await advance(0);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  jest.useRealTimers();
});
function position(top = 140) {
  const viewport = current.viewport.current!;
  viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
  viewport.scrollTop = 500;
  const row = viewport.querySelector<HTMLElement>('[data-release-ids="1"]')!;
  row.getBoundingClientRect = () => ({ top } as DOMRect);
  viewport
    .querySelectorAll<HTMLElement>(
      '[data-release-ids]:not([data-release-ids="1"])',
    )
    .forEach((element) => {
      element.getBoundingClientRect = () => ({ top: 300 } as DOMRect);
    });
  return viewport;
}
test('进入后只展示 30 行，翻页从缓存展开，不重复请求', async () => {
  expect(container.querySelectorAll('tbody tr')).toHaveLength(30);
  const requests = fetch.mock.calls.length;
  act(() => current.loadMore());
  await advance(0);
  expect(container.querySelectorAll('tbody tr')).toHaveLength(60);
  expect(fetch).toHaveBeenCalledTimes(requests);
});
test('按最后一集的末行判断翻页，较早分组滚过底部时不提前加载', async () => {
  const viewport = current.viewport.current!;
  viewport.getBoundingClientRect = () => ({ bottom: 500 } as DOMRect);
  const table = viewport.querySelector('table')!;
  const earlier = document.createElement('tbody');
  const earlierRow = earlier.insertRow();
  earlierRow.getBoundingClientRect = () => ({ bottom: 400 } as DOMRect);
  table.prepend(earlier);
  const last = table.querySelector('tbody:last-of-type tr:last-child')!;
  last.getBoundingClientRect = () => ({ bottom: 700 } as DOMRect);
  act(() => current.onScroll());
  expect(current.count).toBe(30);
  last.getBoundingClientRect = () => ({ bottom: 550 } as DOMRect);
  act(() => current.onScroll());
  expect(current.count).toBe(60);
  earlier.remove();
  await advance(0);
});
test('提前越过缓存立即冻结、连续操作合并请求，补齐后按原剧集恢复', async () => {
  const viewport = position();
  const oldView = current.view;
  act(() => offset(20));
  expect(current.frozen).toBe(true);
  expect(current.loading).toBe(true);
  expect(current.view).toBe(oldView);
  act(() => {
    viewport.scrollTop = 700;
    current.onScroll();
    current.loadMore();
  });
  expect(viewport.scrollTop).toBe(500);
  expect(current.count).toBe(30);
  await advance(200);
  act(() => offset(25));
  await advance(299);
  expect(fetch).toHaveBeenCalledTimes(2);
  await advance(1);
  expect(current.frozen).toBe(false);
  expect(fetch.mock.calls[2][0]).toMatchObject({
    first: 10,
    before: new Date(base - 25 * hour).toISOString(),
  });
  expect(current.view!.directory[0].airTime).toBe(
    new Date(base - 25 * hour).toISOString(),
  );
  expect(current.view!.preview.nodes[0].id).toBe(26);
});
test('补齐失败保留位置和草稿，重试期间的迟到响应不覆盖新偏移', async () => {
  const viewport = position();
  const oldView = current.view;
  fetch.mockRejectedValueOnce(new Error('offline'));
  act(() => offset(20));
  await advance(300);
  expect(current.error).toBe('offline');
  expect(current.frozen).toBe(true);
  expect(current.view).toBe(oldView);
  let finish!: () => void;
  fetch.mockImplementationOnce(
    (request: PreviewRequest) =>
      new Promise((resolve) => {
        finish = () => resolve(page(request));
      }),
  );
  act(() => current.retry());
  await advance(300);
  act(() => offset(30));
  await advance(300);
  expect(current.view!.directory[0].airTime).toBe(
    new Date(base - 30 * hour).toISOString(),
  );
  const latest = current.view;
  await act(async () => {
    finish();
    await Promise.resolve();
  });
  expect(current.view).toBe(latest);
  expect(current.frozen).toBe(false);
  expect(viewport.scrollTop).not.toBe(700);
});
test('取样点上方没有发布事件，偏移修改后不自动滚动', async () => {
  const viewport = position(200);
  act(() => offset(1));
  await advance(0);
  expect(viewport.scrollTop).toBe(500);
});
test('后台增量刷新保持分页、滚动且不显示 loading；隐藏或离线时暂停', async () => {
  const viewport = current.viewport.current!;
  viewport.scrollTop = 127;
  const calls = fetch.mock.calls.length;
  const old = current.view;
  await advance(30000);
  expect(fetch.mock.calls.length).toBeGreaterThan(calls);
  expect(current.view).not.toBe(old);
  expect(current.loading).toBe(false);
  expect(current.frozen).toBe(false);
  expect(current.count).toBe(30);
  expect(viewport.scrollTop).toBe(127);
  const after = fetch.mock.calls.length;
  const hidden = jest.spyOn(document, 'hidden', 'get').mockReturnValue(true);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await advance(60000);
  expect(fetch).toHaveBeenCalledTimes(after);
  hidden.mockReturnValue(false);
  const online = jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('offline'));
  });
  await advance(60000);
  expect(fetch).toHaveBeenCalledTimes(after);
  online.mockReturnValue(true);
  act(() => {
    window.dispatchEvent(new Event('online'));
  });
  await advance(30000);
  expect(fetch.mock.calls.length).toBeGreaterThan(after);
  hidden.mockRestore();
  online.mockRestore();
});
test('偏移变化取消正在进行的后台刷新，迟到结果不能覆盖新视图', async () => {
  const old = current.view;
  let finish!: () => void;
  fetch.mockImplementationOnce(
    (request: PreviewRequest) =>
      new Promise((resolve) => {
        finish = () => resolve(page(request));
      }),
  );
  await advance(30000);
  expect(current.loading).toBe(false);
  expect(current.view).toBe(old);
  act(() => offset(1));
  await advance(0);
  const latest = current.view;
  await act(async () => {
    finish();
    await Promise.resolve();
  });
  expect(current.view).toBe(latest);
});

test('关闭动画期间保留列表，取消后台请求并停止翻页和轮询', async () => {
  const old = current.view;
  const count = current.count;
  let finish!: () => void;
  fetch.mockImplementationOnce(
    (request: PreviewRequest) =>
      new Promise((resolve) => {
        finish = () => resolve(page(request));
      }),
  );
  await advance(30000);
  const calls = fetch.mock.calls.length;
  const signal = fetch.mock.calls[calls - 1][1] as AbortSignal;
  act(() => {
    ReactDOM.render(<Harness cache={cache} enabled={false} />, container);
  });
  expect(signal.aborted).toBe(true);
  expect(current.view).toBe(old);
  await act(async () => finish());
  act(() => current.loadMore());
  await advance(60000);
  expect(current.view).toBe(old);
  expect(current.count).toBe(count);
  expect(fetch).toHaveBeenCalledTimes(calls);
});

test('末尾限制滚动距离后连续调整仍跟随原剧集，手动滚动后重新取样', async () => {
  const viewport = current.viewport.current!;
  viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
  let scrollTop = 450;
  let secondRelease = 490;
  const requested: number[] = [];
  Object.defineProperty(viewport, 'scrollTop', {
    get: () => scrollTop,
    set: (value: number) => {
      requested.push(value);
      scrollTop = Math.max(0, Math.min(500, value));
    },
  });
  jest.spyOn(viewport, 'querySelectorAll').mockImplementation(() => {
    const fragment = document.createDocumentFragment();
    [0, secondRelease, 800].forEach((position, i) => {
      const row = document.createElement('tr');
      row.dataset.releaseIds = String(i + 1);
      row.getBoundingClientRect = () =>
        ({ top: 100 + position - scrollTop } as DOMRect);
      fragment.append(row);
    });
    return fragment.querySelectorAll('tr');
  });
  act(() => {
    offset(1);
    secondRelease = 750;
  });
  await advance(0);
  expect(scrollTop).toBe(500);
  expect(requested[requested.length - 1]).toBe(702);
  act(() => offset(2));
  await advance(0);
  expect(scrollTop).toBe(500);
  expect(requested[requested.length - 1]).toBe(702);

  scrollTop = 200;
  act(() => offset(3));
  await advance(0);
  expect(scrollTop).toBe(0);
  expect(requested[requested.length - 1]).toBe(-48);
});
