import { Torrent } from '@lani/db';
import { defaultSettings, evaluateTorrents } from '@lani/smart-download';
import { smartTorrent } from './smart-download.data';

const air = new Date('2026-10-01T12:00:00Z');
const episode = {
  id: 1,
  type: 'episode',
  number: 4,
  sort: 4,
  airTime: air.toISOString(),
};
function torrent(title: string, patch: Partial<Torrent> = {}): Torrent {
  return {
    id: 1,
    hash: 'test',
    title,
    publishDate: new Date(air.getTime() + 3600000),
    parseResult: {
      episodeInfo: { type: 'episode', index: 4 },
      subtitleInfo: { languages: ['zh-Hant'], delivery: [], multi: false },
    },
    parseVersion: 2,
    channel: 'MIKAN',
    metadata: null,
    sourceType: null,
    matchStatus: 'MATCHED',
    matchedSeasonId: 7,
    matchDetails: null,
    ...patch,
  } as Torrent;
}
function decide(row: Torrent, episodes = [episode]) {
  return evaluateTorrents(
    episodes,
    [smartTorrent(row)],
    defaultSettings,
    air.getTime() + 7200000,
  )[0];
}
it.each([
  'Anime S00E04',
  'Anime [SP][04]',
  'Anime [OVA][04]',
  'Anime 【特别篇】【04】',
  'Anime [04+小剧场]',
  'Anime [附小剧场][04]',
])(
  'blocks old ordinary parse results inside the default download window: %s',
  (title) => {
    expect(decide(torrent(title)).reasons).toContain('episode');
  },
);
it('allows an ordinary short series and never blocks a title just for Special in its name', () => {
  for (const title of [
    'Nijiyon Animation - 04',
    'Special 7 - 04',
    'Anime S01E04',
  ])
    expect(decide(torrent(title)).reasons).toEqual([]);
});
it('consumes only a matching LLM non-main result, not a stale or unrelated result', () => {
  const matchDetails = {
    mode: 'llm',
    result: { seasonId: '7', episodeKind: 'sp' },
  };
  expect(decide(torrent('Anime - 04', { matchDetails })).reasons).toContain(
    'episode',
  );
  expect(
    decide(torrent('Anime - 04', { matchDetails, matchedSeasonId: 8 })).reasons,
  ).toEqual([]);
  expect(
    decide(torrent('Anime - 04', { matchDetails, matchStatus: 'PENDING' }))
      .reasons,
  ).toEqual([]);
});
it('excludes metadata SP numbers from ordinary candidates while preserving both numbering namespaces', () => {
  const episodes = [
    { ...episode, number: 1, sort: 14 },
    { ...episode, id: 2, type: 'sp', number: 4, sort: 4 },
  ];
  expect(decide(torrent('Anime - 04'), episodes).reasons).toContain('episode');
  const main = torrent('Anime - 14', {
    parseResult: {
      episodeInfo: { type: 'episode', index: 14 },
      subtitleInfo: { languages: ['zh-Hant'], delivery: [], multi: false },
    },
  });
  expect(decide(main, episodes).reasons).toEqual([]);
});
