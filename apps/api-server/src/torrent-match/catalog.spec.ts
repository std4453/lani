import {
  candidateSeasons,
  catalogReady,
  DEBOUNCE_MS,
  observeCatalog,
  snapshot,
} from './catalog';

const policy = {
  timezone: 'Asia/Shanghai',
  previousQuarters: 0,
  nextQuarters: 0,
};
const row = (id = 1, yearAndSemester = '202603') => ({
  id,
  title: '动画',
  aliases: ['日本語', '动画'],
  yearAndSemester,
  episodes: [],
});
const query = {
  aliases: ['动画'],
  publishedAt: '2026-10-21T00:00:00Z',
  episode: 3,
};

it('uses calendar quarters, including year boundaries and the legacy winter code', () => {
  const catalog = snapshot([
    row(1),
    row(2, '202604'),
    row(3, '202704'),
    row(4, '202602'),
    row(5, ''),
  ]);
  expect(candidateSeasons(catalog, query, policy).map((s) => s.id)).toEqual([
    '1',
  ]);
  expect(
    candidateSeasons(catalog, query, { ...policy, nextQuarters: 1 }).map(
      (s) => s.id,
    ),
  ).toEqual(['1', '3']);
  expect(
    candidateSeasons(
      catalog,
      { ...query, publishedAt: '2026-12-31T17:00:00Z' },
      policy,
    ).map((s) => s.id),
  ).toEqual(['3']);
  expect(
    candidateSeasons(catalog, query, { ...policy, previousQuarters: 1 }).map(
      (s) => s.id,
    ),
  ).toEqual(['1', '4']);
});

it('keeps titles and aliases from any source and normalizes ordering only', () => {
  expect(snapshot([row(2), row(1)]).version).toBe(
    snapshot([row(1), { ...row(2), aliases: ['动画', '日本語', '动画'] }])
      .version,
  );
  expect(snapshot([row()]).catalog[0].title).toBe('动画');
});

it('ignores episode metadata changes when computing catalog content and candidates', () => {
  const initial = row();
  const changed = {
    ...initial,
    episodes: [
      { episodeType: 'EPISODE', index: 3, rawAirTime: new Date('2000-01-01Z') },
    ],
  };
  const catalog = snapshot([changed]);
  expect(catalog.version).toBe(snapshot([initial]).version);
  expect(catalog.catalog[0].episodes).toBeUndefined();
  expect(candidateSeasons(catalog, query, policy)).toHaveLength(1);
});

it('persists a trailing debounce across restarts without resetting unchanged inputs', () => {
  const time = new Date('2026-10-21T00:00:00Z');
  const a = snapshot([row()]);
  const first = observeCatalog(null, a, time);
  expect(first.dueAt).toBe(time.toISOString());
  first.active = a;
  const b = snapshot([{ ...row(), title: '新标题' }]);
  const changed = observeCatalog(first, b, new Date(+time + 1000));
  expect(Date.parse(changed.dueAt)).toBe(+time + 1000 + DEBOUNCE_MS);
  const restored = JSON.parse(JSON.stringify(changed));
  expect(observeCatalog(restored, b, new Date(+time + 2000))).toBe(restored);
  const c = snapshot([{ ...row(), title: '另一个标题' }]);
  expect(
    Date.parse(observeCatalog(restored, c, new Date(+time + 3000)).dueAt),
  ).toBe(+time + 3000 + DEBOUNCE_MS);
});

it('waits for pending candidate changes but permits unrelated quarters', () => {
  const a = snapshot([row()]);
  const state = observeCatalog(null, a, new Date());
  expect(catalogReady(state, query, policy)).toBe(false);
  state.active = a;
  const next = observeCatalog(
    state,
    snapshot([row(), row(2, '202704')]),
    new Date(),
  );
  expect(catalogReady(next, query, policy)).toBe(true);
  expect(catalogReady(next, query, { ...policy, nextQuarters: 1 })).toBe(false);
  expect(
    catalogReady(
      observeCatalog(state, snapshot([]), new Date()),
      query,
      policy,
    ),
  ).toBe(false);
});
