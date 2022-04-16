import { seasonToText, weekdayToText } from '@/constants';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import { IconPath } from '@/constants/icon-path';
import {
  DeleteSeasonByIdDocument,
  GetMetadataPageOptionsDocument,
  ListSeasonsDocument,
  ListSeasonsQuery,
  SeasonFilter,
  SeasonsOrderBy,
} from '@/generated/types';
import { useAddFromBangumiDialog } from '@/pages/seasons/AddFromBangumiDialog';
import { useCreateSeasonDialog } from '@/pages/seasons/CreateSeasonDialog';
import { extractNode, ExtractNode } from '@/utils/graphql';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient, useQuery } from '@apollo/client';
import { Button, message, Popconfirm, Space, Typography } from 'antd';
import { ColumnFilterItem } from 'antd/lib/table/interface';
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

function ColoredCell({
  className,
  children,
  status = 'default',
}: {
  className?: string;
  children?: React.ReactNode;
  status?: 'success' | 'error' | 'default';
}) {
  return (
    <div
      className={clsx(
        styles.coloredCell,
        {
          [styles.bad]: status === 'error',
          [styles.good]: status === 'success',
        },
        className,
      )}
    >
      {children}
    </div>
  );
}

enum EpisodesFilter {
  NO_LACK,
  LACK,
  NO_AIRED,
  ALL_AIRED,
}

