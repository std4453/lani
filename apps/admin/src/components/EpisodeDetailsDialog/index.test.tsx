jest.mock('@/utils/useTaskStates', () => ({
  useTaskStates: () => ({ refetch: jest.fn() }),
}));
jest.mock('@/utils/useApolloPoll', () => ({ useApolloPoll: jest.fn() }));
jest.mock('@/utils/error', () => ({ handleError: jest.fn() }));
jest.mock('./EpisodeHeader', () => () => null);
jest.mock('@/components/TaskStatus', () => () => null);
jest.mock('@/components/TaskWorkflow/TaskContent', () => ({
  __esModule: true,
  default: ({ task }: { task: { id: number } }) => (
    <div data-task={task.id}>任务内容 {task.id}</div>
  ),
}));

import ReactDOM from 'react-dom';
import { act, Simulate } from 'react-dom/test-utils';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  NormalizedCacheObject,
  Observable,
} from '@apollo/client';
import { handleError } from '@/utils/error';
import { useApolloPoll } from '@/utils/useApolloPoll';
import EpisodeDetailsDialog from './index';

const numbering = (type: string, number: string) => ({
  type,
  number,
  sort: number,
});
// 服务端 index 顺序故意不同于详情页按类型与编号排列的顺序。
const episodes = [
  { id: 30, numbering: numbering('sp', '1') },
  { id: 20, numbering: numbering('episode', '2') },
  { id: 10, numbering: numbering('episode', '1.5') },
];
const task = (id: number) => ({
  __typename: 'Task',
  id,
  type: 'DOWNLOAD',
  workflow: null,
  batchEntries: null,
  sourcePath: null,
  episodeId: null,
  createdAt: '2026-01-01',
  downloadPath: null,
  failedAt: null,
  failedReason: '',
  filePath: null,
  importPath: null,
  isFailed: false,
  isCancelled: false,
  version: 0,
  nfoPath: null,
  qbtTorrentHash: null,
  legacyStage: 'UNAVAILABLE',
  torrentLink: null,
  jellyfinEpisodeId: null,
  torrentTitle: null,
  taskEpisodesByTaskId: { nodes: [] },
});
const episode = (id: number) => ({
  __typename: 'Episode',
  id,
  numbering: episodes.find((e) => e.id === id)!.numbering,
  title: `剧集 ${id}`,
  rawAirTime: null,
  airTime: null,
  createdAt: '2026-01-01',
  description: null,
  index: id,
  jellyfinEpisodeId: null,
  seasonBySeasonId: {
    __typename: 'Season',
    id: 8,
    title: '演示季度',
    downloadOffsetHours: 0,
  },
  tasksByEpisodeId: { edges: [{ node: task(id + 2) }, { node: task(id + 1) }] },
});
let container: HTMLDivElement;
let client: ApolloClient<NormalizedCacheObject>;
let calls: string[];
let fail: string | undefined;
let absent: boolean;
let failEpisode: number | undefined;
let detailIds: number[];
let delayedEpisode: number | undefined;
let finishLate: () => void;
const reject = jest.fn();
let render: (
  input: { episodeId?: number; taskId?: number },
  visible?: boolean,
) => void;
const button = (label: string) =>
  document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const click = async (label: string) => {
  await act(async () => {
    Simulate.click(button(label));
  });
};
beforeEach(() => {
  calls = [];
  fail = undefined;
  absent = false;
  failEpisode = undefined;
  detailIds = [];
  delayedEpisode = undefined;
  jest.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
  client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          const name = operation.operationName;
          calls.push(name);
          if (name === 'GetEpisodeById')
            detailIds.push(operation.variables.episodeByIdId);
          if (
            fail === name ||
            (name === 'GetEpisodeById' &&
              operation.variables.episodeByIdId === failEpisode)
          ) {
            observer.error(new Error('offline'));
            return;
          }
          const data =
            name === 'GetEpisodeNavigation'
              ? {
                  episodeById: {
                    __typename: 'Episode',
                    id: operation.variables.episodeId,
                    seasonBySeasonId: {
                      __typename: 'Season',
                      id: 8,
                      episodesBySeasonId: {
                        edges: episodes.map((node) => ({
                          node: { __typename: 'Episode', ...node },
                        })),
                      },
                    },
                  },
                }
              : name === 'GetEpisodeById'
              ? {
                  episodeById:
                    absent && operation.variables.episodeByIdId === 20
                      ? null
                      : episode(operation.variables.episodeByIdId),
                }
              : {
                  taskById: {
                    ...task(operation.variables.id),
                    episodeByEpisodeId: episode(20),
                  },
                };
          const finish = () => {
            observer.next({ data });
            observer.complete();
          };
          if (
            name === 'GetEpisodeById' &&
            operation.variables.episodeByIdId === delayedEpisode
          )
            finishLate = finish;
          else finish();
        }),
    ),
  });
  render = (input, visible = true) => {
    ReactDOM.render(
      <ApolloProvider client={client}>
        <EpisodeDetailsDialog
          input={input}
          visible={visible}
          resolve={jest.fn()}
          reject={reject}
        />
      </ApolloProvider>,
      container,
    );
  };
});
afterEach(() => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
  container.remove();
  client.stop();
});

test('navigates fractional episodes and SP in detail-page order, fetching the list once', async () => {
  await act(async () => render({ episodeId: 10 }));
  expect(button('上一集').disabled).toBe(true);
  expect(button('下一集').disabled).toBe(false);
  await click('下一集');
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '#2 - 剧集 20',
  );
  await click('下一集');
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '#SP 1 - 剧集 30',
  );
  expect(button('下一集').disabled).toBe(true);
  await click('上一集');
  const polling = (useApolloPoll as jest.Mock).mock.calls.slice(-1)[0][0];
  await act(async () => {
    await polling.refetch();
  });
  expect(calls.filter((name) => name === 'GetEpisodeNavigation')).toHaveLength(
    1,
  );
  expect(
    calls.filter((name) => name === 'GetEpisodeById').length,
  ).toBeGreaterThan(3);
});

