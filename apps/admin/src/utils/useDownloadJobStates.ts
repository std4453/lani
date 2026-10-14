import { GetDownloadJobStatesDocument } from '@/generated/types';
import { gql, useApolloClient, useQuery } from '@apollo/client';
import { parseWorkflow, isActive } from '@lani/download-workflow';
import { useEffect, useMemo, useRef } from 'react';
import { useApolloPoll, useForegroundOnline } from './useApolloPoll';

const stateFragment = gql`
  fragment LiveDownloadJob on DownloadJob {
    id
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
export function useDownloadJobStates(ids: number[], enabled: boolean = true) {
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
  const serial = (refresh: () => Promise<unknown>) => {
    if (pending.current) return pending.current;
    if (query.loading) return Promise.resolve();
    const request = refresh().finally(() => {
      pending.current = undefined;
    });
    pending.current = request;
    return request;
  };
  const refetch = () => serial(() => query.refetch());
  const activeIds =
    query.data?.getDownloadJobStates
      .filter((job) => job.workflow && isActive(parseWorkflow(job.workflow)))
      .map((job) => job.id) ?? [];
  useApolloPoll({
    refetch,
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
    pollInterval: 3000,
    enabled: enabled && !!activeIds.length,
  });
  return { ...query, refetch };
}
