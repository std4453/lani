import { ApolloClient } from '@apollo/client';
import {
  TorrentHistorySyncStatusDocument,
  SyncTorrentHistoryDocument,
} from '@/generated/types';

function waitForPoll(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new Error('已停止等待，后台同步仍会继续'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, 2000);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

export async function syncTorrentHistory(
  client: ApolloClient<object>,
  signal: AbortSignal,
) {
  const context = { fetchOptions: { signal } };
  const { data } = await client.mutate({
    mutation: SyncTorrentHistoryDocument,
    context,
  });
  if (!data?.syncTorrentHistory) throw new Error('无法启动历史种子同步');
  const id = data.syncTorrentHistory;
  while (true) {
    await waitForPoll(signal);
    const { data: result } = await client.query({
      query: TorrentHistorySyncStatusDocument,
      variables: { id },
      fetchPolicy: 'network-only',
      context,
    });
    const state = result.torrentHistorySync;
    if (state.error) throw new Error(state.error);
    if (!state.running) return;
  }
}
