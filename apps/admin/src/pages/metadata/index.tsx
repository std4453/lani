import client from '@/client';
import { seasonToText, weekdayToText } from '@/constants';
import { IconPath } from '@/constants/icon-path';
import {
  DeleteSeasonByIdDocument,
  ListSeasonsDocument,
  ListSeasonsQuery,
  SeasonFilter,
  SeasonsOrderBy,
} from '@/generated/types';
import { useAddFromBangumiDialog } from '@/pages/metadata/AddFromBangumiDialog';
import { useCreateSeasonDialog } from '@/pages/metadata/CreateSeasonDialog';
import { extractNode, ExtractNode } from '@/utils/graphql';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import {
  Button,
  Dropdown,
  Menu,
  message,
  Popconfirm,
  Space,
  Typography,
} from 'antd';
import clsx from 'clsx';
import { useMemo, useRef } from 'react';
import { useHistory } from 'umi';
import styles from './index.module.less';

type RowType = ExtractNode<ListSeasonsQuery['allSeasons']>;

function LinkIcon({
  icon,
  href,
  valid,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  valid: any;
  href: string;
  icon: string;
}) {
  return (
    <a
      href={valid ? href : undefined}
      style={{
        cursor: valid ? 'pointer' : 'initial',
      }}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={icon}
        style={{
          filter: valid ? undefined : 'grayscale(1)',
          opacity: valid ? 1 : 0.6,
        }}
        className={styles.icon}
      />
    </a>
  );
}

function useColumns() {
  const history = useHistory();
  return useMemo(
    (): ProColumns<RowType>[] => [
      {
        title: '#',
        dataIndex: 'id',
        align: 'center',
        search: false,
        width: 48,
      },
      {
        title: '季度标题',
        dataIndex: 'title',
        copyable: true,
        ellipsis: false,
      },
      {
        title: '季度',
        key: 'semester',
        width: 120,
        search: false,
        render: (_, r) =>
          r.yearAndSemester ? (
            <>
              {r.yearAndSemester.substring(0, 4)}
              <span className={styles.slash}>/</span>
              {seasonToText[parseInt(r.yearAndSemester.substring(5, 6))]}
            </>
          ) : (
            '-'
          ),
      },
      {
        title: '放送时间',
        key: 'airTime',
        width: 120,
        search: false,
        render: (_, r) =>
          typeof r.weekday === 'number' && r.airTime
            ? `${weekdayToText[r.weekday]} ${r.airTime}`
            : '-',
      },
      {
        title: '追番状态',
        dataIndex: 'isMonitoring',
        valueEnum: {
          true: {
            text: '追番中',
            status: 'Success',
          },
          false: {
            text: '未追番',
            status: 'Default',
          },
        },
        width: 120,
        filters: true,
      },
      {
        title: '剧集',
        tooltip: '可用集数 / 已放送集数 / 总集数',
        key: 'episodes',
        width: 120,
        search: false,
        render: (_, r) => (
          <div
            className={clsx(
              styles.episodesCell,
              r.isMonitoring && r.allEpisodes.totalCount > 0
                ? r.availableEpisodes.totalCount < r.airedEpisodes.totalCount
                  ? styles.bad
                  : styles.good
                : false,
            )}
          >
            {r.allEpisodes.totalCount > 0 ? (
              <>
                {r.availableEpisodes.totalCount}
                <span className={styles.slash}>/</span>
                {r.airedEpisodes.totalCount}
                <span className={styles.slash}>/</span>
                {r.allEpisodes.totalCount}
              </>
            ) : (
              '无'
            )}
          </div>
        ),
      },
      {
        title: '链接',
        key: 'links',
        search: false,
        render: (_, r) => (
          <Space>
            <LinkIcon
              icon={IconPath.bangumiIcon}
              href={`https://bangumi.tv/subject/${r.bangumiId}`}
              valid={r.bangumiId}
            />
            <LinkIcon
              icon={IconPath.thetvdbIcon}
              href={`https://www.thetvdb.com/dereferrer/series/${r.tvdbId}`}
              valid={r.tvdbId && typeof r.tvdbSeason === 'number'}
            />
            <LinkIcon
              icon={IconPath.bilibiliIcon}
              href={`https://www.bilibili.com/bangumi/play/ss${r.bilibiliThmId}`}
              valid={r.bilibiliThmId}
            />
            <LinkIcon
              icon={IconPath.bilibiliMainlandIcon}
              href={`https://www.bilibili.com/bangumi/play/ss${r.bilibiliMainlandId}`}
              valid={r.bilibiliMainlandId}
            />
            <LinkIcon
              icon={IconPath.mikanAnimeIcon}
              href={`https://mikanani.me/Home/Bangumi/${r.mikanAnimeId}`}
              valid={r.mikanAnimeId}
            />
            <LinkIcon
              icon={IconPath.jellyfinIcon}
              href={`https://jellyfin.std4453.com:444/web/index.html#!/details?serverId=510e48488c4e4a6b981894df79711cdc&id=${r.jellyfinId}`}
              valid={r.jellyfinId}
            />
          </Space>
        ),
        width: 220,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, r, __, action) => [
          <Typography.Link
            key={0}
            onClick={() => {
              history.push(`/season/${r.id}`);
            }}
          >
            编辑
          </Typography.Link>,
          <Popconfirm
            key={1}
            title="确定删除该季度吗？此操作不可恢复"
            onConfirm={async () => {
              try {
                await client.mutate({
                  mutation: DeleteSeasonByIdDocument,
                  variables: {
                    id: r.id,
                  },
                });
                void message.success('删除成功');
                void action?.reload();
              } catch (e) {
                console.error(e);
                void message.error('删除失败');
              }
            }}
          >
            <Typography.Link type="danger">删除</Typography.Link>
          </Popconfirm>,
        ],
        search: false,
        width: 120,
      },
    ],
    [history],
  );
}

