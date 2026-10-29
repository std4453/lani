import {
  PreviewCache,
  PreviewRequest,
  PreviewTorrent,
  relativePublishTime,
  captureRelease,
  restoreRelease,
} from './preview';
import { SmartEpisode } from '@lani/smart-download';
const base = Date.parse('2026-10-01T00:00:00Z');
const hour = 3600000;
const episodes: SmartEpisode[] = [0, 168, 336].map((offset, index) => ({
  id: index + 1,
  type: 'episode',
  number: index + 1,
  sort: index + 1,
  airTime: new Date(base + offset * hour).toISOString(),
}));
const signal = () => new AbortController().signal;
const shifted = (hours: number) =>
  episodes.map((episode) => ({
    ...episode,
    airTime: new Date(
      Date.parse(episode.airTime!) + hours * hour,
    ).toISOString(),
  }));
function setup(total = 600) {
  const rows: PreviewTorrent[] = Array.from({ length: total }, (_, id) => ({
    id: id + 1,
    hash: `${id}`,
    title: 'test',
    publishDate: new Date(base + (id - 200) * hour).toISOString(),
    size: '1024',
  }));
  const fetch = jest.fn(
    async ({ first, after, from, before }: PreviewRequest) => {
      const filtered = rows.filter(
        (row) =>
          (!after || row.id > Number(after)) &&
          (!from || Date.parse(row.publishDate) >= Date.parse(from)) &&
          (!before || Date.parse(row.publishDate) < Date.parse(before)),
      );
      const nodes = before ? filtered.slice(-first) : filtered.slice(0, first);
      return {
        nodes,
        cursor: nodes.length ? String(nodes[nodes.length - 1].id) : null,
        hasMore: filtered.length > first,
        excludes: [],
      };
    },
  );
  return { cache: new PreviewCache(fetch), fetch, rows };
}
test('首集前取 10 条，之后按 90 条补齐下一集边界；30 行翻页复用内存', async () => {
  const { cache, fetch } = setup();
  const snapshot = await cache.ensure(
    30,
    episodes,
    base + 500 * hour,
    signal(),
  );
  expect(fetch.mock.calls.map(([request]) => request.first)).toEqual([
    10, 90, 90,
  ]);
  expect(cache.nodes.map((row) => row.id)).toEqual(
    Array.from({ length: 190 }, (_, i) => i + 191),
  );
  expect(snapshot.coverage.completeUntil).toBe(base + 168 * hour);
  await cache.ensure(60, episodes, base + 500 * hour, signal());
  expect(fetch).toHaveBeenCalledTimes(3);
});
test('偏移提前后补取缺口，保留旧数据并恢复旧尾部游标', async () => {
  const { cache, fetch } = setup();
  await cache.ensure(30, episodes, base + 500 * hour, signal());
  expect(cache.needsEarlier(base - 100 * hour)).toBe(true);
  await cache.ensure(30, shifted(-100), base + 500 * hour, signal(), 1);
  expect(cache.nodes[0].id).toBe(91);
  expect(cache.nodes[cache.nodes.length - 1].id).toBe(380);
  expect(new Set(cache.nodes.map((row) => row.id)).size).toBe(290);
  expect(fetch.mock.calls.slice(3).map(([request]) => request.first)).toEqual([
    10, 90, 90,
  ]);
  await cache.ensure(300, shifted(-100), base + 500 * hour, signal());
  expect(cache.nodes.map((row) => row.id)).toEqual(
    Array.from({ length: 380 }, (_, i) => i + 91),
  );
});
test('向前补齐按日期和 ID 衔接，同刻资源不漏项', async () => {
  const { cache, rows } = setup();
  // 首次只保留同一发布时间中最后 10 条；提前后需要补回全部同刻资源。
  for (let i = 0; i < 200; i++)
    rows[i].publishDate = new Date(base - hour).toISOString();
  await cache.ensure(30, episodes, base + 500 * hour, signal());
  expect(cache.nodes[0].id).toBe(191);
  await cache.ensure(30, shifted(-1), base + 500 * hour, signal());
  expect(cache.nodes.map((row) => row.id)).toEqual(
    Array.from({ length: 380 }, (_, i) => i + 1),
  );
});
test('补齐失败和迟到响应不破坏旧的连续缓存，重试可恢复', async () => {
  const { cache, fetch } = setup();
  await cache.ensure(30, episodes, base + 500 * hour, signal());
  const ids = cache.nodes.map((row) => row.id);
  fetch.mockRejectedValueOnce(new Error('offline'));
  await expect(
    cache.ensure(30, shifted(-100), base + 500 * hour, signal()),
  ).rejects.toThrow('offline');
  expect(cache.nodes.map((row) => row.id)).toEqual(ids);
  let finish!: () => void;
  const fetchPage = fetch.getMockImplementation()!;
  fetch.mockImplementationOnce(
    (request) =>
      new Promise((resolve) => {
        finish = () => resolve(fetchPage(request));
      }),
  );
  const controller = new AbortController();
  const pending = cache.ensure(
    30,
    shifted(-100),
    base + 500 * hour,
    controller.signal,
  );
  controller.abort();
  finish();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  expect(cache.nodes.map((row) => row.id)).toEqual(ids);
  await cache.ensure(30, shifted(-100), base + 500 * hour, signal());
  expect(cache.nodes[0].id).toBe(91);
});
test('最后一集读取至末尾；无日程、空结果和无法推进的游标有界结束', async () => {
  const { cache, fetch } = setup();
  await cache.ensure(30, episodes, base + 500 * hour, signal(), 3);
  expect(cache.hasMore).toBe(false);
  expect(cache.nodes[cache.nodes.length - 1].id).toBe(600);
  const noSchedule = setup();
  await noSchedule.cache.ensure(30, [], base, signal());
  expect(noSchedule.fetch).toHaveBeenCalledTimes(1);
  const empty = setup(0);
  await empty.cache.ensure(30, episodes, base, signal());
  expect(empty.fetch).toHaveBeenCalledTimes(2);
  expect(empty.cache.needsEarlier(base - hour)).toBe(false);
  fetch.mockResolvedValue({
    nodes: [],
    cursor: null,
    hasMore: true,
    excludes: [],
  });
  await expect(
    new PreviewCache(fetch).ensure(30, [], base, signal()),
  ).rejects.toThrow('种子列表分页未推进');
});
test('相对时间保留累计小时，不会按一天回绕', () => {
  expect(
    relativePublishTime(new Date(base + 45296000).toISOString(), base),
  ).toBe('+12:34:56');
  expect(
    relativePublishTime(new Date(base + 49 * hour).toISOString(), base),
  ).toBe('+49:00:00');
});
test('按旧视口 +50px 向上查找剧集，恢复到 +48px；没有剧集则不跳转', () => {
  const viewport = document.createElement('div');
  viewport.innerHTML =
    '<table><tbody><tr data-release-ids="1"></tr><tr data-release-ids="2,3"></tr><tr data-release-ids="4"></tr></tbody></table>';
  viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
  [...viewport.querySelectorAll('tr')].forEach((row, i) => {
    row.getBoundingClientRect = () => ({ top: 80 + i * 69 } as DOMRect);
  });
  expect(captureRelease(viewport)).toBe(2);
  restoreRelease(viewport, 3);
  expect(viewport.scrollTop).toBe(1);
  viewport.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
  expect(captureRelease(viewport)).toBeUndefined();
});

test('吸顶单元格不改变分界行的采样与恢复位置', () => {
  const viewport = document.createElement('div');
  viewport.innerHTML =
    '<table><tbody><tr data-release-ids="1"><td>第一集</td></tr><tr data-release-ids="2"><td>第二集</td></tr><tr data-release-ids="3"><td>第三集</td></tr></tbody></table>';
  viewport.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
  const rows = [...viewport.querySelectorAll('tr')];
  rows.forEach((row, i) => {
    row.getBoundingClientRect = () => ({ top: -200 + i * 200 } as DOMRect);
    row.firstElementChild!.getBoundingClientRect = () =>
      ({ top: Math.max(148, -200 + i * 200) } as DOMRect);
  });
  viewport.scrollTop = 500;
  expect(captureRelease(viewport)).toBe(2);
  restoreRelease(viewport, 2);
  expect(viewport.scrollTop).toBe(352);
});
