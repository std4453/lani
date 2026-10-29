import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import {
  defaultSettings,
  previewRows,
  SmartEpisode,
} from '@lani/smart-download';
import { PreviewCache, PreviewPage, PreviewRequest } from './preview';
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
function Harness({ cache }: { cache: PreviewCache }) {
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
  current = useTimeline(cache, directory, now);
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
  act(() =>
    ReactDOM.render(<Harness cache={new PreviewCache(fetch)} />, container),
  );
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
