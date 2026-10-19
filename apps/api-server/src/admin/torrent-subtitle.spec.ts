import {
  mergeSubtitleInfo,
  torrentSubtitleInfo,
  TorrentSubtitleSource,
} from './torrent-subtitle';

const title = { languages: ['zh', 'en'], multi: true, delivery: [] };
const page = {
  status: 'known',
  subtitleInfo: {
    languages: ['zh-Hant', 'en'],
    multi: true,
    delivery: ['muxed'],
  },
};
const legacy: TorrentSubtitleSource = {
  subtitleHasChs: true,
  subtitleHasCht: false,
  subtitleHasJp: false,
  subtitleType: '内挂',
};

it('merges distinct page languages and refines Chinese without mutating inputs', () => {
  expect(mergeSubtitleInfo(title, page)).toEqual({
    languages: ['en', 'zh-Hant'],
    multi: true,
    delivery: ['muxed'],
  });
  expect(title.languages).toEqual(['zh', 'en']);
});
it.each([
  null,
  {},
  { status: 'unknown' },
  { status: 'known', subtitleInfo: {} },
])('preserves title when page is missing or unknown: %s', (result) => {
  expect(mergeSubtitleInfo(title, result)).toBe(title);
});
it('preserves concrete title languages over no-subtitle page evidence', () => {
  const none = { status: 'none', subtitleInfo: null };
  expect(mergeSubtitleInfo(title, none)).toBe(title);
  expect(
    mergeSubtitleInfo({ languages: [], multi: true, delivery: [] }, none),
  ).toBeNull();
});
it('reads legacy flags only for titles that have not been reparsed', () => {
  expect(torrentSubtitleInfo(legacy)).toEqual({
    languages: ['zh-Hans'],
    multi: false,
    delivery: ['muxed'],
  });
  expect(torrentSubtitleInfo({ ...legacy, parseVersion: 1 })).toBeUndefined();
  expect(
    torrentSubtitleInfo({
      ...legacy,
      parseVersion: 1,
      parseResult: { subtitleInfo: null },
    }),
  ).toBeNull();
});
it.each(['内嵌', '外挂', '内封'])(
  'maps legacy delivery %s in application code',
  (subtitleType) => {
    expect(torrentSubtitleInfo({ ...legacy, subtitleType })?.delivery).toEqual([
      { 内嵌: 'burned-in', 外挂: 'external', 内封: 'muxed' }[subtitleType],
    ]);
  },
);
it('uses saved metadata without depending on the most recent fetch status', () => {
  expect(
    torrentSubtitleInfo({
      ...legacy,
      parseVersion: 1,
      parseResult: { subtitleInfo: title },
      metadata: page,
    }),
  ).toEqual({ languages: ['en', 'zh-Hant'], multi: true, delivery: ['muxed'] });
});
