import { PreviewCache, PreviewTorrent } from './preview';
import { SmartEpisode } from '@lani/smart-download';
const base = Date.parse('2026-10-01T00:00:00Z');
const episodes: SmartEpisode[] = [0, 168].map((hour, index) => ({
  id: index + 1,
  type: 'episode',
  number: index + 1,
  sort: index + 1,
  airTime: new Date(base + hour * 3600000).toISOString(),
}));
function setup(total: number) {
  const rows: PreviewTorrent[] = Array.from({ length: total }, (_, id) => ({
    id: id + 1,
    hash: `${id}`,
    title: 'test',
    publishDate: new Date(base + (210 - id) * 3600000).toISOString(),
    size: '1024',
  }));
  const fetch = jest.fn(async (first: number, after: string | null) => {
    const offset = Number(after ?? 0);
    return {
      nodes: rows.slice(offset, offset + first),
      cursor: `${offset + first}`,
      hasMore: offset + first < total,
      excludes: [],
    };
  });
  return { cache: new PreviewCache(fetch), fetch };
}
test('首屏扩大补取到前一发布边界，展示下一页优先使用缓存', async () => {
  const { cache, fetch } = setup(300);
  const completeSince = await cache.ensure(30, episodes, base + 300 * 3600000);
  expect(fetch.mock.calls.map(([size]) => size)).toEqual([30, 60]);
  expect(cache.nodes).toHaveLength(90);
  expect(completeSince).toBe(Date.parse(episodes[1].airTime!));
  await cache.ensure(40, episodes, base + 300 * 3600000);
  expect(fetch).toHaveBeenCalledTimes(2);
});
test('下载时间改变后补取新边界，跨过所有剧集后恢复普通 30 条分页', async () => {
  const { cache, fetch } = setup(400);
  await cache.ensure(30, episodes, base + 300 * 3600000);
  await cache.ensure(
    30,
    episodes.map((e) => ({
      ...e,
      airTime: new Date(Date.parse(e.airTime!) - 100 * 3600000).toISOString(),
    })),
    base + 300 * 3600000,
  );
  expect(cache.nodes.length).toBeGreaterThan(90);
  await cache.ensure(350, episodes, base + 300 * 3600000);
  expect(fetch.mock.calls[fetch.mock.calls.length - 1][0]).toBe(30);
});
test('没有剧集和空资源都不无限补取，并发请求复用正在加载的一页', async () => {
  const { cache, fetch } = setup(100);
  await Promise.all([cache.ensure(30, [], base), cache.ensure(30, [], base)]);
  expect(fetch).toHaveBeenCalledTimes(1);
  const empty = setup(0);
  expect(await empty.cache.ensure(30, episodes, base)).toBe(-Infinity);
  expect(empty.fetch).toHaveBeenCalledTimes(1);
});
