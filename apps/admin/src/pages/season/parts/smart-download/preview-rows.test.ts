import {
  defaultSettings,
  SmartEpisode,
  SmartTorrent,
} from '@lani/smart-download';
import { formatEpisodeNumbers, previewRows } from './preview-rows';
const at = Date.parse('2026-10-01T12:00:00Z');
const date = (hours: number) => new Date(at + hours * 3600000).toISOString();
const episode = (id = 1, hours = 0, sort = id): SmartEpisode => ({
  id,
  type: 'episode',
  number: id,
  sort,
  airTime: date(hours),
});
const torrent = (id = 1, hours = 1, number = 1): SmartTorrent => ({
  id,
  hash: `hash-${id}`,
  title: `Series - ${number}`,
  publishDate: date(hours),
  episodeInfo: { type: 'episode', index: number },
  subtitleInfo: { languages: ['zh-Hans'] },
});
test('预览按实际发布区间补空行，与下载窗口无关，合并同刻角标', () => {
  const episodes = [
    episode(1),
    episode(2, 168),
    episode(3, 336),
    episode(4, 336),
  ];
  const rows = previewRows(
    episodes,
    [torrent(1, 96)],
    { ...defaultSettings, windowHours: 1 },
    at + 400 * 3600000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity },
  );
  expect(rows.map((r) => r.release?.label)).toEqual([
    '#1 发布',
    '#2 发布',
    '#3-4 发布',
  ]);
  expect(rows.map((r) => r.torrent?.id)).toEqual([1, undefined, undefined]);
});
test('无资源保留发布事件定位点，无剧集时保留种子且置灰', () => {
  expect(
    previewRows([episode()], [], defaultSettings, at + 86400000, [], {
      from: -Infinity,
      through: Infinity,
      completeUntil: Infinity,
    }),
  ).toMatchObject([{ key: 'release-1', release: { label: '#1 发布' } }]);
  const rows = previewRows(
    [],
    [torrent()],
    defaultSettings,
    at + 86400000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity },
  );
  expect(rows[0].release).toBeUndefined();
  expect(rows[0].decision?.reasons).toContain('episode');
  expect(formatEpisodeNumbers([5, 3, 1, 4, 3, 10])).toBe('#1,3-5,10 发布');
});

test('正序分界位于发布后第一条，相对时间使用最近的发布事件，包含相同时间', () => {
  const rows = previewRows(
    [episode(1), episode(2, 168)],
    [torrent(5, 168), torrent(2, -1), torrent(3, 168), torrent(1, 0)],
    defaultSettings,
    at + 400 * 3600000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity },
  );
  expect(rows.map((r) => r.torrent?.id)).toEqual([2, 1, 3, 5]);
  expect(rows.map((r) => r.release?.label)).toEqual([
    undefined,
    '#1 发布',
    '#2 发布',
    undefined,
  ]);
  expect(rows.map((r) => r.precedingReleaseAt)).toEqual([
    undefined,
    at,
    at + 168 * 3600000,
    at + 168 * 3600000,
  ]);
});
test('不为未加载的尾部补空事件，首集在未来仍能定位', () => {
  expect(
    previewRows(
      [episode(1), episode(2, 168)],
      [],
      defaultSettings,
      at + 200 * 3600000,
      [],
      { from: -Infinity, through: at, completeUntil: at },
    ),
  ).toEqual([]);
  expect(
    previewRows(
      [episode(1), episode(2, 168)],
      [],
      defaultSettings,
      at - 1,
      [],
      { from: -Infinity, through: Infinity, completeUntil: Infinity },
    ),
  ).toMatchObject([{ release: { episodeIds: [1] } }]);
});
