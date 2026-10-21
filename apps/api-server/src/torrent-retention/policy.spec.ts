import {
  durationSeconds,
  torrentRetentionConfig,
} from '@/config/torrent-retention';
import { QBTTorrent } from '@/download-client/types';
import { retentionDecision, torrentIdentities } from './policy';

const now = 1800000000;
const day = 86400;
const policy = { enabled: true, afterFinish: '7d', afterSeeding: '30d' };
const torrent = (changes: Partial<QBTTorrent> = {}) =>
  ({
    hash: 'a'.repeat(40),
    state: 'pausedUP',
    progress: 1,
    completion_on: now - 7 * day,
    added_on: now - 40 * day,
    ...changes,
  } as QBTTorrent);

describe('retention configuration', () => {
  it('defaults to disabled and accepts human readable positive durations', () => {
    expect(torrentRetentionConfig.validate(undefined).value).toEqual({
      ...policy,
      enabled: false,
    });
    expect(torrentRetentionConfig.validate({ enabled: true }).value).toEqual(
      policy,
    );
    expect(durationSeconds('1.5d')).toBe(129600);
    expect(durationSeconds('12 h')).toBe(43200);
    expect(durationSeconds('2w')).toBe(1209600);
    expect(durationSeconds('1.1h')).toBe(3960);
    expect(durationSeconds('0.7d')).toBe(60480);
  });
  it.each([
    '0d',
    '-1d',
    'Infinity',
    'NaNd',
    '7',
    '1y',
    '0.1s',
    '1.0000001s',
    '9007199254740991.1s',
    '999999999999999999d',
    '1d garbage',
  ])('rejects %s', (value) => {
    expect(() => durationSeconds(value)).toThrow();
    expect(
      torrentRetentionConfig.validate({ enabled: true, afterFinish: value })
        .error,
    ).toBeDefined();
  });
});

describe('retention policy', () => {
  it.each(['pausedUP', 'stoppedUP'])(
    'applies completed retention to %s at the boundary',
    (state) => {
      expect(retentionDecision(torrent({ state }), policy, now)?.rule).toBe(
        'afterFinish',
      );
      expect(
        retentionDecision(torrent({ state }), policy, now - 1),
      ).toBeUndefined();
    },
  );
  it.each(['uploading', 'forcedUP', 'stalledUP', 'queuedUP'])(
    'uses the longer seeding retention for %s',
    (state) => {
      expect(
        retentionDecision(torrent({ state }), policy, now),
      ).toBeUndefined();
      expect(
        retentionDecision(
          torrent({ state, completion_on: now - 30 * day }),
          policy,
          now,
        )?.rule,
      ).toBe('afterSeeding');
    },
  );
  it.each([
    'checkingUP',
    'moving',
    'error',
    'missingFiles',
    'downloading',
    'unknown',
    'pausedDL',
  ])('never removes %s', (state) => {
    expect(retentionDecision(torrent({ state }), policy, now)).toBeUndefined();
  });
  it('falls back only when completion time is absent, rejecting invalid clocks', () => {
    expect(
      retentionDecision(torrent({ completion_on: -1 }), policy, now)?.timeField,
    ).toBe('added_on');
    expect(
      retentionDecision(torrent({ completion_on: now + 1 }), policy, now),
    ).toBeUndefined();
    expect(
      retentionDecision(
        torrent({ completion_on: -1, added_on: -1 }),
        policy,
        now,
      ),
    ).toBeUndefined();
    expect(
      retentionDecision(torrent({ completion_on: Infinity }), policy, now),
    ).toBeUndefined();
  });
  it('requires enabled configuration, complete data, and an explicit hash', () => {
    expect(
      retentionDecision(torrent(), { ...policy, enabled: false }, now),
    ).toBeUndefined();
    expect(
      retentionDecision(torrent({ progress: 0.99 }), policy, now),
    ).toBeUndefined();
    expect(
      retentionDecision(torrent({ hash: 'all' }), policy, now),
    ).toBeUndefined();
  });
  it('matches canonical and hybrid identities case insensitively', () => {
    expect(
      torrentIdentities(
        torrent({ infohash_v1: 'B'.repeat(40), infohash_v2: 'C'.repeat(64) }),
      ),
    ).toEqual(['a'.repeat(40), 'b'.repeat(40), 'c'.repeat(64)]);
  });
});
