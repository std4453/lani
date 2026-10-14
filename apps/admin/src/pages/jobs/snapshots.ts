import {
  GetDownloadJobStatesQuery,
  ListDownloadJobsFieldsFragment,
} from '@/generated/types';

/** 固定当前页的成员和顺序，只应用不早于已展示版本的状态。 */
export function applyJobSnapshots(
  rows: ListDownloadJobsFieldsFragment[],
  snapshots: GetDownloadJobStatesQuery['getDownloadJobStates'],
): ListDownloadJobsFieldsFragment[] {
  const byId = new Map(snapshots.map((state) => [state.id, state]));
  return rows.map((row) => {
    const live = byId.get(row.id);
    return live && live.version >= row.version
      ? {
          ...row,
          version: live.version,
          type: live.type,
          workflow: live.workflow,
          status: live.status,
          isFailed: live.isFailed,
          isCancelled: live.isCancelled,
          failedReason: live.failedReason,
          jellyfinEpisodeId: live.jellyfinEpisodeId,
        }
      : row;
  });
}
