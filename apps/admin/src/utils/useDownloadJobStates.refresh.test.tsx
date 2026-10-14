const polls = new Map<number, () => Promise<unknown>>();
jest.mock('./useApolloPoll', () => ({
  useForegroundOnline: () => true,
  useApolloPoll: (options: {
    pollInterval: number;
    refetch: () => Promise<unknown>;
  }) => {
    polls.set(options.pollInterval, options.refetch);
  },
}));

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useDownloadJobStates } from './useDownloadJobStates';
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
};

it.each(['initial', 'poll', 'failed poll'])(
  '手动刷新等待 %s 后发出新请求，不复用旧快照',
  async (phase) => {
    const requests: { complete: () => void; fail: () => void }[] = [];
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            requests.push({
              complete: () => {
                observer.next({ data: { getDownloadJobStates: [] } });
                observer.complete();
              },
              fail: () => observer.error(new Error('offline')),
            });
          }),
      ),
    });
    let latest: ReturnType<typeof useDownloadJobStates>;
    function Harness() {
      latest = useDownloadJobStates([1]);
      return null;
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
      if (phase !== 'initial') {
        await act(async () => {
          requests[0].complete();
        });
        await settle();
        void polls.get(30000)!().catch(() => undefined);
        await settle();
      }
      const count = requests.length;
      let done = false;
      const manual = latest!.refetch().then(() => {
        done = true;
      });
      await settle();
      expect(requests).toHaveLength(count);
      expect(done).toBe(false);
      await act(async () => {
        if (phase === 'failed poll') requests[count - 1].fail();
        else requests[count - 1].complete();
      });
      await settle();
      expect(requests).toHaveLength(count + 1);
      expect(done).toBe(false);
      await act(async () => {
        requests[count].complete();
        await manual;
      });
      expect(done).toBe(true);
    } finally {
      act(() => {
        ReactDOM.unmountComponentAtNode(container);
      });
      client.stop();
    }
  },
);