function useColumns() {
  const history = useHistory();
  const { data: optionsData } = useQuery(GetMetadataPageOptionsDocument);
  const semesterOptions = useMemo(
    (): ColumnFilterItem[] =>
      (optionsData?.getAvailableSemesters ?? []).map((yearAndSemester) => ({
        text: yearAndSemester
          ? `${yearAndSemester.substring(0, 4)} / ${
              seasonToText[parseInt(yearAndSemester.substring(4, 6))]
            }`
          : '未设定',
        value: yearAndSemester,
      })),
    [optionsData],
  );
  const foldersOptions = useMemo(
    (): ColumnFilterItem[] =>
      (extractNode(optionsData?.allJellyfinFolders) ?? []).map((folder) => ({
        value: folder.id,
        text: folder.name,
      })),
    [optionsData],
  );
  const client = useApolloClient();

  return useMemo(
    (): ProColumns<RowType>[] => [
      {
        title: '',
        dataIndex: 'id',
        align: 'center',
        search: false,
        width: 48,
        sorter: true,
      },
      {
        title: '季度标题',
        dataIndex: 'title',
        copyable: true,
        ellipsis: false,
        sorter: true,
      },
      {
        title: '季度',
        dataIndex: 'yearAndSemester',
        width: 120,
        search: false,
        render: (_, r) =>
          r.yearAndSemester ? (
            <>
              {r.yearAndSemester.substring(0, 4)}
              <span className={styles.slash}>/</span>
              {seasonToText[parseInt(r.yearAndSemester.substring(4, 6))]}
            </>
          ) : (
            '-'
          ),
        filters: semesterOptions,
      },
      {
        title: '放送时间',
        key: 'airTime',
        width: 120,
        search: false,
        render: (_, r) => {
          if (typeof r.weekday !== 'number') {
            return '-';
          }
          if (!r.airTime) {
            return weekdayToText[r.weekday];
          } else {
            return `${weekdayToText[r.weekday]} ${r.airTime}`;
          }
        },
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
        title: '媒体库',
        dataIndex: 'folder',
        width: 100,
        render: (_, r) => (
          <ColoredCell
            status={
              r.isMonitoring && !r.jellyfinFolderByJellyfinFolderId?.name
                ? 'error'
                : 'default'
            }
          >
            {r.jellyfinFolderByJellyfinFolderId?.name ?? '-'}
          </ColoredCell>
        ),
        filters: foldersOptions,
      },
      {
        title: '最新集',
        tooltip: '季度最新一集的下载状态',
        key: 'latestEpisode',
        width: 84,
        render: (_, r) => {
          if (!r.isMonitoring) {
            return '-';
          }
          const episode = extractNode(r.latestEpisode)?.[0];
          if (!episode) {
            return '-';
          }
          const status = calcEpisodeStatus(episode);
          return <DownloadStatusTag status={status} />;
        },
      },
      {
        title: '集数',
        tooltip: '可用集数 / 已放送集数 / 总集数',
        dataIndex: 'episodes',
        width: 120,
        render: (_, r) => (
          <ColoredCell
            className={styles.episodesCell}
            status={
              r.isMonitoring && r.allEpisodes.totalCount > 0
                ? r.availableEpisodes.totalCount < r.airedEpisodes.totalCount
                  ? 'error'
                  : 'success'
                : 'default'
            }
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
          </ColoredCell>
        ),
        filters: [
          {
            text: '缺集',
            value: EpisodesFilter.LACK,
          },
          {
            text: '不缺集',
            value: EpisodesFilter.NO_LACK,
          },
          {
            text: '未放送',
            value: EpisodesFilter.NO_AIRED,
          },
          {
            text: '全部放送',
            value: EpisodesFilter.ALL_AIRED,
          },
        ] as ColumnFilterItem[],
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
            title={
              <div
                style={{
                  width: 260,
                }}
              >
                确定删除“{r.title}”吗？这将删除硬盘上的文件，此操作无法恢复！
              </div>
            }
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
    [history, semesterOptions, foldersOptions, client],
  );
}

async function querySeasons(
  client: ApolloClient<object>,
  // search
  {
    pageSize = 10,
    current = 0,
    keyword,
  }: {
    pageSize?: number;
    current?: number;
    keyword?: string;
  },
  // sort
  {
    id: idSort,
    title: titleSort,
  }: {
    id?: 'ascend' | 'descend';
    title?: 'ascend' | 'descend';
  },
  // filter
  {
    isMonitoring,
    yearAndSemester,
    folder,
    episodes: episodesFilter,
  }: {
    isMonitoring?: ('true' | 'false')[];
    yearAndSemester?: string[];
    folder?: number[];
    episodes?: EpisodesFilter[];
  },
) {
  const now = new Date();
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
    ...(yearAndSemester
      ? {
          yearAndSemester: {
            in: yearAndSemester,
          },
        }
      : undefined),
    ...(folder
      ? {
          jellyfinFolderId: {
            in: folder,
          },
        }
      : undefined),
  };
  if (episodesFilter?.length) {
    const filters = [] as SeasonFilter[];
    for (const filter of episodesFilter) {
      switch (filter) {
        case EpisodesFilter.LACK:
          // 存在已放送且未完成下载
          filters.push({
            // 强制过滤已追番，因为未追番的话缺集没有意义
            isMonitoring: {
              equalTo: true,
            },
            episodesBySeasonId: {
              some: {
                jellyfinEpisodeId: {
                  isNull: true,
                },
                airTime: {
                  lessThanOrEqualTo: now,
                },
              },
            },
          });
          break;
        case EpisodesFilter.NO_LACK:
          filters.push({
            // 强制过滤已追番，因为未追番的话缺集没有意义
            isMonitoring: {
              equalTo: true,
            },
            // 不存在存在已放送且未完成下载
            episodesBySeasonId: {
              none: {
                jellyfinEpisodeId: {
                  isNull: true,
                },
                airTime: {
                  lessThanOrEqualTo: now,
                },
              },
            },
          });
          break;
        case EpisodesFilter.NO_AIRED:
          filters.push({
            // 不存在已放送
            episodesBySeasonId: {
              none: {
                airTime: {
                  lessThanOrEqualTo: now,
                },
              },
            },
          });
          break;
        case EpisodesFilter.ALL_AIRED:
          filters.push({
            // 全部已放送
            episodesBySeasonId: {
              every: {
                airTime: {
                  lessThanOrEqualTo: now,
                },
              },
            },
          });
          break;
      }
    }
    if (!filter.or) {
      filter.or = [];
    }
    filter.or.push(...filters);
  }
  const orderBy: SeasonsOrderBy[] = [
    ...(titleSort
      ? titleSort === 'ascend'
        ? [SeasonsOrderBy.TitleAsc]
        : [SeasonsOrderBy.TitleDesc]
      : []),
    ...(idSort
      ? idSort === 'ascend'
        ? [SeasonsOrderBy.IdAsc]
        : [SeasonsOrderBy.IdDesc]
      : []),
  ];
  const { data, error } = await client.query({
    query: ListSeasonsDocument,
    variables: {
      first: pageSize,
      offset: pageSize * (current - 1),
      orderBy: orderBy.length > 0 ? orderBy : [SeasonsOrderBy.IdAsc],
      ...(Object.keys(filter).length > 0 ? { filter } : undefined),
      now,
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
      <ProTable<RowType>
        columns={columns}
        request={(params, sort, filter) =>
          querySeasons(client, params, sort, filter)
        }
        rowKey="id"
        pagination={{
          pageSizeOptions: [10, 30, 50],
          defaultPageSize: 30,
        }}
        headerTitle="元数据"
        actionRef={ref}
        toolBarRender={() => [
          <Button
            key={0}
            type="primary"
            onClick={async () => {
              const result = await openAddFromBangumi();
              if (result.type === 'success') {
                history.push(`/season/${result.output.id}`);
              }
            }}
            icon={
              <img src={IconPath.bangumiIcon} className={styles.buttonIcon} />
            }
          >
            从Bangumi新建
          </Button>,
          <Button
            key={1}
            type="primary"
            ghost
            icon={<PlusOutlined />}
            onClick={async () => {
              const result = await openCreateAnime();
              if (result.type === 'success') {
                history.push(`/season/${result.output.id}`);
              }
            }}
          >
            手动新建
          </Button>,
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
