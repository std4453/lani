import { getEpisodeAirTime, resolveEpisodeClock } from './episode-air-time';
import type { SeasonEpisode } from './index.model';
import type { BangumiDataSchedule } from './bangumi-data/BangumiDataService';

const schedule = (
  begin = '2026-01-05T15:30:00.000Z',
  broadcastAt = '2026-01-05T15:30:00.000Z',
): BangumiDataSchedule => ({ begin, broadcastAt });

function episode(
  airDate: string,
  values: Partial<SeasonEpisode> = {},
): SeasonEpisode {
  return {
    title: 'Episode',
    airDate,
    episodeNumber: '1',
    episodeType: 'EPISODE',
    ...values,
  };
}

describe('resolveEpisodeClock', () => {
  it.each([
    ['2026-01-05T15:00:00Z', 1380, 0],
    ['2026-01-05T15:30:00Z', 1410, 0],
    ['2026-01-05T16:23:00Z', 23, 1],
    ['2026-01-05T17:00:00Z', 60, 1],
  ] as const)(
    'handles Japanese 24+ broadcasts without a blanket day shift: %s',
    (at, minutes, dayOffset) => {
      const clock = resolveEpisodeClock(
        '',
        [episode('20260105')],
        schedule(at, at),
      );
      expect(clock).toEqual({ minutes, dayOffset });
      expect(getEpisodeAirTime(clock, '20260105')).toEqual(new Date(at));
    },
  );

  it('uses the explicit episode number ahead of a conflicting legacy index', () => {
    expect(
      resolveEpisodeClock(
        '',
        [episode('20260105', { episodeNumber: '2', index: 1 })],
        schedule('2026-01-05T16:00:00Z', '2026-01-05T16:00:00Z'),
      ),
    ).toEqual({ minutes: 0, dayOffset: 0 });
  });
  it.each([
    ['24:00', 1440],
    ['24:30', 1470],
    ['25:23', 1523],
    ['26:00', 1560],
    ['48:00', 2880],
    ['48:59', 2939],
  ] as const)(
    'keeps valid manual clock %s ahead of schedule',
    (airTime, expected) => {
      const result = resolveEpisodeClock(
        airTime,
        [episode('20260105')],
        schedule(),
      );
      expect(result).toEqual({ minutes: expected, dayOffset: 0 });
    },
  );

  it('uses a valid 24:30 manual clock without adding a separate day offset', () => {
    expect(resolveEpisodeClock('24:30', [], schedule())).toEqual({
      minutes: 1470,
      dayOffset: 0,
    });
  });

  it.each(['25:60', '49:00', '99:00'])(
    'uses schedule or fallback time when manual clock %s is invalid',
    (airTime) => {
      expect(
        resolveEpisodeClock(airTime, [episode('20260105')], schedule()),
      ).toEqual({ minutes: 23 * 60 + 30, dayOffset: 0 });
      expect(resolveEpisodeClock(airTime, [])).toEqual({
        minutes: 23 * 60,
        dayOffset: 0,
      });
    },
  );

  it('does not add another day when schedule begin already uses the civil date', () => {
    const resolved = resolveEpisodeClock(
      '',
      [episode('20260106')],
      schedule('2026-01-05T16:30:00.000Z', '2026-01-05T16:30:00.000Z'),
    );
    expect(resolved).toEqual({ minutes: 30, dayOffset: 0 });
    expect(getEpisodeAirTime(resolved, '20260106')?.toISOString()).toBe(
      '2026-01-05T16:30:00.000Z',
    );
  });

  it('anchors the day to the unique first episode date when it is within one day', () => {
    const episodes = [
      episode('20260106', { episodeNumber: '2', index: 2 }),
      episode('20260105', {
        episodeNumber: '1',
        index: undefined,
        bangumiSort: '51',
      }),
    ];
    expect(
      resolveEpisodeClock(
        '',
        episodes,
        schedule('2026-01-05T16:30:00.000Z', '2026-01-05T16:30:00.000Z'),
      ),
    ).toEqual({ minutes: 30, dayOffset: 1 });
  });

  it('supports a one-day negative schedule anchor', () => {
    expect(
      resolveEpisodeClock(
        '',
        [episode('20260107')],
        schedule('2026-01-05T16:30:00.000Z', '2026-01-05T16:30:00.000Z'),
      ),
    ).toEqual({ minutes: 30, dayOffset: -1 });
  });

  it('does not anchor when there is no valid first episode date', () => {
    expect(resolveEpisodeClock('', [episode('20260230')], schedule())).toEqual({
      minutes: 23 * 60 + 30,
      dayOffset: 0,
    });
  });

  it('does not anchor when first episode dates are ambiguous', () => {
    expect(
      resolveEpisodeClock(
        '',
        [episode('20260105'), episode('20260106', { index: 1 })],
        schedule('2026-01-05T16:30:00.000Z'),
      ),
    ).toEqual({ minutes: 23 * 60 + 30, dayOffset: 0 });
  });

  it('does not anchor when the schedule differs by more than one day', () => {
    expect(
      resolveEpisodeClock(
        '',
        [episode('20260101')],
        schedule('2026-01-05T16:30:00.000Z'),
      ),
    ).toEqual({ minutes: 23 * 60 + 30, dayOffset: 0 });
  });

  it('does not guess the first episode from array order or a special episode', () => {
    const episodes = [
      episode('20260105', { episodeNumber: '2', index: 2 }),
      episode('20260106', { episodeNumber: '1', episodeType: 'SP' }),
    ];
    expect(
      resolveEpisodeClock('', episodes, schedule('2026-01-05T16:30:00.000Z')),
    ).toEqual({ minutes: 23 * 60 + 30, dayOffset: 0 });
  });

  it('uses the fallback when no schedule is available', () => {
    expect(resolveEpisodeClock('', [])).toEqual({
      minutes: 23 * 60,
      dayOffset: 0,
    });
  });

  it('does not apply date anchoring to a valid manual clock', () => {
    expect(
      resolveEpisodeClock(
        '25:23',
        [episode('20260105')],
        schedule('2026-01-06T16:30:00.000Z'),
      ),
    ).toEqual({ minutes: 25 * 60 + 23, dayOffset: 0 });
  });
});

