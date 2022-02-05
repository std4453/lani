import { useOpenDialog } from '@/components/dialog';
import { seasonToText } from '@/constants';
import {
  AnimeMetadataOrderBy,
  GetAnimeListDocument,
  GetAnimeListQuery,
} from '@/generated/types';
import { extractNode, ExtractNode } from '@/utils/graphql';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Button } from 'antd';
import { useMemo, useRef } from 'react';
import { useHistory } from 'umi';

type RowType = ExtractNode<GetAnimeListQuery['allAnimeMetadata']>;

function useColumns() {
  const history = useHistory();
  return useMemo(
    (): ProColumns<RowType>[] => [
      {
        title: '#',
        dataIndex: 'id',
        width: 48,
        fixed: 'left',
        align: 'center',
      },
      {
        title: '标题',
        dataIndex: 'uniformName',
        copyable: true,
        ellipsis: false,
        tooltip: '统一中文标题，用于前端展示和反查',
        formItemProps: {
          rules: [
            {
              required: true,
              message: '此项为必填项',
            },
          ],
        },
        fixed: 'left',
        width: 300,
      },
      {
        title: '季度',
        key: 'semester',
        width: 120,
        search: false,
        render: (_, r) =>
          r.year && r.season ? `${r.year} / ${seasonToText[r.season]}` : '-',
      },
      {
        title: 'bgm.tv',
        dataIndex: 'bangumiId',
        render: (_, r) =>
          r.bangumiId ? (
            <>
              {_}
              <a
                href={`https://bangumi.tv/subject/${r.bangumiId}`}
                target="_blank"
                style={{
                  marginLeft: 4,
                }}
                rel="noreferrer"
              >
                <LinkOutlined />
              </a>
            </>
          ) : (
            '-'
          ),
        copyable: true,
        search: false,
        width: 120,
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
                rel="noreferrer"
              >
                <LinkOutlined />
              </a>
            </>
          ) : (
            '-'
          ),
        copyable: true,
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
                rel="noreferrer"
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
        tooltip: 'Jellyfin季度ID（前8位）',
        dataIndex: 'jellyfinSeasonId',
        render: (_, r) =>
          r.jellyfinSeasonId ? (
            <>
              {r.jellyfinSeasonId.substring(0, 8)}
              <a
                href={`https://jellyfin.std4453.com:444/web/index.html#!/details?serverId=510e48488c4e4a6b981894df79711cdc&id=${r.jellyfinSeasonId}`}
                target="_blank"
                style={{
                  marginLeft: 4,
                }}
                rel="noreferrer"
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
                rel="noreferrer"
              >
                <LinkOutlined />
              </a>
            </>
          ) : (
            '-'
          ),
        search: false,
        ellipsis: true,
        width: 300,
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
                rel="noreferrer"
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
        title: '操作',
        valueType: 'option',
        render: (_, r) => [
          <a
            key={0}
            onClick={() => {
              history.push(`/details/${r.id}`);
            }}
          >
            编辑
          </a>,
        ],
        search: false,
        width: 120,
        fixed: 'right',
      },
    ],
    [history],
  );
}

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
      orderBy: AnimeMetadataOrderBy.IdDesc,
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
    fetchPolicy: 'network-only',
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

  const columns = useColumns();

  const ref = useRef<ActionType>();
  const openNewAnime = useOpenDialog('NewAnime');
  const history = useHistory();

  return (
    <ProTable<RowType, { uniformName?: string }>
      columns={columns}
      request={(params, _sort) => queryGetAnimeList(client, params)}
      rowKey="id"
      pagination={{
        pageSizeOptions: [10, 30, 50],
        defaultPageSize: 30,
      }}
      headerTitle="元数据"
      scroll={{
        x: '120%',
      }}
      actionRef={ref}
      toolBarRender={() => [
        <Button
          key="button"
          icon={<PlusOutlined />}
          type="primary"
          onClick={async () => {
            try {
              const { id } = await openNewAnime();
              history.push(`/details/${id}`);
            } catch (e) {}
          }}
        >
          新建
        </Button>,
      ]}
    />
  );
}
