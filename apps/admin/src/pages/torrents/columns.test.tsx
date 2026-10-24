let state: ReturnType<typeof decodeAntdSearch>;
const update = jest.fn();
let columns: ProColumns<Record<string, unknown>>[];
jest.mock('@/utils/search/query', () => ({}));
jest.mock('@/components/MainTable/index.module.less', () => ({}));
jest.mock('@/utils/search/hooks', () => ({
  withAntdSearch: (component: unknown) => component,
  useAntdSearchProps: () => ({}),
  useAntdSearchContext: () => ({ observedState: state, update }),
}));
jest.mock('@apollo/client', () => ({ useApolloClient: () => ({}) }));
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
import { decodeAntdSearch } from '@/utils/search/encode';

it('直接打开关联筛选 URL 时，表格首次请求携带相同筛选', () => {
  state = decodeAntdSearch({
    f_season: 'match',
    c_part: '星海字幕',
    f_subtitles: 'zh|ja',
    o_displayId: 'ascend',
  });
  const container = document.createElement('div');
  try {
    act(() => {
      ReactDOM.render(<Torrents />, container);
    });
    const { filter, sort } = parseDefaultColumnConfig(columns);
    expect(sort.displayId).toBe('ascend');
    expect(
      columns.find((column) => column.dataIndex === 'displayId')?.sorter,
    ).toBe(true);
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
      { text: '中文（包括简体、繁体）', value: 'zh' },
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
