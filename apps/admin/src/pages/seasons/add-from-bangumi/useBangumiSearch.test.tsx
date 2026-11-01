const query = jest.fn();
const client = { query };
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useApolloClient: () => client,
}));

import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useBangumiSearch } from './useBangumiSearch';

let result: ReturnType<typeof useBangumiSearch>;
let container: HTMLDivElement;
function Probe({
  keywords,
  modern,
  enabled,
}: {
  keywords: string;
  modern: boolean;
  enabled: boolean;
}) {
  result = useBangumiSearch(keywords, modern, enabled);
  return null;
}
function render(
  keywords: string = '高达',
  modern: boolean = true,
  enabled: boolean = true,
) {
  act(() => {
    ReactDOM.render(<Probe {...{ keywords, modern, enabled }} />, container);
  });
}
function page(start: number, count: number) {
  return {
    data: {
      searchBangumi: Array.from({ length: count }, (_, i) => ({
        id: `${start + i}`,
        tags: [],
      })),
    },
  };
}
function deferred() {
  let resolveRequest!: (value: ReturnType<typeof page>) => void;
  let rejectRequest!: (error: Error) => void;
  const promise = new Promise<ReturnType<typeof page>>((resolve, reject) => {
    resolveRequest = resolve;
    rejectRequest = reject;
  });
  return { promise, resolve: resolveRequest, reject: rejectRequest };
}
async function flush() {
  await act(async () => {});
}
beforeEach(() => {
  query.mockReset();
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
});

it('追加下一页，合并重复条目，按上游条数推进偏移，短页停止', async () => {
  query
    .mockResolvedValueOnce(page(0, 20))
    .mockResolvedValueOnce(page(19, 20))
    .mockResolvedValueOnce(page(39, 2));
  render();
  await flush();
  expect(result.items).toHaveLength(20);
  expect(result.hasMore).toBe(true);
  act(() => {
    result.loadMore();
  });
  await flush();
  expect(result.items).toHaveLength(39);
  expect(query.mock.calls[1][0].variables.offset).toBe(20);
  act(() => {
    result.loadMore();
  });
  await flush();
  expect(query.mock.calls[2][0].variables.offset).toBe(40);
  expect(result.items).toHaveLength(41);
  expect(result.hasMore).toBe(false);
  act(() => {
    result.loadMore();
  });
  expect(query).toHaveBeenCalledTimes(3);
});

it('重复触底不会并发请求，失败保留已有结果，重试同一页', async () => {
  const next = deferred();
  query
    .mockResolvedValueOnce(page(0, 20))
    .mockReturnValueOnce(next.promise)
    .mockResolvedValueOnce(page(20, 1));
  render();
  await flush();
  act(() => {
    result.loadMore();
    result.loadMore();
  });
  expect(query).toHaveBeenCalledTimes(2);
  expect(result.loading).toBe(true);
  await act(async () => next.reject(new Error('offline')));
  expect(result.error).toBe(true);
  expect(result.items).toHaveLength(20);
  act(() => {
    result.loadMore();
  });
  await flush();
  expect(query.mock.calls[2][0].variables.offset).toBe(20);
  expect(result.error).toBe(false);
  expect(result.items).toHaveLength(21);
});

it('切换关键词与搜索渠道重置结果，忽略旧请求及迟到错误', async () => {
  const first = deferred(),
    second = deferred();
  query
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise)
    .mockResolvedValueOnce(page(100, 1));
  render();
  render('芙莉莲');
  render('芙莉莲', false);
  await flush();
  expect(query.mock.calls[2][0].variables).toEqual({
    keywords: '芙莉莲',
    useNewBangumiSearchApi: false,
    offset: 0,
  });
  await act(async () => {
    first.resolve(page(0, 20));
    second.reject(new Error('old failure'));
  });
  expect(result.items.map((item) => item.id)).toEqual(['100']);
  expect(result.error).toBe(false);
  expect(result.loading).toBe(false);
});

it('等待防抖或关闭弹窗时停止请求并丢弃迟到数据，重新打开从首页开始', async () => {
  const old = deferred();
  query.mockReturnValueOnce(old.promise).mockResolvedValueOnce(page(50, 1));
  render('高达', true, false);
  expect(query).not.toHaveBeenCalled();
  render();
  render('高达', true, false);
  act(() => {
    result.loadMore();
  });
  await act(async () => old.resolve(page(0, 20)));
  expect(result.items).toEqual([]);
  expect(query).toHaveBeenCalledTimes(1);
  render();
  await flush();
  expect(query.mock.calls[1][0].variables.offset).toBe(0);
  expect(result.items[0].id).toBe('50');
});

it('空结果结束，首屏失败允许重试，卸载后忽略响应', async () => {
  query
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(page(0, 0));
  render();
  await flush();
  expect(result.error).toBe(true);
  act(() => {
    result.loadMore();
  });
  await flush();
  expect(result.hasMore).toBe(false);
  const late = deferred();
  query.mockReturnValueOnce(late.promise);
  render('other');
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  await act(async () => late.resolve(page(0, 20)));
});
