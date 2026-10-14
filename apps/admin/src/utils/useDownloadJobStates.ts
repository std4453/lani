import { GetDownloadJobStatesDocument } from '@/generated/types';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { parseWorkflow, isActive } from '@lani/download-workflow';
import { useEffect, useMemo, useRef } from 'react';
import { useApolloPoll, useForegroundOnline } from './useApolloPoll';

const stateFragment = gql`
  fragment LiveDownloadJob on DownloadJob {
    id
    type
    version
    workflow
    status
    isFailed
    isCancelled
    failedReason
    qbtTorrentHash
    torrentTitle
    downloadPath
    importPath
    filePath
    nfoPath
    jellyfinEpisodeId
  }
`;
export function useDownloadJobStates(
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
  const jobIds = useMemo(
    () => (stableIds ? stableIds.split(',').map(Number) : []),
    [stableIds],
  );
  const query = useQuery(GetDownloadJobStatesDocument, {
    variables: { jobIds },
    skip: !enabled || !available || !jobIds.length,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    nextFetchPolicy: 'cache-first',
  });
  useEffect(() => {
    for (const state of query.data?.getDownloadJobStates ?? []) {
      const workflow = state.workflow ? parseWorkflow(state.workflow) : null;
      const id = client.cache.identify({
        __typename: 'DownloadJob',
        id: state.id,
      });
      const old = client.cache.readFragment<{ version?: number }>({
        id,
        fragment: gql`
          fragment JobVersion on DownloadJob {
            version
          }
        `,
      });
      if ((old?.version ?? -1) > state.version) continue;
      client.cache.writeFragment({
        id,
        fragment: stateFragment,
        data: { ...state, workflow, __typename: 'DownloadJob' },
      });
    }
  }, [query.data, client]);
  const pending = useRef<Promise<unknown>>();
  const latest = useRef({ query, enabled, available, jobIds });
  latest.current = { query, enabled, available, jobIds };
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
        !current.jobIds.length
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
    query.data?.getDownloadJobStates
      .filter((job) => job.workflow && isActive(parseWorkflow(job.workflow)))
      .map((job) => job.id) ?? [];
  useApolloPoll({
    refetch: () => serial(() => latest.current.query.refetch()),
    pollInterval: 30000,
    enabled: enabled && !!jobIds.length,
  });
  useApolloPoll({
    // Apollo 按 DownloadLifecycle.id 合并实体，主查询保留当前页的完整集合。
    refetch: () =>
      serial(() =>
        client.query({
          query: GetDownloadJobStatesDocument,
          variables: { jobIds: activeIds },
          fetchPolicy: 'network-only',
        }),
      ),
    pollInterval: activePollInterval,
    enabled: enabled && !!activeIds.length,
  });
  return { ...query, refetch };
}
