import { applyJobSnapshots } from './snapshots';
import { WorkflowStepTag } from '@/components/DownloadWorkflow/StepTag';
import { TaskTypeTag, taskTypeLabels } from '@/components/TaskDetailsDialog';
import { WorkflowStatusTag } from '@/components/DownloadWorkflow';
import { useDownloadJobStates } from '@/utils/useDownloadJobStates';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { parseWorkflow, currentStep } from '@lani/download-workflow';
import { GetDownloadJobListSignatureDocument } from '@/generated/types';
import { formatNumbering } from '@/utils/episode';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import { Hamburger } from '@/components/Layout';
import MainTable from '@/components/MainTable';
import tableStyles from '@/components/MainTable/index.module.less';
import { DownloadStatusTag } from '@/constants/download-status';
import { jellyfinEpisodeLink } from '@/constants/link';
import {
  DownloadJobFilter,
  TaskType,
  ListDownloadJobsDocument,
  ListDownloadJobsFieldsFragment,
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
    (): ProColumns<ListDownloadJobsFieldsFragment>[] => [
      {
        title: 'ID',
        dataIndex: 'id',
        align: 'center',
        width: 96,
        className: tableStyles.compactCell,
      },
      {
        title: '任务类型',
        dataIndex: 'type',
        width: 110,
        filters: true,
        valueEnum: taskTypeLabels,
        render: (_, row) => <TaskTypeTag type={row.type} />,
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
        dataIndex: 'status',
        render: (_, r) => (
          <div>
            {r.workflow ? (
              <WorkflowStepTag step={currentStep(parseWorkflow(r.workflow))} />
            ) : (
              <DownloadStatusTag status={r.status} />
            )}
          </div>
        ),
        width: 84,
      },
      {
        title: '状态',
        dataIndex: 'isFailed',
        render: (_, row) => <WorkflowStatusTag job={row} />,
        valueEnum: {
          true: {
            text: '运行失败',
            status: 'Error',
          },
          false: {
            text: '正常',
            status: 'Default',
          },
        },
        width: 120,
        filters: true,
      },
      {
        title: '失败原因',
        dataIndex: 'failedReason',
        width: 240,
        ellipsis: false,
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
              void openTaskDetails({ jobId: r.id });
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

async function queryDownloadJobs(
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
    isFailed,
    type,
  }: {
    isFailed?: ('true' | 'false')[];
    type?: TaskType[];
  },
) {
  const filter: DownloadJobFilter = {
    ...(type?.length ? { type: { in: type } } : {}),
    ...(isFailed?.length
      ? {
          isFailed: {
            in: isFailed.map((value) => value === 'true'),
          },
        }
      : undefined),
  };
  try {
    const { data } = await client.query({
      query: ListDownloadJobsDocument,
      fetchPolicy: 'network-only',
      variables: {
        first: pageSize,
        offset: pageSize * (current - 1),
        ...(Object.keys(filter).length > 0 ? { filter } : undefined),
      },
    });
    const result = data.allDownloadJobs;
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

export default function JobsPage() {
  const client = useApolloClient();
  const [taskDetailsDialog, , openTaskDetails] = useTaskDetailsDialog();
  const columns = useColumns({ openTaskDetails });
  const actionRef = useRef<ActionType>();
  const [rows, setRows] = useState<ListDownloadJobsFieldsFragment[]>([]);
  const [changed, setChanged] = useState(false);
  const requestSequence = useRef(0);
  const baseline = useRef({
    offset: 0,
    first: 30,
    isFailed: undefined as boolean[] | undefined,
    types: undefined as TaskType[] | undefined,
    ids: [] as number[],
    total: 0,
  });
  const states = useDownloadJobStates(rows.map((row) => row.id));
  const displayed = applyJobSnapshots(
    rows,
    states.data?.getDownloadJobStates ?? [],
  );
  useApolloPoll({
    pollInterval: 30000,
    refetch: async () => {
      const snapshot = baseline.current;
      const { data } = await client.query({
        query: GetDownloadJobListSignatureDocument,
        variables: {
          offset: snapshot.offset,
          first: snapshot.first,
          isFailed: snapshot.isFailed,
          types: snapshot.types,
        },
        fetchPolicy: 'network-only',
      });
      if (snapshot !== baseline.current) return;
      const latest = data.getDownloadJobListSignature;
      setChanged(
        latest.total !== snapshot.total ||
          latest.ids.join(',') !== snapshot.ids.join(','),
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
      <MainTable<ListDownloadJobsFieldsFragment>
        columns={columns}
        rowKey="id"
        dataSource={displayed}
        request={async (params, sort, filter) => {
          const sequence = ++requestSequence.current;
          const result = await queryDownloadJobs(client, params, sort, filter);
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
              isFailed: filter.isFailed?.map((value) => value === 'true'),
              types: Object.values(TaskType).filter((type) =>
                filter.type?.includes(type),
              ),
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
          x: 1342,
        }}
      />
      {taskDetailsDialog}
    </>
  );
}
