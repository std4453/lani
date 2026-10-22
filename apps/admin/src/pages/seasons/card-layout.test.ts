import {
  cardEpisodeStatus,
  cardQueryVariables,
  episodeColor,
  episodeRows,
  selectEpisodeWindow,
} from './card-layout';
import { atomTypes } from '@lani/workflow';
import { ListSeasonCardsDocument } from '@/generated/types';

const statusEpisode = {
  id: 1,
  title: '第一集',
  airTime: '2099-01-01T00:00:00Z',
  jellyfinEpisodeId: null,
  latestTask: { nodes: [] },
};

test.each([
  ...atomTypes,
  'AVAILABLE',
  'DOWNLOAD_FAILED',
  'CANCELLED',
  'CANCELLING',
])(
  'preserves task summary %s without loading workflow details',
  (statusSummary) => {
    expect(
      cardEpisodeStatus({
        ...statusEpisode,
        latestTask: { nodes: [{ statusSummary }] },
      }),
    ).toBe(statusSummary);
  },
);

test('prioritizes available media and safely handles absent or unknown summaries', () => {
  expect(
    cardEpisodeStatus({
      ...statusEpisode,
      jellyfinEpisodeId: 'available',
      latestTask: { nodes: [{ statusSummary: 'DOWNLOAD_FAILED' }] },
    }),
  ).toBe('AVAILABLE');
  expect(cardEpisodeStatus(statusEpisode)).toBe('NOT_AIRED');
  expect(
    cardEpisodeStatus({
      ...statusEpisode,
      latestTask: { nodes: [{ statusSummary: null }] },
    }),
  ).toBe('UNKNOWN');
  expect(cardEpisodeStatus({ ...statusEpisode, airTime: null })).toBe(
    'DATE_UNKNOWN',
  );
  expect(
    cardEpisodeStatus({ ...statusEpisode, airTime: '2000-01-01T00:00:00Z' }),
  ).toBe('RESOURCE_MISSING');
  expect(
    cardEpisodeStatus({
      ...statusEpisode,
      latestTask: { nodes: [{ statusSummary: 'future-step' }] },
    }),
  ).toBe('UNKNOWN');
});

test('card query excludes task details and requests a status summary', () => {
  const query = JSON.stringify(ListSeasonCardsDocument);
  expect(query).toContain('"value":"statusSummary"');
  for (const field of [
    'workflow',
    'legacyStage',
    'isFailed',
    'isCancelled',
    'taskStatusFields',
    'episodeStatusFields',
    'sourcePath',
    'targetPath',
  ]) {
    expect(query).not.toContain(`"value":"${field}"`);
  }
});

test.each<[number, number[]]>([
  [0, []],
  [6, [6]],
  [7, [7]],
  [8, [8]],
  [9, [6, 3]],
  [12, [6, 6]],
  [13, [6, 7]],
  [14, [6, 8]],
  [100, [6, 8]],
])('groups %i episodes into at most two rows', (count, lengths) => {
  const episodes = Array.from({ length: count }, (_, i) => i + 1);
  const rows = episodeRows(episodes);
  expect(rows.map((row) => row.length)).toEqual(lengths);
  expect(rows.flat()).toEqual(episodes.slice(0, 14));
  expect(episodes).toHaveLength(count);
});

const now = Date.parse('2026-10-22T00:00:00Z');
const episode = (number: number, aired = true, type = 'episode') => ({
  id: number,
  numbering: { type, number: String(number), sort: String(number) },
  airTime: aired ? '2026-10-21T00:00:00Z' : '2026-10-23T00:00:00Z',
});

test.each([
  [12, 0, 1, 12],
  [24, 0, 1, 12],
  [24, 12, 1, 12],
  [24, 13, 13, 24],
  [36, 25, 25, 36],
  [13, 12, 1, 13],
  [13, 13, 1, 13],
  [14, 13, 1, 14],
  [14, 14, 1, 14],
  [15, 13, 13, 15],
  [26, 25, 13, 26],
  [26, 26, 13, 26],
  [27, 25, 25, 27],
  [65, 60, 49, 60],
  [65, 65, 61, 65],
])(
  'selects the current window: total %i latest %i',
  (total, latest, first, last) => {
    const episodes = Array.from({ length: total }, (_, i) =>
      episode(i + 1, i < latest),
    );
    const visible = selectEpisodeWindow(episodes, now);
    expect(visible.map(({ id }) => id)).toEqual(
      Array.from({ length: last - first + 1 }, (_, i) => first + i),
    );
  },
);

test('includes .5 main episodes, excludes specials, and ignores input ordering', () => {
  const episodes = [
    episode(13, false),
    episode(12.5),
    episode(12),
    episode(1),
    episode(100, true, 'sp'),
    episode(101, true, 'ova'),
    episode(102, true, 'oad'),
  ];
  expect(selectEpisodeWindow(episodes, now).map(({ id }) => id)).toEqual([
    1, 12, 12.5, 13,
  ]);
  expect(episodes[0].id).toBe(13);
});

test('missing metadata does not shift the numeric twelve-episode boundaries', () => {
  expect(
    selectEpisodeWindow(
      [episode(1), episode(11), episode(13), episode(24, false)],
      now,
    ).map(({ id }) => id),
  ).toEqual([13, 24]);
});

test('handles unknown dates and empty seasons, with a maximum of fourteen items', () => {
  expect(selectEpisodeWindow([], now)).toEqual([]);
  expect(
    selectEpisodeWindow(
      [
        { ...episode(1), airTime: null },
        { ...episode(2), airTime: 'invalid' },
      ],
      now,
    ).map(({ id }) => id),
  ).toEqual([1, 2]);
  const dense = Array.from({ length: 24 }, (_, i) => episode((i + 1) / 2));
  const visible = selectEpisodeWindow(dense, now);
  expect(visible).toHaveLength(14);
  expect(visible[visible.length - 1].id).toBe(12);
});

test('only unmapped resource states become grey for unmonitored seasons', () => {
  expect(episodeColor('RESOURCE_WAITING', false)).toBeUndefined();
  expect(episodeColor('RESOURCE_MISSING', false)).toBeUndefined();
  expect(episodeColor('RESOURCE_WAITING', true)).toBe('gold');
  expect(episodeColor('RESOURCE_MISSING', true)).toBe('red');
  expect(episodeColor('AVAILABLE', false)).toBe('green');
  expect(episodeColor('DOWNLOAD_FAILED', false)).toBe('red');
  expect(episodeColor('download', false)).toBe('blue');
});

test('omits the filter when searching with an empty title or clearing a search', () => {
  for (const keyword of ['', '  ']) {
    const variables = cardQueryVariables(2, keyword);
    expect(variables).not.toHaveProperty('filter');
    expect(variables).toEqual({ first: 30, offset: 30 });
  }
  expect(cardQueryVariables(1, ' 星际旅行 ')).toEqual({
    first: 30,
    offset: 0,
    filter: { title: { includesInsensitive: '星际旅行' } },
  });
});
