import TaskStatus from '@/components/TaskStatus';
import { WorkflowStepTag } from '@/components/TaskWorkflow/StepTag';
import {
  taskState,
  TASK_STATES,
  selectedTaskStates,
} from '@/constants/task-status';
import { taskStateFilter } from './filters';
import styles from './index.module.less';
import { useTaskStates } from '@/utils/useTaskStates';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { parseWorkflow, currentStep } from '@lani/workflow';
import { GetTaskPageSignatureDocument } from '@/generated/types';
import { formatNumbering } from '@/utils/episode';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import { Hamburger } from '@/components/Layout';
import MainTable from '@/components/MainTable';
import tableStyles from '@/components/MainTable/index.module.less';
import {
  DownloadStatusTag,
  LEGACY_EPISODE_STATUS,
} from '@/constants/download-status';
import { jellyfinEpisodeLink } from '@/constants/link';
import {
  TaskFilter,
  TaskType,
  GetTaskStatesQuery,
  ListTasksDocument,
  ListTasksFieldsFragment,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Alert, Typography } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'umi';
import { handleError } from '@/utils/error';

function useColumns({
  openTaskDetails,
}: {
  openTaskDetails: ReturnType<typeof useTaskDetailsDialog>[2];
}) {
  return useMemo(
    (): ProColumns<ListTasksFieldsFragment>[] => [
      {
        title: 'ID',
        dataIndex: 'id',
        align: 'center',
        width: 96,
        className: tableStyles.compactCell,
      },
      {
        title: '剧集',
        key: 'episode',
        render: (_, r) => {
          const episode = r.episodeByEpisodeId;
          if (!episode) {
            return '-';
          }
          const season = episode.seasonBySeasonId;
          if (!season) {
            return '-';
          }
          return (
            <div>
              <Link to={`/season/${season.id}`}>{season.title}</Link>
              &nbsp;/&nbsp;#{formatNumbering(episode.numbering)}
            </div>
          );
        },
      },
      {
        title: '创建于',
        dataIndex: 'createdAt',
        valueType: 'dateTime',
        width: 220,
      },
      {
        title: '步骤',
        className: styles.step,
        dataIndex: 'status',
        render: (_, row) => {
          const state = taskState(row);
          if (state === 'cancelled') return '-';
          if (state === 'succeeded')
            return <DownloadStatusTag status="AVAILABLE" />;
          return row.workflow ? (
            <WorkflowStepTag step={currentStep(parseWorkflow(row.workflow))} />
          ) : (
            <DownloadStatusTag
              status={LEGACY_EPISODE_STATUS[row.legacyStage]}
            />
          );
        },
        width: 128,
      },
      {
        title: '状态',
        key: 'lifecycle',
        render: (_, row) => <TaskStatus task={row} variant="badge" />,
        valueEnum: TASK_STATES,
        width: 120,
        filters: true,
      },
      {
        title: '失败原因',
        dataIndex: 'failedReason',
        width: 240,
        render: (_, row) =>
          row.failedReason ? (
            <Typography.Text
              className={styles.failureReason}
              ellipsis={{
                tooltip: {
                  title: row.failedReason,
                  overlayInnerStyle: {
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  },
                },
              }}
            >
              {row.failedReason}
            </Typography.Text>
          ) : (
            '-'
          ),
      },
      {
        title: 'Jellyfin',
        dataIndex: 'jellyfinEpisodeId',
        width: 120,
        render: (_, r) =>
          r.jellyfinEpisodeId ? (
            <Typography.Link
              href={jellyfinEpisodeLink(r.jellyfinEpisodeId)}
              target="_blank"
              rel="noferer noopener"
            >
              {r.jellyfinEpisodeId.substring(0, 8)}
            </Typography.Link>
          ) : (
            '-'
          ),
      },
      {
        title: '操作',
        render: (_, r) => [
          <Typography.Link
            key={0}
            onClick={() => {
              void openTaskDetails({ taskId: r.id, taskType: r.type });
            }}
          >
            详情
          </Typography.Link>,
        ],
        width: 60,
        className: tableStyles.compactCell,
        fixed: 'right',
      },
    ],
    [openTaskDetails],
  );
}

