jest.mock('@/components/MainTable/index.module.less', () => ({}));
jest.mock('@/components/PageTitle', () => () => null);
jest.mock('@/components/AsyncButton', () => () => null);
jest.mock('@/components/Layout', () => ({ TableTitle: () => null }));
jest.mock('@/components/MainTable', () => () => null);
jest.mock('@/utils/search', () => ({
  withAntdSearch: (component: unknown) => component,
}));
jest.mock('@/theme', () => ({ useTheme: () => ({ theme: 'light' }) }));
jest.mock('@/utils/error', () => ({ handleError: jest.fn() }));
import { ApolloClient } from '@apollo/client';
import { queryTorrents } from './index';
import { decodeAntdSearch, encodeAntdSearch } from '@/utils/search/encode';
import { TorrentChannel, TorrentsOrderBy } from '@/generated/types';
import { subtitleFilter } from './subtitle-filter';

describe('torrent list queries', () => {
  it('keeps the stored display ID across pagination and source filters', async () => {
    const torrent = { id: 900, displayId: 2, channel: TorrentChannel.Nyaa };
    const query = jest.fn().mockResolvedValue({
      data: { allTorrents: { edges: [{ node: torrent }], totalCount: 101 } },
    });
    const result = await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      { current: 2, pageSize: 100 },
      {},
      { channel: [TorrentChannel.Nyaa] },
      {},
    );
    expect(result.data).toEqual([torrent]);
    expect(query.mock.calls[0][0].variables).toMatchObject({
      offset: 100,
      filter: { channel: { in: [TorrentChannel.Nyaa] } },
    });
  });
  it('combines source and keyword filters, and treats cleared sources as all', async () => {
    const query = jest.fn().mockResolvedValue({
      data: { allTorrents: { edges: [], totalCount: 0 } },
    });
    await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      { keyword: 'ANi' },
      {},
      { channel: [] },
      {},
    );
    expect(query.mock.calls[0][0].variables.filter).toEqual({
      title: { includesInsensitive: 'ANi' },
    });
  });
  it('reports query failures without a fabricated successful result', async () => {
    const query = jest.fn().mockRejectedValue(new Error('offline'));
    expect(
      await queryTorrents(
        { query } as unknown as ApolloClient<object>,
        {},
        {},
        {},
        {},
      ),
    ).toEqual({
      success: false,
    });
  });
});

it.each(['match', 'no_match'])(
  'round-trips f_season=%s and combines filters',
  async (value) => {
    const query = jest.fn().mockResolvedValue({
      data: { allTorrents: { edges: [], totalCount: 0 } },
    });
    const state = decodeAntdSearch({ f_season: value });
    expect(encodeAntdSearch({}, {}, state.filter, {})).toEqual({
      f_season: value,
    });
    await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      { keyword: '测试' },
      {},
      {
        season: state.filter.season as string[],
        channel: [TorrentChannel.Nyaa],
      },
      { alias: '季度', part: '制作组' },
    );
    expect(query.mock.calls[0][0].variables.filter).toEqual({
      matchedSeasonId: { isNull: value === 'no_match' },
      channel: { in: [TorrentChannel.Nyaa] },
      title: { includesInsensitive: '测试' },
      seasonTitleAliases: { contains: ['季度'] },
      organizationParts: { contains: ['制作组'] },
    });
  },
);
it.each([undefined, [], ['invalid'], ['match', 'no_match']])(
  'ignores cleared or invalid association filters: %j',
  async (season) => {
    const query = jest.fn().mockResolvedValue({
      data: { allTorrents: { edges: [], totalCount: 0 } },
    });
    await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      {},
      {},
      { season },
      {},
    );
    expect(query.mock.calls[0][0].variables.filter).toBeUndefined();
  },
);

it('round-trips multiple subtitle languages and intersects other filters', async () => {
  const query = jest.fn().mockResolvedValue({
    data: { allTorrents: { edges: [], totalCount: 0 } },
  });
  const state = decodeAntdSearch({ f_subtitles: 'zh|en', f_size: 'sm|md' });
  expect(encodeAntdSearch({}, {}, state.filter, {})).toEqual({
    f_subtitles: 'zh|en',
    f_size: 'sm|md',
  });
  await queryTorrents(
    { query } as unknown as ApolloClient<object>,
    { keyword: '测试' },
    {},
    { ...state.filter, season: ['match'], channel: [TorrentChannel.Nyaa] },
    { part: '制作组', alias: '季度' },
  );
  expect(query.mock.calls[0][0].variables.filter).toEqual({
    and: [subtitleFilter(['zh', 'en'])],
    or: [
      {
        size: {
          greaterThanOrEqualTo: 10 * 1024 * 1024,
          lessThan: 150 * 1024 * 1024,
        },
      },
      {
        size: {
          greaterThanOrEqualTo: 150 * 1024 * 1024,
          lessThan: 750 * 1024 * 1024,
        },
      },
    ],
    matchedSeasonId: { isNull: false },
    channel: { in: [TorrentChannel.Nyaa] },
    title: { includesInsensitive: '测试' },
    organizationParts: { contains: ['制作组'] },
    seasonTitleAliases: { contains: ['季度'] },
  });
});

it.each([undefined, null, [], ['invalid'], ['__proto__']])(
  'omits cleared or invalid subtitle filters: %j',
  async (subtitles) => {
    const query = jest.fn().mockResolvedValue({ data: { allTorrents: null } });
    await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      {},
      {},
      { subtitles },
      {},
    );
    expect(query.mock.calls[0][0].variables.filter).toBeUndefined();
  },
);

it.each([
  [{}, TorrentsOrderBy.DisplayIdDesc],
  [{ id: 'ascend' }, TorrentsOrderBy.DisplayIdAsc],
  [{ id: 'descend' }, TorrentsOrderBy.DisplayIdDesc],
  [{ publishDate: 'ascend' }, TorrentsOrderBy.PublishDateAsc],
  [{ episode: 'descend' }, TorrentsOrderBy.EpisodeSortDesc],
] as const)(
  'sorts displayed IDs and only defaults when all sorting is cleared: %j',
  async (sort, expected) => {
    const query = jest.fn().mockResolvedValue({ data: { allTorrents: null } });
    await queryTorrents(
      { query } as unknown as ApolloClient<object>,
      {},
      sort,
      {},
      {},
    );
    expect(query.mock.calls[0][0].variables.orderBy).toEqual([expected]);
  },
);
