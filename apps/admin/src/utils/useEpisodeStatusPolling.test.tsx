const polls = new Map<
  number,
  { enabled: boolean; refetch(): Promise<unknown> }
>();
let available = true;
jest.mock('./useApolloPoll', () => ({
  useForegroundOnline: () => available,
  useApolloPoll: (options: {
    pollInterval: number;
    enabled: boolean;
    refetch(): Promise<unknown>;
  }) => {
    polls.set(options.pollInterval, options);
  },
}));

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  Observable,
  useQuery,
} from '@apollo/client';
import { createCache } from '@/client/cache';
import { EpisodeStatusFieldsFragment, TaskType } from '@/generated/types';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useEpisodeStatusPolling } from './useEpisodeStatusPolling';

const episodes: EpisodeStatusFieldsFragment[] = [1, 2, 1].map((id) => ({
  id,
  airTime: null,
  jellyfinEpisodeId: null,
  tasks: {
    edges: [
      {
        node: {
          id,
          type: TaskType.Download,
          statusSummary: {
            version: 1,
            workflow: {
              status: id === 1 ? 'running' : 'succeeded',
              currentStepId: 'step',
              steps: [
                {
                  id: 'step',
                  atom: 'download',
                  title: '动态下载',
                  status: 'running',
                },
              ],
            },
          },
        },
      },
    ],
  },
}));
const settle = async () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

test.each([false, true])(
  '活跃摘要去重、串行请求，手动刷新等待在途请求，失败=%s',
  async (fail) => {
    available = true;
    const requests: { name: string; variables: unknown; done(): void }[] = [];
    const client = new ApolloClient({
      cache: createCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            requests.push({
              name: operation.operationName,
              variables: operation.variables,
              done() {
                if (fail) observer.error(new Error('offline'));
                else {
                  observer.next({ data: { allTasks: { nodes: [] } } });
                  observer.complete();
                }
              },
            });
          }),
      ),
    });
    const refresh = jest.fn(async () => undefined);
    let state: ReturnType<typeof useEpisodeStatusPolling>;
    let enabled = true;
    function Harness() {
      state = useEpisodeStatusPolling({ episodes, refresh, enabled });
      return null;
    }
    const container = document.createElement('div');
    const render = () =>
      act(() => {
        ReactDOM.render(
          <ApolloProvider client={client}>
            <Harness />
          </ApolloProvider>,
          container,
        );
      });
    render();
    try {
      expect(requests).toHaveLength(0);
      const fast = polls
        .get(3000)!
        .refetch()
        .catch(() => undefined);
      await settle();
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        name: 'GetTaskSummaries',
        variables: { taskIds: [1] },
      });
      const slow = polls
        .get(30000)!
        .refetch()
        .catch(() => undefined);
      const manual = state!.refetch();
      await settle();
      expect(refresh).not.toHaveBeenCalled();
      requests[0].done();
      await act(async () => {
        await Promise.all([fast, slow, manual]);
      });
      expect(refresh).toHaveBeenCalledTimes(1);
      available = false;
      render();
      await state!.refetch();
      expect(refresh).toHaveBeenCalledTimes(1);
      available = true;
      enabled = false;
      render();
      expect(polls.get(3000)!.enabled).toBe(false);
      expect(polls.get(30000)!.enabled).toBe(false);
      await state!.refetch();
      expect(refresh).toHaveBeenCalledTimes(1);
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      client.stop();
    }
  },
);

test('活跃摘要更新页面，任务完成后停止快速轮询', async () => {
  available = true;
  const { GetEpisodesStatusDocument } = await import('@/generated/types');
  const calls: string[] = [];
  const task = (status: string, version: number) => ({
    __typename: 'Task',
    id: 1,
    type: TaskType.Download,
    statusSummary: {
      version,
      legacy: null,
      workflow: {
        status,
        currentStepId: 'custom',
        steps: [
          {
            id: 'custom',
            atom: 'download',
            title: '动态任务',
            status,
          },
        ],
      },
    },
  });
  const client = new ApolloClient({
    cache: createCache(),
    link: new ApolloLink(
      (operation) =>
        new Observable((observer) => {
          calls.push(operation.operationName);
          const data =
            operation.operationName === 'GetTaskSummaries'
              ? {
                  allTasks: {
                    __typename: 'TasksConnection',
                    nodes: [task('succeeded', 2)],
                  },
                }
              : {
                  allEpisodes: {
                    __typename: 'EpisodesConnection',
                    edges: [
                      {
                        __typename: 'EpisodesEdge',
                        node: {
                          __typename: 'Episode',
                          id: 1,
                          airTime: null,
                          jellyfinEpisodeId: null,
                          tasks: {
                            __typename: 'TasksConnection',
                            edges: [
                              {
                                __typename: 'TasksEdge',
                                node: task('running', 1),
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                };
          observer.next({ data });
          observer.complete();
        }),
    ),
  });
  function Harness() {
    const query = useQuery(GetEpisodesStatusDocument, {
      variables: { episodeIds: [1] },
    });
    const current =
      query.data?.allEpisodes?.edges.flatMap((edge) =>
        edge.node ? [edge.node] : [],
      ) ?? [];
    useEpisodeStatusPolling({
      episodes: current,
      refresh: query.refetch,
      loading: query.loading,
    });
    return (
      <span>
        {current[0]?.tasks.edges[0].node?.statusSummary?.workflow?.status}
      </span>
    );
  }
  const container = document.createElement('div');
  act(() => {
    ReactDOM.render(
      <ApolloProvider client={client}>
        <Harness />
      </ApolloProvider>,
      container,
    );
  });
  try {
    await settle();
    expect(container.textContent).toBe('running');
    expect(polls.get(3000)!.enabled).toBe(true);
    await act(async () => {
      await polls.get(3000)!.refetch();
    });
    await settle();
    expect(container.textContent).toBe('succeeded');
    expect(polls.get(3000)!.enabled).toBe(false);
    expect(calls).toEqual(['GetEpisodesStatus', 'GetTaskSummaries']);
  } finally {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    client.stop();
  }
});
