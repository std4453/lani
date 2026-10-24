let state: ReturnType<typeof decodeAntdSearch>;
const update = jest.fn();
const query = jest.fn();
let request: (state: ReturnType<typeof decodeAntdSearch>) => Promise<unknown>;
let columns: ProColumns<Record<string, unknown>>[];
jest.mock('@/utils/search/query', () => ({}));
jest.mock('@/components/MainTable/index.module.less', () => ({}));
jest.mock('@/utils/search/hooks', () => ({
  withAntdSearch: (component: unknown) => component,
  useAntdSearchProps: (callback: typeof request) => {
    request = callback;
    return {};
  },
  useAntdSearchContext: () => ({ observedState: state, update }),
}));
jest.mock('@apollo/client', () => ({ useApolloClient: () => ({ query }) }));
jest.mock('@/components/PageTitle', () => () => null);
jest.mock('@/components/Layout', () => ({ TableTitle: () => null }));
jest.mock(
  '@/components/MainTable',
  () => (props: { columns: typeof columns }) => {
    columns = props.columns;
    return null;
  },
);
jest.mock('@/theme', () => ({ useTheme: () => ({ theme: 'light' }) }));
import Torrents from './index';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { parseDefaultColumnConfig } from '@ant-design/pro-table/lib/utils';
import { ProColumns } from '@ant-design/pro-table';
import { decodeAntdSearch, encodeAntdSearch } from '@/utils/search/encode';

it('直接打开关联筛选 URL 时，表格首次请求携带相同筛选', () => {
  state = decodeAntdSearch({
    f_season: 'match',
    c_part: '星海字幕',
    f_subtitles: 'zh|ja',
    o_id: 'ascend',
  });
  const container = document.createElement('div');
  try {
    act(() => {
      ReactDOM.render(<Torrents />, container);
    });
    const { filter, sort } = parseDefaultColumnConfig(columns);
    expect(sort.id).toBe('ascend');
    expect(columns.find((column) => column.dataIndex === 'id')?.sorter).toBe(
      true,
    );
    expect(filter.season).toEqual(['match']);
    const season = columns.findIndex((column) => column.dataIndex === 'season');
    const organization = columns.findIndex(
      (column) => column.key === 'organizations',
    );
    expect(season).toBe(organization + 1);
    expect(filter.subtitles).toEqual(['zh', 'ja']);
    const subtitles = columns.find(
      (column) => column.dataIndex === 'subtitles',
    );
    expect(subtitles?.filterMultiple).toBe(true);
    expect(subtitles?.filters).toEqual([
      { text: '中文', value: 'zh' },
      { text: '日语', value: 'ja' },
      { text: '英语', value: 'en' },
    ]);
    expect(columns[organization].width).toBe(160);
    expect(columns[season].filterMultiple).toBe(false);
    expect(columns[season].filters).toEqual([
      { text: '关联季度', value: 'match' },
      { text: '未关联季度', value: 'no_match' },
    ]);
    expect(columns[organization].filters).toEqual([
      { text: '已过滤', value: '_custom_filtered' },
    ]);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});

it.each(['match', 'no_match'])(
  '名称筛选替换已有 %s，菜单选中名称且首次请求不叠加关联状态',
  async (association) => {
    state = decodeAntdSearch({
      c_alias: '星海旅途',
      f_season: association,
      c_part: '星海字幕',
    });
    query.mockResolvedValue({
      data: { allTorrents: { edges: [], totalCount: 0 } },
    });
    const container = document.createElement('div');
    try {
      act(() => {
        ReactDOM.render(<Torrents />, container);
      });
      const season = columns.find((column) => column.dataIndex === 'season')!;
      expect(season.filters).toEqual([
        { text: '星海旅途', value: '_custom_filtered' },
        { text: '关联季度', value: 'match' },
        { text: '未关联季度', value: 'no_match' },
      ]);
      const { filter } = parseDefaultColumnConfig(columns);
      expect(filter.season).toEqual(['_custom_filtered']);
      await request({ ...state, filter: { season: filter.season ?? [] } });
      expect(query.mock.calls.at(-1)[0].variables.filter).toEqual({
        seasonTitleAliases: { contains: ['星海旅途'] },
        organizationParts: { contains: ['星海字幕'] },
      });
      expect(encodeAntdSearch({}, {}, filter, state.custom)).toEqual({
        c_alias: '星海旅途',
        c_part: '星海字幕',
      });
      act(() => {
        ReactDOM.render(<>{season.title as React.ReactNode}</>, container);
      });
      expect(
        container.querySelector('[aria-label="取消季度名称筛选"]'),
      ).toBeNull();
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
    }
  },
);

it.each([['match'], ['no_match'], []])(
  '从名称筛选改选或重置为 %j 时同步清除名称和 URL 状态',
  async (...season) => {
    state = decodeAntdSearch({ c_alias: '星海旅途', c_part: '星海字幕' });
    query.mockResolvedValue({
      data: { allTorrents: { edges: [], totalCount: 0 } },
    });
    const container = document.createElement('div');
    try {
      act(() => {
        ReactDOM.render(<Torrents />, container);
      });
      const next = { ...state, filter: { season } };
      await request(next);
      expect(next.custom).toEqual({ alias: '', part: '星海字幕' });
      const filter = query.mock.calls.at(-1)[0].variables.filter;
      expect(filter.seasonTitleAliases).toBeUndefined();
      expect(filter.matchedSeasonId).toEqual(
        season.length ? { isNull: season[0] === 'no_match' } : undefined,
      );
      expect(encodeAntdSearch({}, {}, next.filter, next.custom)).toEqual({
        ...(season.length ? { f_season: season[0] } : {}),
        c_part: '星海字幕',
      });
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
    }
  },
);
