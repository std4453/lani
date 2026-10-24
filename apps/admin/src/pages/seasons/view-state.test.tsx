jest.mock('@/utils/search', () => jest.requireActual('@/utils/search/column'));
jest.mock('@/constants/icon-path', () => ({ IconPath: {} }));
jest.mock('@/utils/error', () => ({ handleError: jest.fn() }));
jest.mock('@/components/MainTable/index.module.less', () => ({}));
let mockTable: ProTableProps<any, any>;
let mockMobile = false;
const mockCardRefresh = jest.fn();
let mockCardQuery = {
  loading: false,
  error: undefined as Error | undefined,
  data: { allSeasons: { edges: [], totalCount: 180 } } as
    | { allSeasons: { edges: []; totalCount: number } }
    | undefined,
};
const mockQuery = jest.fn();
const mockHistory = {
  location: { pathname: '/seasons', search: '' },
  replace: jest.fn(),
  push: jest.fn(),
};
jest.mock('umi', () => ({ useHistory: () => mockHistory, Link: 'a' }));
jest.mock('store2', () => ({ get: () => 'list', set: jest.fn() }));
jest.mock('@/store/hooks', () => ({ useAppSelector: () => false }));
jest.mock('@/utils/useMobile', () => ({
  __esModule: true,
  ...jest.requireActual('@/utils/useMobile'),
  default: () => mockMobile,
}));
jest.mock('@/components/PageTitle', () => () => null);
jest.mock('@/components/Layout', () => ({ TableTitle: 'span' }));
jest.mock('@/components/TaskDetailsDialog', () => ({
  useTaskDetailsDialog: () => [null, null, jest.fn()],
}));
jest.mock('@/components/EpisodeDetailsDialog', () => ({
  useEpisodeDetailsDialog: () => [null, null, jest.fn()],
}));
jest.mock('./CreateSeasonDialog', () => ({
  useCreateSeasonDialog: () => [null, null, jest.fn()],
}));
jest.mock('./AddFromBangumiDialog', () => ({
  useAddFromBangumiDialog: () => [null, null, jest.fn()],
}));
jest.mock('./TestRoutingTitle', () => () => null);
jest.mock('@/utils/useEpisodeStatusPolling', () => ({
  useEpisodeStatusPolling: () => ({ refetch: mockCardRefresh }),
}));
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => ({ query: mockQuery }),
  useQuery: () => ({ ...mockCardQuery, refetch: jest.fn() }),
}));
jest.mock('@/components/MainTable', () => ({
  __esModule: true,
  default: (props: ProTableProps<any, any>) => {
    mockTable = props;
    return <div>{props.toolbar?.settings}</div>;
  },
}));

import ReactDOM from 'react-dom';
import qs from 'qs';
import { act, Simulate } from 'react-dom/test-utils';
import { ProTableProps } from '@ant-design/pro-table';
import MetadataPage from './index';
import { handleError } from '@/utils/error';

let container: HTMLDivElement;
beforeAll(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
});
beforeEach(() => {
  mockMobile = false;
  mockCardRefresh.mockReset().mockResolvedValue(undefined);
  mockHistory.location.search =
    '?p=2&s=30&q=测试&f_isMonitoring=true&c_folder=9';
  mockHistory.replace.mockClear();
  mockQuery.mockReset().mockResolvedValue({
    data: { allSeasons: { edges: [], totalCount: 180 } },
  });
  mockCardQuery = {
    loading: false,
    error: undefined,
    data: { allSeasons: { edges: [], totalCount: 180 } },
  };
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<MetadataPage />, container);
  });
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  jest.useRealTimers();
});
const toggle = () =>
  act(() => Simulate.click(container.querySelector('button[aria-pressed]')!));
const search = (value: string) =>
  act(() => {
    Simulate.change(
      container.querySelector('input[aria-label="搜索季度标题"]')!,
      { target: { value } } as any,
    );
  });
const tableSearch = () => (mockTable.options as any).search;
const pagination = () =>
  mockTable.pagination as Exclude<
    typeof mockTable.pagination,
    false | undefined
  >;
const url = () =>
  qs.parse(mockHistory.replace.mock.calls.slice(-1)[0]?.[0].search);

test('shares pagination and search in both directions and never restores filters', async () => {
  expect(pagination().current).toBe(2);
  toggle();
  expect(container.querySelector('input')?.value).toBe('测试');
  expect(
    container.querySelector('.ant-pagination-item-active')?.textContent,
  ).toBe('2');
  expect(url()).toEqual({ p: '2', s: '30', q: '测试' });
  act(() => Simulate.click(container.querySelector('.ant-pagination-item-3')!));
  expect(url().p).toBe('3');
  toggle();
  expect(pagination().current).toBe(3);
  expect(tableSearch().value).toBe('测试');
  expect(
    mockTable.columns?.every((column) => !column.filteredValue?.length),
  ).toBe(true);
  await act(async () => {
    await mockTable.request!({ current: 3, pageSize: 30 }, {}, {});
  });
  expect(url()).toEqual({ p: '3', s: '30', q: '测试' });
  toggle();
  expect(
    container.querySelector('.ant-pagination-item-active')?.textContent,
  ).toBe('3');
});

