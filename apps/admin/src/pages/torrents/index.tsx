import Highlight from '@/components/Highlight';
import { Hamburger } from '@/components/Layout';
import {
  ListTorrentsDocument,
  TorrentFieldsFragment,
  TorrentFilter,
  TorrentsOrderBy,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { matchTorrentEpisode } from '@/utils/matchTorrentTitle';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Space, Typography } from 'antd';
import prettyBytes from 'pretty-bytes';
import { useMemo, useRef } from 'react';

function useColumns() {
  return useMemo(
    (): ProColumns<TorrentFieldsFragment>[] => [
      {
        title: 'ID',
        dataIndex: 'id',
        align: 'center',
        width: 96,
      },
      {
        title: '种子标题',
        dataIndex: 'title',
        copyable: true,
        render: (_, r) => (
          <Highlight content={r.title} match={matchTorrentEpisode} />
        ),
      },
      {
        title: '集数',
        key: 'episode',
        render: (_, r) => r.episodeIndex,
        width: 72,
      },
      {
        title: '发布时间',
        dataIndex: 'publishDate',
        valueType: 'dateTime',
        width: 180,
        sorter: true,
        defaultSortOrder: 'descend',
      },
      {
        title: '种子大小',
        dataIndex: 'size',
        width: 100,
        render: (_, r) =>
          r.size ? prettyBytes(parseInt(r.size as string)) : '-',
      },
      {
        title: '操作',
        render: (_, r) => (
          <Space direction="horizontal">
            <Typography.Link
              href={r.torrentLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              种子链接
            </Typography.Link>
          </Space>
        ),
        width: 200,
      },
    ],
    [],
  );
}

async function queryTorrents(
  client: ApolloClient<object>,
  {
    pageSize = 10,
    current = 0,
    keyword,
  }: {
    pageSize?: number;
    current?: number;
    keyword?: string;
  },
  {
    publishDate: publishDateSort,
  }: {
    publishDate?: 'ascend' | 'descend';
  },
  _filter: {},
) {
  const filter: TorrentFilter = {
    ...(keyword
      ? {
          title: {
            includesInsensitive: keyword,
          },
        }
      : undefined),
  };
  const orderBy: TorrentsOrderBy[] = [
    ...(publishDateSort
      ? publishDateSort === 'ascend'
        ? [TorrentsOrderBy.PublishDateAsc]
        : [TorrentsOrderBy.PublishDateDesc]
      : []),
  ];
  const { data, error } = await client.query({
    query: ListTorrentsDocument,
    variables: {
      first: pageSize,
      offset: pageSize * (current - 1),
      orderBy: orderBy.length > 0 ? orderBy : [TorrentsOrderBy.PublishDateDesc],
      ...(Object.keys(filter).length > 0 ? { filter } : undefined),
    },
  });
  if (error) {
    console.error(error);
    return {
      success: false,
    };
  }
  const result = data.allTorrents;
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

export default function Torrents() {
  const columns = useColumns();
  const ref = useRef<ActionType>();
  const client = useApolloClient();
  return (
    <>
      <ProTable<TorrentFieldsFragment>
        request={(params, sort, filter) =>
          queryTorrents(client, params, sort, filter)
        }
        columns={columns}
        rowKey="id"
        pagination={{
          pageSizeOptions: [50, 100, 200],
          defaultPageSize: 100,
        }}
        defaultSize="middle"
        headerTitle={
          <>
            <Hamburger inTable />
            种子列表
          </>
        }
        actionRef={ref}
        search={false}
        options={{
          search: true,
        }}
      />
    </>
  );
}