test('preselects the requested task and resets it on episode changes and reopening', async () => {
  const input = { episodeId: 20, taskId: 21 };
  await act(async () => render(input));
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#21',
  );
  await click('下一集');
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#32',
  );
  await act(async () => render(input, false));
  await act(async () => render(input));
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 20',
  );
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#21',
  );
  await act(async () => render({ episodeId: 10 }));
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 10',
  );
});

test('task entry keeps its task selected and does not fetch navigation', async () => {
  await act(async () => render({ taskId: 21 }));
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#21',
  );
  expect(button('上一集')).toBeNull();
  expect(calls).toEqual(['GetTaskById']);
});

test('navigation failure shows a toast and disables both controls without hiding details', async () => {
  fail = 'GetEpisodeNavigation';
  await act(async () => render({ episodeId: 20 }));
  expect(handleError).toHaveBeenCalledWith(
    expect.any(Error),
    '剧集列表获取失败',
  );
  expect(button('上一集').disabled).toBe(true);
  expect(button('下一集').disabled).toBe(true);
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 20',
  );
});

test.each([false, true])(
  'can navigate away from failed or missing episode details (missing=%s)',
  async (missing) => {
    if (missing) absent = true;
    else failEpisode = 20;
    await act(async () => render({ episodeId: 10, taskId: 11 }));
    await click('下一集');
    expect(document.querySelector('.ant-alert')?.textContent).toBe(
      missing ? '剧集不存在' : '剧集加载失败',
    );
    expect(button('上一集').disabled).toBe(false);
    failEpisode = undefined;
    absent = false;
    await click('上一集');
    expect(document.querySelector('[role="heading"]')?.textContent).toContain(
      '剧集 10',
    );
  },
);

test('a late response cannot replace the episode selected by rapid navigation', async () => {
  delayedEpisode = 20;
  await act(async () => render({ episodeId: 10 }));
  await click('下一集');
  await click('下一集');
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 30',
  );
  await act(async () => {
    finishLate();
  });
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 30',
  );
  expect(document.querySelector('.ant-tabs-tab-active')?.textContent).toContain(
    '#32',
  );
});

test('preloads only adjacent details and switches from cache without a loading skeleton', async () => {
  await act(async () => render({ episodeId: 20 }));
  expect(detailIds.sort()).toEqual([10, 20, 30]);
  expect(document.querySelector('.ant-skeleton')).toBeNull();
  act(() => Simulate.click(button('下一集')));
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 30',
  );
  expect(document.querySelector('.ant-skeleton')).toBeNull();
  await click('上一集');
  await click('上一集');
  expect(detailIds).toHaveLength(3);
});

test('hidden dialogs do not request details or adjacent episodes', async () => {
  await act(async () => render({ episodeId: 20 }, false));
  expect(calls).toEqual([]);
});

test('arrow keys navigate but preserve editing, tabs, modifiers and nested dialogs', async () => {
  const input = { episodeId: 20 };
  await act(async () => render(input));
  const wrap = document.querySelector<HTMLDivElement>('.ant-modal-wrap')!;
  const press = async (target: Element, key: string, extras = {}) => {
    await act(async () => Simulate.keyDown(target, { key, ...extras }));
  };
  const expectEpisode = (id: number) =>
    expect(document.querySelector('[role="heading"]')?.textContent).toContain(
      `剧集 ${id}`,
    );
  await press(button('下一集'), 'ArrowRight');
  expectEpisode(30);
  await press(button('上一集'), 'ArrowRight');
  expectEpisode(30);
  await press(button('上一集'), 'ArrowLeft');
  expectEpisode(20);
  for (const extras of [
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { shiftKey: true },
    { defaultPrevented: true },
  ]) {
    await press(button('上一集'), 'ArrowLeft', extras);
    expectEpisode(20);
  }
  await press(document.querySelector('[role="tab"]')!, 'ArrowLeft');
  expectEpisode(20);
  for (const html of [
    '<input />',
    '<textarea></textarea>',
    '<select></select>',
    '<div contenteditable="true"><span>编辑</span></div>',
    '<div class="ant-modal-wrap"><button>子弹窗</button></div>',
  ]) {
    const host = document.createElement('div');
    host.innerHTML = html;
    wrap.appendChild(host);
    await act(async () => {
      host
        .querySelector('input, textarea, select, span, button')!
        .dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        );
    });
    expectEpisode(20);
    host.remove();
  }
  await act(async () => render(input, false));
  await act(async () => render(input));
  expectEpisode(20);
});

test('reaching either boundary keeps focus inside the dialog and preserves Esc handling', async () => {
  await act(async () => render({ episodeId: 20 }));
  button('下一集').focus();
  await click('下一集');
  expect(document.activeElement).toBe(
    document.querySelector('.ant-modal-wrap'),
  );
  const press = async (key: string, keyCode: number) => {
    await act(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key, keyCode, bubbles: true }),
      );
    });
  };
  await press('ArrowLeft', 37);
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 20',
  );
  button('上一集').focus();
  await press('ArrowLeft', 37);
  expect(document.activeElement).toBe(
    document.querySelector('.ant-modal-wrap'),
  );
  expect(document.querySelector('[role="heading"]')?.textContent).toContain(
    '剧集 10',
  );
  await press('Escape', 27);
  expect(reject).toHaveBeenCalledTimes(1);
});
