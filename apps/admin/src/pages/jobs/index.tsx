import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import { Hamburger } from '@/components/Layout';
import { DownloadStatusTag } from '@/constants/download-status';
import { jellyfinEpisodeLink } from '@/constants/link';
import {
  DownloadJobFilter,
  ListDownloadJobsDocument,
  ListDownloadJobsFieldsFragment,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import useMobile from '@/utils/useMobile';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Typography } from 'antd';
import { useMemo, useRef } from 'react';
import { Link } from 'umi';
import styles from './index.module.less';

function useColumns({
  openEpisodeDetails,
}: {
  openEpisodeDetails: ReturnType<typeof useEpisodeDetailsDialog>[2];
}) {
  return useMemo(
    (): ProColumns<ListDownloadJobsFieldsFragment>[] => [
      {
        title: '',
        dataIndex: 'id',
        align: 'center',
        width: 48,
      },
      {
        title: '剧集',
        key: 'episode',
        width: 450,
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
              &nbsp;/&nbsp;#{episode.index}
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
            <DownloadStatusTag status={r.status} />
          </div>
        ),
        width: 84,
      },
      {
        title: '状态',
        dataIndex: 'isFailed',
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
              if (r.episodeByEpisodeId?.id) {
                void openEpisodeDetails({
                  episodeId: r.episodeByEpisodeId.id,
                  jobId: r.id,
                });
              }
            }}
          >
            详情
          </Typography.Link>,
        ],
        width: 120,
      },
    ],
    [openEpisodeDetails],
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
  }: {
    isFailed?: ('true' | 'false')[];
  },
) {
  const filter: DownloadJobFilter = {
    ...(isFailed
      ? {
          isFailed: {
            in: isFailed.map((value) => value === 'true'),
          },
        }
      : undefined),
  };
  const { data, error } = await client.query({
    query: ListDownloadJobsDocument,
    variables: {
      first: pageSize,
      offset: pageSize * (current - 1),
      ...(Object.keys(filter).length > 0 ? { filter } : undefined),
    },
  });
  if (error) {
    console.error(error);
    return {
      success: false,
    };
  }
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
}

export default function JobsPage() {
  const client = useApolloClient();
  const [episodeDetailsDiglog, , openEpisodeDetails] =
    useEpisodeDetailsDialog();
  const columns = useColumns({ openEpisodeDetails });
  const actionRef = useRef<ActionType>();
  const mobile = useMobile();

  return (
    <>
      <ProTable<ListDownloadJobsFieldsFragment>
        columns={columns}
        rowKey="id"
        request={(params, sort, filter) =>
          queryDownloadJobs(client, params, sort, filter)
        }
        pagination={{
          pageSizeOptions: [30, 50, 100],
          defaultPageSize: 30,
          className: styles.pagination,
          ...(mobile
            ? {
                showTotal: () => null,
              }
            : {}),
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
        className={styles.root}
        scroll={{
          x: 1000,
        }}
      />
      {episodeDetailsDiglog}
    </>
  );
}
