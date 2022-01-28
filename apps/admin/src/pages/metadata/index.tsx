import {
  AnimeMetadataOrderBy,
  GetAnimeListDocument,
  GetAnimeListQuery,
  SeasonEnum,
} from '@/generated/types';
import { extractNode, ExtractNode, useProTableRequest } from '@/utils/graphql';
import { LinkOutlined } from '@ant-design/icons';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';

type RowType = ExtractNode<GetAnimeListQuery['allAnimeMetadata']>;

const seasonToText: Record<SeasonEnum, string> = {
  SPRING: '春',
  SUMMER: '夏',
  AUTUMN: '秋',
  WINTER: '冬',
};

const columns: ProColumns<RowType>[] = [
  {
    dataIndex: 'nodeId',
    valueType: 'index',
    width: 48,
  },
  {
    title: '标题',
    dataIndex: 'uniformName',
    copyable: true,
    ellipsis: true,
    tooltip: '统一中文标题，用于前端展示和反查',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项为必填项',
        },
      ],
    },
  },
  {
    title: 'mikanani.me',
    dataIndex: 'mikanAnimeId',
    render: (_, r) =>
      r.mikanAnimeId ? (
        <>
          {_}
          <a
            href={`https://mikanani.me/Home/Bangumi/${r.mikanAnimeId}`}
            target="_blank"
            style={{
              marginLeft: 4,
            }}
          >
            <LinkOutlined />
          </a>
        </>
      ) : (
        '-'
      ),
    search: false,
    width: 120,
  },
  {
    title: 'B站港澳台',
    tooltip: 'B站港澳台番剧SSID，国内无法打开，必须使用港澳台IP',
    dataIndex: 'bilibiliThmSsid',
    valueType: 'text',
    copyable: true,
    search: false,
    width: 120,
  },
  {
    title: 'B站国内',
    tooltip: 'B站国内番剧SSID',
    dataIndex: 'bilibiliMainlandSsid',
    search: false,
    render: (_, r) =>
      r.bilibiliMainlandSsid ? (
        <>
          {_}
          <a
            href={`https://www.bilibili.com/bangumi/play/ss${r.bilibiliMainlandSsid}`}
            target="_blank"
            style={{
              marginLeft: 4,
            }}
          >
            <LinkOutlined />
          </a>
        </>
      ) : (
        '-'
      ),
    width: 120,
    copyable: true,
  },
  {
    title: 'Jellyfin',
    dataIndex: 'jellyfinSeasonId',
    render: (_, r) =>
      r.jellyfinSeasonId ? (
        <>
          {_}
          <a
            href={`https://jellyfin.std4453.com:444/web/index.html#!/details?serverId=510e48488c4e4a6b981894df79711cdc&id=${r.jellyfinSeasonId}`}
            target="_blank"
            style={{
              marginLeft: 4,
            }}
          >
            <LinkOutlined />
          </a>
        </>
      ) : (
        '-'
      ),
    search: false,
    copyable: true,
    ellipsis: true,
  },
  {
    title: 'Sonarr',
    key: 'sonarr',
    render: (_, r) =>
      r.sonarrSeason && r.sonarrSeryBySonarrSeries ? (
        <>
          {r.sonarrSeryBySonarrSeries.sonarrSlug} / S
          {`${r.sonarrSeason}`.padStart(2, '0')}
          <a
            href={`https://sonarr.std4453.com:444/series/${r.sonarrSeryBySonarrSeries.sonarrSlug}`}
            target="_blank"
            style={{
              marginLeft: 4,
            }}
          >
            <LinkOutlined />
          </a>
        </>
      ) : (
        '-'
      ),
    search: false,
  },
  {
    title: 'tvdb',
    key: 'tvdbid',
    tooltip: 'TheTVDB用ID反向解析slug',
    render: (_, r) =>
      r.sonarrSeryBySonarrSeries?.tvdbid ? (
        <>
          {r.sonarrSeryBySonarrSeries?.tvdbid}
          <a
            href={`https://www.thetvdb.com/dereferrer/series/${r.sonarrSeryBySonarrSeries.tvdbid}`}
            target="_blank"
            style={{
              marginLeft: 4,
            }}
          >
            <LinkOutlined />
          </a>
        </>
      ) : (
        '-'
      ),
    search: false,
    width: 120,
  },
  {
    title: '季度',
    key: 'semester',
    render: (_, r) =>
      r.semesterBySemester ? (
        <>
          {r.semesterBySemester.year} /{' '}
          {seasonToText[r.semesterBySemester.season]}
        </>
      ) : (
        '-'
      ),
    width: 120,
    search: false,
  },
  {
    title: '操作',
    valueType: 'option',
    render: (_, record, _i, action) => [
      <a
        key="editable"
        onClick={() => {
          action?.startEditable?.(record.nodeId);
        }}
      >
        编辑
      </a>,
    ],
    search: false,
    width: 120,
  },
];

async function queryGetAnimeList(
  client: ApolloClient<object>,
  {
    pageSize = 10,
    current = 0,
    uniformName,
  }: {
    pageSize?: number;
    current?: number;
    uniformName?: string;
  },
) {
  const { data, error } = await client.query({
    query: GetAnimeListDocument,
    variables: {
      count: pageSize,
      offset: pageSize * (current - 1),
      orderBy: AnimeMetadataOrderBy.Natural,
      ...(uniformName
        ? {
            filter: {
              uniformName: {
                includes: uniformName,
              },
            },
          }
        : {}),
    },
  });
  if (error) {
    console.error(error);
    return {
      success: false,
    };
  }
  const result = data.allAnimeMetadata;
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

export default function MetadataPage() {
  const client = useApolloClient();
  return (
    <ProTable<RowType, { uniformName?: string }>
      columns={columns}
      request={(params) => queryGetAnimeList(client, params)}
      rowKey="nodeId"
      pagination={{
        pageSizeOptions: [10, 30, 50],
        defaultPageSize: 30,
      }}
      headerTitle="元数据"
    />
  );
}
