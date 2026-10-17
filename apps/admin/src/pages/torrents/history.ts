import { ApolloClient } from '@apollo/client';
import {
  NyaaHistorySyncStatusDocument,
  SyncNyaaHistoryDocument,
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

export async function syncNyaaHistory(
  client: ApolloClient<object>,
  signal: AbortSignal,
) {
  const context = { fetchOptions: { signal } };
  const { data } = await client.mutate({
    mutation: SyncNyaaHistoryDocument,
    context,
  });
  if (!data) throw new Error('无法启动 Nyaa 历史同步');
  const id = data.syncNyaaHistory.id;
  let state = data.syncNyaaHistory;
  while (state.running) {
    await waitForPoll(signal);
    const result = await client.query({
      query: NyaaHistorySyncStatusDocument,
      fetchPolicy: 'network-only',
      context,
    });
    state = result.data.nyaaHistorySync;
    // 重启或另一轮同步会更换 ID，不能把别的结果误报成本次成功。
    if (state.id !== id) throw new Error('同步状态已更新或服务已重启，请重试');
  }
  if (state.error) throw new Error(state.error);
  return state.added;
}
