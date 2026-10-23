import {
  EpisodeStatusFieldsFragment,
  GetTaskSummariesDocument,
} from '@/generated/types';
import { useApolloClient } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { extractNode } from './graphql';
import { useApolloPoll, useForegroundOnline } from './useApolloPoll';

/** 三个剧集状态入口共用：低频发现新任务，高频只读取活跃任务的结构化摘要。 */
export function useEpisodeStatusPolling({
  episodes,
  refresh,
  loading = false,
  enabled = true,
}: {
  episodes: EpisodeStatusFieldsFragment[];
  refresh(): Promise<unknown>;
  loading?: boolean;
  enabled?: boolean;
}) {
  const client = useApolloClient();
  const available = useForegroundOnline();
  const activeIds = [
    ...new Set(
      episodes.flatMap((episode) => {
        const task = extractNode(episode.tasks)?.[0];
        return task &&
          ['running', 'cancelling'].includes(
            task.statusSummary?.workflow?.status ?? '',
          )
          ? [task.id]
          : [];
      }),
    ),
  ].sort((a, b) => a - b);
  const latest = useRef({ refresh, loading, enabled, available, activeIds });
  latest.current = { refresh, loading, enabled, available, activeIds };
  const pending = useRef<Promise<unknown>>();
  const mounted = useRef(true);
  const waiters = useRef(new Set<() => void>());
  useEffect(() => {
    if (!loading) {
      waiters.current.forEach((resolve) => resolve());
      waiters.current.clear();
    }
  }, [loading]);
  useEffect(() => {
    mounted.current = true;
    const listeners = waiters.current;
    return () => {
      mounted.current = false;
      listeners.forEach((resolve) => resolve());
      listeners.clear();
    };
  }, []);
  const run = (activeOnly: boolean, force = false) => {
    if (!force && pending.current) return pending.current;
    if (!force && latest.current.loading) return Promise.resolve();
    const previous = pending.current;
    const request = (async () => {
      await previous?.catch(() => undefined);
      if (force && mounted.current && latest.current.loading) {
        await new Promise<void>((resolve) => waiters.current.add(resolve));
      }
      const current = latest.current;
      if (!mounted.current || !current.enabled || !current.available) return;
      if (!activeOnly) return current.refresh();
      if (!current.activeIds.length) return;
      return client.query({
        query: GetTaskSummariesDocument,
        variables: { taskIds: current.activeIds },
        fetchPolicy: 'network-only',
      });
    })().finally(() => {
      if (pending.current === request) pending.current = undefined;
    });
    pending.current = request;
    return request;
  };
  useApolloPoll({ refetch: () => run(false), pollInterval: 30000, enabled });
  useApolloPoll({
    refetch: () => run(true),
    pollInterval: 3000,
    enabled: enabled && !!activeIds.length,
  });
  return { refetch: () => run(false, true) };
}
