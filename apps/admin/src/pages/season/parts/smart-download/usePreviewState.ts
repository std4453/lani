import { useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import type { TaskSummary } from '@lani/workflow';
import { SmartDownloadStateDocument } from '@/generated/types';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';

export interface PreviewTask {
  id: number;
  hash: string;
  summary: TaskSummary;
}

export function usePreviewState(seasonId: number, enabled: boolean = true) {
  const client = useApolloClient();
  const online = useForegroundOnline();
  const pending = useRef<AbortController>();
  const [state, setState] = useState<{
    tasks: Map<string, PreviewTask>;
    mode?: string | null;
  }>({ tasks: new Map() });
  const refresh = useCallback(async () => {
    if (pending.current && !pending.current.signal.aborted) return;
    const controller = new AbortController();
    pending.current = controller;
    try {
      const { data } = await client.query({
        query: SmartDownloadStateDocument,
        variables: { seasonId },
        fetchPolicy: 'no-cache',
        context: {
          fetchOptions: { signal: controller.signal },
          queryDeduplication: false,
        },
      });
      if (!controller.signal.aborted)
        setState({
          tasks: new Map(
            ((data.smartDownloadTasks ?? []) as PreviewTask[]).map((task) => [
              task.hash.toLowerCase(),
              task,
            ]),
          ),
          mode: data.config?.matching?.mode,
        });
    } catch {
      // 保留上次状态；网络恢复或下一轮轮询时重试。
    } finally {
      if (pending.current === controller) pending.current = undefined;
    }
  }, [client, seasonId]);
  useEffect(() => {
    if (enabled && online) void refresh();
    return () => pending.current?.abort();
  }, [refresh, online, enabled]);
  useApolloPoll({
    pollInterval: 5000,
    enabled: enabled && online,
    refetch: refresh,
  });
  return state;
}
