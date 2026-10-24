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
  state = decodeAntdSearch({ f_season: 'match', c_part: '星海字幕' });
  const container = document.createElement('div');
  try {
    act(() => {
      ReactDOM.render(<Torrents />, container);
    });
    const { filter } = parseDefaultColumnConfig(columns);
    expect(filter.season).toEqual(['match']);
    const season = columns.findIndex(
      (column) => column.dataIndex === 'aliases',
    );
    const organization = columns.findIndex(
      (column) => column.dataIndex === 'season',
    );
    expect(season).toBeLessThan(organization);
    expect(columns[organization].width).toBe(160);
    expect(columns[organization].filterMultiple).toBe(false);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  }
});