async function querySeasons(
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
    isMonitoring,
  }: {
    isMonitoring?: ('true' | 'false')[];
  },
) {
  const filter: SeasonFilter = {
    ...(keyword
      ? {
          title: {
            includesInsensitive: keyword,
          },
        }
      : undefined),
    ...(isMonitoring
      ? {
          isMonitoring: {
            in: isMonitoring.map((value) => value === 'true'),
          },
        }
      : undefined),
  };
  const { data, error } = await client.query({
    query: ListSeasonsDocument,
    variables: {
      first: pageSize,
      offset: pageSize * (current - 1),
      orderBy: SeasonsOrderBy.IdDesc,
      ...(Object.keys(filter).length > 0 ? { filter } : undefined),
      now: new Date(),
    },
  });
  if (error) {
    console.error(error);
    return {
      success: false,
    };
  }
  const result = data.allSeasons;
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
  const [createSeasonDialog, , openCreateAnime] = useCreateSeasonDialog();
  const [addFromBangumiDialog, , openAddFromBangumi] =
    useAddFromBangumiDialog();
  const history = useHistory();

  return (
    <>
      <ProTable<RowType, { uniformName?: string }>
        columns={columns}
        request={(params, _sort, filter) =>
          querySeasons(client, params, filter)
        }
        rowKey="id"
        pagination={{
          pageSizeOptions: [10, 30, 50],
          defaultPageSize: 30,
        }}
        headerTitle="元数据"
        actionRef={ref}
        toolBarRender={() => [
          <Dropdown.Button
            key="button"
            type="primary"
            onClick={async () => {
              const result = await openCreateAnime();
              if (result.type === 'success') {
                history.push(`/season/${result.output.id}`);
              }
            }}
            overlay={
              <Menu>
                <Menu.Item
                  key={0}
                  icon={
                    <img src={IconPath.bangumiIcon} className={styles.icon} />
                  }
                  onClick={async () => {
                    const result = await openAddFromBangumi();
                    if (result.type === 'success') {
                      history.push(`/season/${result.output.id}`);
                    }
                  }}
                >
                  从Bangumi添加
                </Menu.Item>
              </Menu>
            }
          >
            新建
          </Dropdown.Button>,
        ]}
        search={false}
        options={{
          search: true,
        }}
        defaultSize="large"
      />
      {createSeasonDialog}
      {addFromBangumiDialog}
    </>
  );
}
