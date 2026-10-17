import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { atomTypes, AtomRegistry, buildWorkflowSnapshot } from '@lani/workflow';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useTaskStates } from './useTaskStates';
import { LiveTaskFragmentDoc } from '@/generated/types';
import { batchImportEntries } from '@lani/workflow';

it.each([2000, 3000])(
  '按 %i ms 仅刷新活动任务，终态停止高频刷新',
  async (interval) => {
    jest.useFakeTimers();
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    const registry = Object.fromEntries(
      atomTypes.map((atom) => [atom, { wants: [] }]),
    ) as unknown as AtomRegistry;
    const workflow = buildWorkflowSnapshot(
      [{ id: 'submit', atom: 'submitDownload', title: '提交' }],
      registry,
      '2026-10-14T12:00:00Z',
    );
    const requested: number[][] = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        (operation) =>
          new Observable((observer) => {
            const ids: number[] = operation.variables.taskIds;
            requested.push(ids);
            observer.next({
              data: {
                getTaskStates: ids.map((id) => ({
                  __typename: 'TaskState',
                  type: 'BATCH_IMPORT',
                  batchEntries: [
                    {
                      __typename: 'BatchImportEntryState',
                      id: 'stable-entry',
                      episodeId: 5,
                      sourcePath: '/source.mkv',
                      importPath: '/source.mkv',
                      filePath: '/target.mkv',
                      nfoPath: null,
                      jellyfinEpisodeId: null,
                    },
                  ],
                  id,
                  version: requested.length,
                  workflow:
                    id === 1
                      ? {
                          ...workflow,
                          status: requested.length === 1 ? 'running' : 'failed',
                        }
                      : null,
                  legacyStage: 'DOWNLOAD_SUBMITTING',
                  isFailed: id === 2 || requested.length > 1,
                  isCancelled: false,
                  failedReason: '',
                  canRetry: true,
                  canCancel: false,
                  qbtTorrentHash: null,
                  torrentTitle: null,
                  downloadPath: null,
                  importPath: null,
                  filePath: null,
                  nfoPath: null,
                  jellyfinEpisodeId: null,
                })),
              },
            });
            observer.complete();
          }),
      ),
    });
    let latest: ReturnType<typeof useTaskStates>;
    function Harness() {
      latest = useTaskStates([1, 2], true, interval);
      return null;
    }
    const container = document.createElement('div');
    const tick = async (ms: number) => {
      await act(async () => {
        jest.advanceTimersByTime(ms);
        for (let i = 0; i < 20; ++i) await Promise.resolve();
        jest.advanceTimersByTime(1);
        for (let i = 0; i < 20; ++i) await Promise.resolve();
      });
    };
    try {
      act(() => {
        ReactDOM.render(
          <ApolloProvider client={client}>
            <Harness />
          </ApolloProvider>,
          container,
        );
      });
      await tick(1);
      expect(requested).toEqual([[1, 2]]);
      const cached = client.cache.readFragment<{ batchEntries: unknown }>({
        id: 'Task:1',
        fragment: LiveTaskFragmentDoc,
      });
      expect(batchImportEntries(cached?.batchEntries)).toEqual([
        expect.objectContaining({
          id: 'stable-entry',
          filePath: '/target.mkv',
        }),
      ]);
      await tick(interval);
      expect(requested).toEqual([[1, 2], [1]]);
      expect(latest!.data?.getTaskStates.map((task) => task.id)).toEqual([
        1, 2,
      ]);
      expect(latest!.data?.getTaskStates[0].workflow?.status).toBe('failed');
      await tick(interval);
      expect(requested).toHaveLength(2);
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      client.stop();
      jest.useRealTimers();
    }
  },
);
