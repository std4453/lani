import {
  GetTaskStatesDocument,
  LiveTaskFragmentDoc,
  TaskVersionFragmentDoc,
  TaskVersionFragment,
} from '@/generated/types';
import { useApolloClient, useQuery } from '@apollo/client';
import { parseWorkflow, isActive } from '@lani/workflow';
import { useEffect, useMemo, useRef } from 'react';
import { useApolloPoll, useForegroundOnline } from './useApolloPoll';

export function useTaskStates(
  ids: number[],
  enabled: boolean = true,
  activePollInterval: number = 3000,
) {
  const client = useApolloClient();
  const available = useForegroundOnline();
  const stableIds = ids
    .slice()
    .sort((a, b) => a - b)
    .join(',');
  const taskIds = useMemo(
    () => (stableIds ? stableIds.split(',').map(Number) : []),
    [stableIds],
  );
  const query = useQuery(GetTaskStatesDocument, {
    variables: { taskIds },
    skip: !enabled || !available || !taskIds.length,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    nextFetchPolicy: 'cache-first',
  });
  useEffect(() => {
    for (const state of query.data?.getTaskStates ?? []) {
      const workflow = state.workflow ? parseWorkflow(state.workflow) : null;
      const id = client.cache.identify({
        __typename: 'Task',
        id: state.id,
      });
      const old = client.cache.readFragment<TaskVersionFragment>({
        id,
        fragment: TaskVersionFragmentDoc,
      });
      if ((old?.version ?? -1) > state.version) continue;
      client.cache.writeFragment({
        id,
        fragment: LiveTaskFragmentDoc,
        data: {
          ...state,
          workflow,
          batchEntries:
            state.batchEntries?.map(({ __typename, ...entry }) => entry) ??
            null,
          __typename: 'Task',
        },
      });
    }
  }, [query.data, client]);
  const pending = useRef<Promise<unknown>>();
  const latest = useRef({ query, enabled, available, taskIds });
  latest.current = { query, enabled, available, taskIds };
  const idleWaiters = useRef(new Set<() => void>());
  const mounted = useRef(true);
  useEffect(() => {
    if (!query.loading) {
      idleWaiters.current.forEach((resolve) => resolve());
      idleWaiters.current.clear();
    }
  }, [query.loading]);
  useEffect(() => {
    mounted.current = true;
    const waiters = idleWaiters.current;
    return () => {
      mounted.current = false;
      waiters.forEach((resolve) => resolve());
      waiters.clear();
    };
  }, []);
  const serial = (refresh: () => Promise<unknown>, force = false) => {
    if (!force && pending.current) return pending.current;
    if (!force && latest.current.query.loading) return Promise.resolve();
    const previous = pending.current;
    const request = (async () => {
      // 操作后的刷新必须晚于所有在途请求，即使此前请求失败也要重新查询。
      await previous?.catch(() => undefined);
      if (force && mounted.current && latest.current.query.loading) {
        await new Promise<void>((resolve) => idleWaiters.current.add(resolve));
      }
      const current = latest.current;
      if (
        !mounted.current ||
        !current.enabled ||
        !current.available ||
        !current.taskIds.length
      )
        return;
      return refresh();
    })().finally(() => {
      if (pending.current === request) pending.current = undefined;
    });
    pending.current = request;
    return request;
  };
  const refetch = () => serial(() => latest.current.query.refetch(), true);
  const activeIds =
    query.data?.getTaskStates
      .filter((task) => task.workflow && isActive(parseWorkflow(task.workflow)))
      .map((task) => task.id) ?? [];
  useApolloPoll({
    refetch: () => serial(() => latest.current.query.refetch()),
    pollInterval: 30000,
    enabled: enabled && !!taskIds.length,
  });
  useApolloPoll({
    // Apollo 按 TaskState.id 合并实体，主查询保留当前页的完整集合。
    refetch: () =>
      serial(() =>
        client.query({
          query: GetTaskStatesDocument,
          variables: { taskIds: activeIds },
          fetchPolicy: 'network-only',
        }),
      ),
    pollInterval: activePollInterval,
    enabled: enabled && !!activeIds.length,
  });
  return { ...query, refetch };
}
