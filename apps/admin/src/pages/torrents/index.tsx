import Highlight from '@/components/Highlight';
import { Hamburger } from '@/components/Layout';
import {
  ListTorrentsDocument,
  TorrentFieldsFragment,
  TorrentFilter,
  TorrentParseFieldsFragment,
  TorrentsOrderBy,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { matchTorrentEpisode } from '@/utils/matchTorrentTitle';
import useMobile from '@/utils/useMobile';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Space, Tag, Typography } from 'antd';
import prettyBytes from 'pretty-bytes';
import { useMemo, useRef } from 'react';
import styles from './index.module.less';
import md5 from 'md5';

const colors = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];
function chooseColor(text: string) {
  const hash = md5(text);
  return colors[parseInt(hash.substring(0, 8), 16) % colors.length];
}

function useColumns() {
  return useMemo(
    (): ProColumns<TorrentFieldsFragment & TorrentParseFieldsFragment>[] => [
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
        width: 450,
        render: (_, r) => (
          <div className={styles.title}>
            <Highlight content={r.title} match={matchTorrentEpisode} />
          </div>
        ),
      },
      {
        title: '制作组',
        key: 'organizations',
        copyable: false,
        width: 200,
        render: (_, r) => {
          const parts = r.organizationParts ?? [];
          if (!parts.length) {
            return '-';
          }
          return (
            <>
              {parts.map((part) => (
                <Tag color={part ? chooseColor(part) : 'default'}>{part}</Tag>
              ))}
            </>
          );
        },
      },
      {
        title: '剧集名称',
        key: 'aliases',
        copyable: false,
        width: 450,
        render: (_, r) => {
          const aliases = r.seasonTitleAliases ?? [];
          if (!aliases.length) {
            return '-';
          }
          return (
            <>
              {aliases.map((alias) => (
                <Tag color={alias ? chooseColor(alias) : 'default'}>
                  {alias}
                </Tag>
              ))}
            </>
          );
        },
      },
      {
        title: '集数',
        key: 'episode',
        render: (_, r) =>
          typeof r.index === 'number'
            ? `${r.index}`
            : typeof r.indexFrom === 'number' && typeof r.indexTo === 'number'
            ? `${r.indexFrom}-${r.indexTo}`
            : '-',
        width: 72,
      },
      {
        title: '字幕',
        key: 'subtitles',
        width: 100,
        render: (_, r) =>
          r.subtitleHasChs || r.subtitleHasCht || r.subtitleHasJp
            ? `${r.subtitleHasChs ? '简' : ''}${r.subtitleHasCht ? '繁' : ''}${
                r.subtitleHasJp ? '日' : ''
              }${r.subtitleType || ''}`
            : '-',
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
        width: 120,
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
  const mobile = useMobile();
  return (
    <>
      <ProTable<TorrentFieldsFragment & TorrentParseFieldsFragment>
        request={(params, sort, filter) =>
          queryTorrents(client, params, sort, filter)
        }
        columns={columns}
        rowKey="id"
        pagination={{
          pageSizeOptions: [50, 100, 200],
          defaultPageSize: 100,
          className: styles.pagination,
          ...(mobile
            ? {
                showTotal: () => null,
              }
            : {}),
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
        className={styles.root}
        scroll={{
          x: 1000,
        }}
      />
    </>
  );
}