test('keeps a pending card search when switching and cancels its debounce', () => {
  jest.useFakeTimers();
  toggle();
  search('新的标题');
  toggle();
  expect(tableSearch().value).toBe('新的标题');
  expect(pagination().current).toBe(1);
  expect(url()).toEqual({ p: '1', s: '30', q: '新的标题' });
  const count = mockHistory.replace.mock.calls.length;
  act(() => {
    jest.advanceTimersByTime(500);
  });
  expect(mockHistory.replace).toHaveBeenCalledTimes(count);
  act(() => {
    tableSearch().onChange({ target: { value: '列表输入' } });
  });
  toggle();
  expect(container.querySelector('input')?.value).toBe('列表输入');
});

test('debounced card searches reset pagination and clearing search removes q', () => {
  jest.useFakeTimers();
  toggle();
  search('新标题');
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(url()).toEqual({ p: '1', s: '30', q: '新标题' });
  search('');
  act(() => {
    jest.advanceTimersByTime(300);
  });
  expect(url()).toEqual({ p: '1', s: '30' });
});

test.each([false, true])(
  'late list request cannot refill filters after switching (failure=%s)',
  async (failure) => {
    let finish!: () => void;
    mockQuery.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          finish = () =>
            failure
              ? reject(new Error('offline'))
              : resolve({
                  data: { allSeasons: { edges: [], totalCount: 180 } },
                });
        }),
    );
    let pending!: Promise<unknown>;
    act(() => {
      pending = mockTable.request!(
        { current: 2, pageSize: 30 },
        {},
        { isMonitoring: ['true'] },
      );
    });
    toggle();
    await act(async () => {
      finish();
      await pending.catch(() => undefined);
    });
    expect(url()).toEqual({ p: '2', s: '30', q: '测试' });
    toggle();
    expect(
      mockTable.columns?.every((column) => !column.filteredValue?.length),
    ).toBe(true);
  },
);

test.each(['loading', 'error'])(
  'does not clamp the shared page using %s results',
  (state) => {
    mockCardQuery = {
      loading: state === 'loading',
      error: state === 'error' ? new Error('offline') : undefined,
      data: { allSeasons: { edges: [], totalCount: 0 } },
    };
    toggle();
    expect(url().p).toBe('2');
    toggle();
    expect(pagination().current).toBe(2);
  },
);

test.each(['  星海  ', '   '])(
  'uses the same trimmed search in both modes: %j',
  async (keyword) => {
    jest.useFakeTimers();
    toggle();
    search(keyword);
    act(() => {
      jest.advanceTimersByTime(300);
    });
    toggle();
    expect(tableSearch().value).toBe(keyword);
    await act(async () => {
      await mockTable.request!({ current: 1, pageSize: 30 }, {}, {});
    });
    const variables = mockQuery.mock.calls.slice(-1)[0][0].variables;
    expect(variables.filter).toEqual(
      keyword.trim()
        ? { title: { includesInsensitive: keyword.trim() } }
        : {
            jellyfinFolderByJellyfinFolderId: { isHidden: { equalTo: false } },
          },
    );
  },
);

test('keeps the page when only the surrounding search whitespace changes', () => {
  act(() => {
    tableSearch().onChange({ target: { value: '  测试  ' } });
  });
  toggle();
  expect(url()).toEqual({ p: '2', s: '30', q: '测试' });
  expect(container.querySelector('input')?.value).toBe('  测试  ');
  toggle();
  expect(pagination().current).toBe(2);
  expect(tableSearch().value).toBe('  测试  ');
});

test('reports card loading failures with a toast instead of a persistent alert', () => {
  const error = new Error('offline');
  jest.mocked(handleError).mockClear();
  mockCardQuery.error = error;
  toggle();
  expect(handleError).toHaveBeenCalledWith(error, '季度列表获取失败');
  expect(container.querySelector('.ant-alert')).toBeNull();
  expect(container.textContent).not.toContain('暂无季度');
});

test('mobile users can retry an initial card query failure from the toolbar', async () => {
  mockMobile = true;
  mockCardQuery.data = undefined;
  mockCardQuery.error = new Error('offline');
  toggle();
  expect(container.querySelector('.ant-alert')).toBeNull();
  await act(async () => {
    Simulate.click(container.querySelector('button[aria-label="刷新"]')!);
  });
  expect(mockCardRefresh).toHaveBeenCalledTimes(1);
});