describe('getEpisodeAirTime', () => {
  it.each([
    ['20260105', 1440, '2026-01-05T16:00:00.000Z'],
    ['20260105', 1470, '2026-01-05T16:30:00.000Z'],
    ['20260105', 1523, '2026-01-05T17:23:00.000Z'],
    ['20260105', 1560, '2026-01-05T18:00:00.000Z'],
  ] as const)(
    'combines %s with %i minutes in fixed UTC+8',
    (airDate, minutes, iso) => {
      expect(
        getEpisodeAirTime({ minutes, dayOffset: 0 }, airDate)?.toISOString(),
      ).toBe(iso);
    },
  );

  it('applies the schedule anchor once to a civil date', () => {
    expect(
      getEpisodeAirTime(
        { minutes: 30, dayOffset: 1 },
        '20260105',
      )?.toISOString(),
    ).toBe('2026-01-05T16:30:00.000Z');
  });

  it('handles month and year boundaries', () => {
    expect(
      getEpisodeAirTime(
        { minutes: 30, dayOffset: 1 },
        '20261231',
      )?.toISOString(),
    ).toBe('2026-12-31T16:30:00.000Z');
  });

  it.each([undefined, '', '20260230', '2026-01-05', '2026015', '00000000'])(
    'returns null for missing or invalid YYYYMMDD date %s',
    (airDate) => {
      expect(
        getEpisodeAirTime({ minutes: 23 * 60, dayOffset: 0 }, airDate),
      ).toBe(null);
    },
  );
});
