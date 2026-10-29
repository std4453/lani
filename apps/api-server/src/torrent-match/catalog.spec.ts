import {
  candidateSeasons,
  catalogReady,
  observeCatalog,
  snapshot,
} from './catalog';

const debounceMs = 30 * 60 * 1000;
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
  rawTitle: '动画 03',
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
  expect(catalog.catalog[0]).not.toHaveProperty('episodes');
  expect(candidateSeasons(catalog, query, policy)).toHaveLength(1);
});

it('persists a trailing debounce across restarts without resetting unchanged inputs', () => {
  const time = new Date('2026-10-21T00:00:00Z');
  const a = snapshot([row()]);
  const first = observeCatalog(null, a, time, debounceMs);
  expect(first.dueAt).toBe(time.toISOString());
  first.active = a;
  const b = snapshot([{ ...row(), title: '新标题' }]);
  const changed = observeCatalog(first, b, new Date(+time + 1000), debounceMs);
  expect(Date.parse(changed.dueAt)).toBe(+time + 1000 + debounceMs);
  const restored = JSON.parse(JSON.stringify(changed));
  expect(observeCatalog(restored, b, new Date(+time + 2000), debounceMs)).toBe(
    restored,
  );
  const c = snapshot([{ ...row(), title: '另一个标题' }]);
  expect(
    Date.parse(
      observeCatalog(restored, c, new Date(+time + 3000), debounceMs).dueAt,
    ),
  ).toBe(+time + 3000 + debounceMs);
});

it('waits for every pending catalog change, including fallback-only quarters', () => {
  const a = snapshot([row()]);
  const state = observeCatalog(null, a, new Date(), debounceMs);
  expect(catalogReady(state)).toBe(false);
  state.active = a;
  expect(catalogReady(state)).toBe(true);
  const next = observeCatalog(
    state,
    snapshot([row(), row(2, '202704')]),
    new Date(),
    debounceMs,
  );
  expect(catalogReady(next)).toBe(false);
  expect(
    catalogReady(observeCatalog(state, snapshot([]), new Date(), debounceMs)),
  ).toBe(false);
});

it.each([0, 5000, 60000])(
  'uses a configured %i ms window for subsequent changes',
  (delay) => {
    const now = new Date('2026-10-21T00:00:00Z');
    const initial = observeCatalog(null, snapshot([row()]), now, delay);
    expect(initial.dueAt).toBe(now.toISOString());
    const changed = observeCatalog(
      initial,
      snapshot([{ ...row(), title: '新标题' }]),
      now,
      delay,
    );
    expect(Date.parse(changed.dueAt)).toBe(+now + delay);
    // 已持久化的窗口不因配置变化或重启而重新计时。
    expect(
      observeCatalog(
        changed,
        changed.desired,
        new Date(+now + 1000),
        delay + 1000,
      ),
    ).toBe(changed);
  },
);

it('projects persisted metadata directly without a second validation policy', () => {
  const stored = {
    ...row(),
    declaredEpisodeCount: 0,
    premiereDate: 'stored-value',
  };
  const projected = snapshot([stored]);
  expect(projected.catalog[0]).toMatchObject({
    declaredEpisodeCount: 0,
    premiereDate: 'stored-value',
  });
  expect(projected.version).not.toBe(snapshot([row()]).version);
  expect(snapshot([row()]).catalog[0]).toMatchObject({
    declaredEpisodeCount: null,
    premiereDate: null,
  });
});