async function queryTasks(
  client: ApolloClient<object>,
  // search
  {
    pageSize = 10,
    current = 1,
  }: {
    pageSize?: number;
    current?: number;
  },
  // sort
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _sort: any,
  // filter
  {
    lifecycle,
    type,
  }: {
    lifecycle?: string[];
    type?: TaskType[];
  },
) {
  const filter: TaskFilter = {
    ...(type?.length ? { type: { in: type } } : {}),
    ...taskStateFilter(selectedTaskStates(lifecycle)),
  };
  try {
    const { data } = await client.query({
      query: ListTasksDocument,
      fetchPolicy: 'network-only',
      variables: {
        first: pageSize,
        offset: pageSize * (current - 1),
        ...(Object.keys(filter).length > 0 ? { filter } : undefined),
      },
    });
    const result = data.allTasks;
    if (!result) {
      return {
        success: false,
      };
    }
    return {
      data: extractNode(result),
      success: true,
      total: result.totalCount,
    };
  } catch (error) {
    handleError(error, '下载任务获取失败');
    return {
      success: false,
    };
  }
}

/** 固定当前页的成员和顺序，只应用不早于已展示版本的状态。 */
export function applyTaskStates(
  rows: ListTasksFieldsFragment[],
  states: GetTaskStatesQuery['getTaskStates'],
): ListTasksFieldsFragment[] {
  const byId = new Map(states.map((state) => [state.id, state]));
  return rows.map((row) => {
    const live = byId.get(row.id);
    return live && live.version >= row.version
      ? {
          ...row,
          version: live.version,
          type: live.type,
          workflow: live.workflow,
          legacyStage: live.legacyStage,
          isFailed: live.isFailed,
          isCancelled: live.isCancelled,
          failedReason: live.failedReason,
          jellyfinEpisodeId: live.jellyfinEpisodeId,
        }
      : row;
  });
}

export default function JobsPage() {
  const client = useApolloClient();
  const [taskDetailsDialog, , openTaskDetails] = useTaskDetailsDialog();
  const columns = useColumns({ openTaskDetails });
  const actionRef = useRef<ActionType>();
  const [rows, setRows] = useState<ListTasksFieldsFragment[]>([]);
  const [changed, setChanged] = useState(false);
  const requestSequence = useRef(0);
  const baseline = useRef({
    offset: 0,
    first: 30,
    filter: {} as TaskFilter,
    ids: [] as number[],
    total: 0,
  });
  const states = useTaskStates(rows.map((row) => row.id));
  const displayed = applyTaskStates(rows, states.data?.getTaskStates ?? []);
  useApolloPoll({
    pollInterval: 30000,
    refetch: async () => {
      const snapshot = baseline.current;
      const { data } = await client.query({
        query: GetTaskPageSignatureDocument,
        variables: {
          offset: snapshot.offset,
          first: snapshot.first,
          filter: snapshot.filter,
        },
        fetchPolicy: 'network-only',
      });
      if (snapshot !== baseline.current) return;
      const latest = data.allTasks;
      if (!latest) return;
      setChanged(
        latest.totalCount !== snapshot.total ||
          (extractNode(latest) ?? []).map((task) => task.id).join(',') !==
            snapshot.ids.join(','),
      );
    },
  });

  return (
    <>
      {changed && (
        <Alert
          type="info"
          message={
            <Typography.Link
              onClick={() => {
                void actionRef.current?.reload();
              }}
            >
              任务列表有变化，点击更新
            </Typography.Link>
          }
        />
      )}
      <MainTable<ListTasksFieldsFragment>
        columns={columns}
        rowKey="id"
        dataSource={displayed}
        request={async (params, sort, filter) => {
          const sequence = ++requestSequence.current;
          const result = await queryTasks(client, params, sort, filter);
          if (
            sequence === requestSequence.current &&
            result.success &&
            result.data
          ) {
            setRows(result.data);
            setChanged(false);
            baseline.current = {
              offset: ((params.current ?? 1) - 1) * (params.pageSize ?? 30),
              first: params.pageSize ?? 30,
              filter: {
                ...taskStateFilter(selectedTaskStates(filter.lifecycle)),
                ...(filter.type?.length
                  ? {
                      type: {
                        in: Object.values(TaskType).filter((type) =>
                          filter.type?.includes(type),
                        ),
                      },
                    }
                  : {}),
              },
              ids: result.data.map((row) => row.id),
              total: result.total ?? 0,
            };
          }
          return result;
        }}
        pagination={{
          pageSize: 30,
        }}
        headerTitle={
          <>
            <Hamburger inTable />
            下载任务
          </>
        }
        actionRef={actionRef}
        search={false}
        defaultSize="middle"
        scroll={{
          x: 1276,
        }}
      />
      {taskDetailsDialog}
    </>
  );
}
