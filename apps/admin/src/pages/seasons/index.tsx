import PageTitle from '@/components/PageTitle';
import { EpisodeType } from '@/generated/types';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import { TableTitle } from '@/components/Layout';
import MainTable from '@/components/MainTable';
import tableStyles from '@/components/MainTable/index.module.less';
import { seasonToText } from '@/constants';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import { IconPath } from '@/constants/icon-path';
import {
  bangumiLink,
  bilibiliSeasonLink,
  jellyfinSeasonLink,
  tvdbLinkById,
} from '@/constants/link';
import {
  DeleteSeasonByIdDocument,
  EpisodeStatusFieldsFragment,
  GetMetadataPageOptionsDocument,
  GetSeasonsStatusDocument,
  ListSeasonsDocument,
  ListSeasonsFieldsFragment,
  ListSeasonsQuery,
  SeasonFilter,
  SeasonsOrderBy,
} from '@/generated/types';
import { useAddFromBangumiDialog } from '@/pages/seasons/AddFromBangumiDialog';
import { useCreateSeasonDialog } from '@/pages/seasons/CreateSeasonDialog';
import { useAppSelector } from '@/store/hooks';
import { handleError } from '@/utils/error';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { TableColumns, useProColumns } from '@/utils/search';
import { useAntdSearchProps, withAntdSearch } from '@/utils/search/hooks';
import { useTaskStates } from '@/utils/useTaskStates';
import { useApolloPoll } from '@/utils/useApolloPoll';
import useMobile from '@/utils/useMobile';
import {
  AppstoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient, useQuery } from '@apollo/client';
import { Button, message, Popconfirm, Space, Tooltip, Typography } from 'antd';
import { ColumnFilterItem } from 'antd/lib/table/interface';
import clsx from 'clsx';
import dayjs from 'dayjs';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'umi';
import styles from './index.module.less';
import TestRoutingTitle from './TestRoutingTitle';
import SeasonCards from './SeasonCards';
import store from 'store2';

type RowType = ExtractNode<ListSeasonsQuery['allSeasons']>;

const SeasonsStatusContext = createContext<
  Record<number, EpisodeStatusFieldsFragment> | undefined
>(undefined);

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
      <span className={styles.cellContent}>{children}</span>
    </div>
  );
}

enum EpisodesFilter {
  NO_LACK = 'no_lack',
  LACK = 'lack',
  NO_AIRED = 'no_aired',
  ALL_AIRED = 'all_aired',
}

function SeasonStatusTag({
  season,
  openTaskDetails,
}: {
  season: ListSeasonsFieldsFragment;
  openTaskDetails: ReturnType<typeof useTaskDetailsDialog>[2];
}) {
  const seasonsStatus = useContext(SeasonsStatusContext);
  const episodeStatus = useMemo(() => {
    const mergedEpisode = seasonsStatus?.[season.id] ?? season.latestEpisode;
    if (!mergedEpisode) {
      return undefined;
    }
    return { id: mergedEpisode.id, ...calcEpisodeStatus(mergedEpisode) };
  }, [seasonsStatus, season]);
  // 因为hooks不能选择性调用，这里判断放到最后
  if (!season.isMonitoring || !episodeStatus) {
    return <>-</>;
  }
  return (
    <div>
      <DownloadStatusTag
        status={episodeStatus.status}
        taskId={episodeStatus.taskId}
        taskType={episodeStatus.taskType}
        openTaskDetails={openTaskDetails}
      />
    </div>
  );
}

function useColumns({
  openTaskDetails,
  enabled,
}: {
  openTaskDetails: ReturnType<typeof useTaskDetailsDialog>[2];
  enabled: boolean;
}) {
  const history = useHistory();
  const { data: optionsData } = useQuery(GetMetadataPageOptionsDocument, {
    skip: !enabled,
  });
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
  const hasHiddenFolder = useMemo(
    () =>
      (extractNode(optionsData?.allJellyfinFolders) ?? []).some(
        (folder) => folder.isHidden,
      ),
    [optionsData],
  );
  const client = useApolloClient();
  const mobile = useMobile();

  return useProColumns(
    useMemo(
      (): TableColumns<RowType>[] => [
        {
          title: 'ID',
          dataIndex: 'id',
          align: 'center',
          search: false,
          width: 64,
          className: clsx(styles.numberCell, styles.idColumn),
          sorter: true,
          stateKey: {
            sort: 'id',
          },
          fixed: mobile ? undefined : 'left',
        },
        {
          title: '季度标题',
          // 固定列需要显式 auto，避免 ProTable 自动补上 200px。
          width: 'auto',
          dataIndex: 'title',
          copyable: true,
          ellipsis: false,
          sorter: true,
          stateKey: {
            sort: 'title',
          },
          fixed: mobile ? undefined : 'left',
        },
        {
          title: '季度',
          dataIndex: 'yearAndSemester',
          width: 96,
          className: tableStyles.compactCell,
          search: false,
          render: (_, r) =>
            r.yearAndSemester ? (
              <div>
                {r.yearAndSemester.substring(0, 4)}
                <span className={styles.slash}>/</span>
                {seasonToText[parseInt(r.yearAndSemester.substring(4, 6))]}
              </div>
            ) : (
              '-'
            ),
          filters: semesterOptions,
          sorter: true,
          stateKey: {
            sort: 'yearAndSemester',
            filter: 'yearAndSemester',
          },
        },
        {
          title: '首播时间',
          dataIndex: 'firstAired',
          width: 112,
          className: tableStyles.compactCell,
          search: false,
          render: (_, r) => {
            const firstAir = r.firstEpisode.edges[0]?.node?.airTime;
            if (!firstAir) {
              return '-';
            } else {
              return dayjs(firstAir).format('YYYY-MM-DD');
            }
          },
          sorter: true,
          stateKey: {
            sort: 'firstAired',
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
          width: 108,
          className: tableStyles.compactCell,
          filters: true,
          stateKey: {
            filter: 'isMonitoring',
          },
        },
        {
          title: '媒体库',
          dataIndex: 'folder',
          width: 140,
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
          tooltip: hasHiddenFolder
            ? '部分媒体库默认隐藏，筛选后可见'
            : undefined,
          stateKey: {
            filter: 'folder',
            mapValue: (f) => Number(f),
          },
        },
        {
          title: '最新集',
          tooltip: '季度最新一集的下载状态',
          key: 'latestEpisode',
          width: 126,
          className: clsx(tableStyles.compactCell, styles.latestEpisodeCell),
          render: (_, r) => (
            <SeasonStatusTag season={r} openTaskDetails={openTaskDetails} />
          ),
        },
        {
          title: '集数',
          tooltip: '可用集数 / 已放送集数 / 总集数',
          dataIndex: 'episodes',
          width: 116,
          className: styles.numberCell,
          render: (_, r) => (
            <ColoredCell
              className={clsx(styles.episodesCell, {
                [styles.longEpisodesCell]:
                  Math.max(
                    r.availableEpisodes.totalCount,
                    r.airedEpisodes.totalCount,
                    r.allEpisodes.totalCount,
                  ) >= 100,
              })}
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
          stateKey: {
            filter: 'episodes',
          },
        },
        {
          title: '链接',
          key: 'links',
          search: false,
          render: (_, r) => (
            <Space>
              <LinkIcon
                icon={IconPath.bangumiIcon}
                href={bangumiLink(r.bangumiId)}
                valid={r.bangumiId}
              />
              <LinkIcon
                icon={IconPath.thetvdbIcon}
                href={tvdbLinkById(r.tvdbId)}
                valid={r.tvdbId && typeof r.tvdbSeason === 'number'}
              />
              <LinkIcon
                icon={IconPath.bilibiliIcon}
                href={bilibiliSeasonLink(r.bilibiliThmId)}
                valid={r.bilibiliThmId}
              />
              <LinkIcon
                icon={IconPath.bilibiliMainlandIcon}
                href={bilibiliSeasonLink(r.bilibiliMainlandId)}
                valid={r.bilibiliMainlandId}
              />
              <LinkIcon
                icon={IconPath.jellyfinIcon}
                href={jellyfinSeasonLink(r.jellyfinId)}
                valid={r.jellyfinId}
              />
            </Space>
          ),
          width: 185,
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
                } catch (error) {
                  handleError(error, '删除失败');
                }
              }}
            >
              <Typography.Link type="danger">删除</Typography.Link>
            </Popconfirm>,
          ],
          search: false,
          width: 104,
          className: tableStyles.compactCell,
          fixed: 'right',
        },
      ],
      [
        mobile,
        semesterOptions,
        foldersOptions,
        hasHiddenFolder,
        openTaskDetails,
        history,
        client,
      ],
    ),
  );
}

async function querySeasons(
  client: ApolloClient<object>,
  // search
  {
    pageSize = 10,
    current = 1,
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
    firstAired: firstAiredSort,
    yearAndSemester: yearAndSemesterSort,
  }: {
    id?: 'ascend' | 'descend';
    title?: 'ascend' | 'descend';
    firstAired?: 'ascend' | 'descend';
    yearAndSemester?: 'ascend' | 'descend';
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
      : keyword
      ? undefined // 精确查找时，不过滤媒体库
      : {
          // 未选择且非精确查找时，隐藏默认不展示的媒体库
          jellyfinFolderByJellyfinFolderId: {
            isHidden: {
              equalTo: false,
            },
          },
        }),
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
                episodeType: { equalTo: EpisodeType.Episode },
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
                episodeType: { equalTo: EpisodeType.Episode },
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
                episodeType: { equalTo: EpisodeType.Episode },
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
                or: [
                  { episodeType: { notEqualTo: EpisodeType.Episode } },
                  { airTime: { lessThanOrEqualTo: now } },
                ],
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
    ...(firstAiredSort
      ? firstAiredSort === 'ascend'
        ? [SeasonsOrderBy.EpisodesBySeasonIdMinAirTimeAsc]
        : [SeasonsOrderBy.EpisodesBySeasonIdMinAirTimeDesc]
      : []),
    ...(yearAndSemesterSort
      ? yearAndSemesterSort === 'ascend'
        ? [SeasonsOrderBy.YearAndSemesterCanonicalAsc]
        : [SeasonsOrderBy.YearAndSemesterCanonicalDesc]
      : []),
  ];
  try {
    const { data } = await client.query({
      query: ListSeasonsDocument,
      variables: {
        first: pageSize,
        offset: pageSize * (current - 1),
        // 默认按照Id倒序，方便找到最新的季度
        orderBy: orderBy.length > 0 ? orderBy : [SeasonsOrderBy.IdDesc],
        ...(Object.keys(filter).length > 0 ? { filter } : undefined),
        now,
      },
    });
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
  } catch (error) {
    handleError(error, '季度列表获取失败');
    return {
      success: false,
    };
  }
}

function useSeasonsStatus(seasonIds: number[]) {
  // useQuery会检测variables变化触发新请求，如果now一直变化会一直触发，不受
  // pollInterval控制，因此这里把now做成不变的，仅当：
  // - 每分钟
  // - 每次seasonIds变化
  // 时更新
  const nowRef = useRef(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      nowRef.current = new Date();
    }, 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const lastSeasonIdsRef = useRef(seasonIds);
  if (seasonIds !== lastSeasonIdsRef.current) {
    nowRef.current = new Date();
  }
  lastSeasonIdsRef.current = seasonIds;

  const { data, startPolling, stopPolling, refetch } = useQuery(
    GetSeasonsStatusDocument,
    {
      skip: !seasonIds.length,
      variables: {
        seasonIds,
        now: nowRef.current,
      },
    },
  );
  const taskIds = (extractNode(data?.allSeasons) ?? []).flatMap(
    (season) =>
      extractNode(season.latestEpisode?.tasks)?.map((task) => task.id) ?? [],
  );
  useTaskStates(taskIds, !!seasonIds.length);
  useApolloPoll({
    startPolling,
    stopPolling,
    refetch: () => {
      nowRef.current = new Date();
      return refetch({ seasonIds, now: nowRef.current });
    },
    pollInterval: 30000,
    enabled: !!seasonIds.length,
  });
  return useMemo(() => {
    const seasonsStatusMap: Record<number, EpisodeStatusFieldsFragment> = {};
    for (const season of extractNode(data?.allSeasons) ?? []) {
      const episode = season.latestEpisode;
      if (!episode) {
        continue;
      }
      seasonsStatusMap[season.id] = episode;
    }
    return seasonsStatusMap;
  }, [data]);
}

export default withAntdSearch(function MetadataPage() {
  const client = useApolloClient();
  const testRoutingEnabled = useAppSelector(
    (state) => state.auth.config?.testRoutingEnabled === true,
  );

  const [taskDetailsDialog, , openTaskDetails] = useTaskDetailsDialog();

  const ref = useRef<ActionType>();
  const [createSeasonDialog, , openCreateAnime] = useCreateSeasonDialog();
  const [addFromBangumiDialog, , openAddFromBangumi] =
    useAddFromBangumiDialog();
  const history = useHistory();
  const mobile = useMobile();

  const [cardMode, setCardMode] = useState(() => {
    try {
      return store.get('lani:metadata-view') === 'cards';
    } catch {
      return false;
    }
  });
  const columns = useColumns({ openTaskDetails, enabled: !cardMode });
  const [seasonIds, setSeasonIds] = useState<number[]>([]);
  const inactiveSeasonIds = useMemo(() => [], []);
  const seasonsStatus = useSeasonsStatus(
    cardMode ? inactiveSeasonIds : seasonIds,
  );
  const modeLabel = cardMode ? '卡片模式' : '列表模式';
  const modeButton = (
    <Tooltip key="view-mode" title={modeLabel}>
      <Button
        type="text"
        aria-label={modeLabel}
        aria-pressed={cardMode}
        icon={cardMode ? <AppstoreOutlined /> : <UnorderedListOutlined />}
        onClick={() => {
          const next = !cardMode;
          setCardMode(next);
          try {
            store.set('lani:metadata-view', next ? 'cards' : 'list');
          } catch {
            /* 存储不可用时，仍允许在当前页面切换。 */
          }
        }}
      />
    </Tooltip>
  );

  const props = useAntdSearchProps(
    async ({ search, sort, filter, current, keyword, pageSize }) => {
      const result = await querySeasons(
        client,
        { ...search, current, keyword, pageSize },
        sort,
        filter,
      );
      setSeasonIds((result.data ?? []).map((season) => season.id));
      return result;
    },
    {
      hasKeyword: true,
      pagination: {
        pageSize: 30,
      },
    },
  );

  const actions = [
    <Button
      key={0}
      type="primary"
      onClick={async () => {
        const result = await openAddFromBangumi();
        if (result.type === 'success') {
          history.push(`/season/${result.output.id}`);
        }
      }}
      icon={<img src={IconPath.bangumiIcon} className={styles.buttonIcon} />}
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
      {mobile ? '新建' : '手动新建'}
    </Button>,
  ];

  const title = (
    <TableTitle>
      {testRoutingEnabled ? (
        <TestRoutingTitle>元数据</TestRoutingTitle>
      ) : (
        '元数据'
      )}
    </TableTitle>
  );

  return (
    <SeasonsStatusContext.Provider value={seasonsStatus}>
      <PageTitle title="元数据" />
      {cardMode ? (
        <SeasonCards title={title} actions={actions} modeButton={modeButton} />
      ) : (
        <MainTable<RowType>
          columns={columns}
          rowKey="id"
          {...props}
          headerTitle={title}
          actionRef={ref}
          toolBarRender={() => (mobile ? [modeButton, ...actions] : actions)}
          toolbar={{
            settings: mobile
              ? []
              : [
                  <Space key="view-actions">
                    {modeButton}
                    <Tooltip title="刷新">
                      <Button
                        type="text"
                        aria-label="刷新"
                        icon={<ReloadOutlined />}
                        onClick={() => void ref.current?.reload()}
                      />
                    </Tooltip>
                  </Space>,
                ],
          }}
          search={false}
          defaultSize={mobile ? 'middle' : 'large'}
          scroll={{
            x: 1440,
          }}
          className={styles.root}
        />
      )}
      {createSeasonDialog}
      {addFromBangumiDialog}
      {taskDetailsDialog}
    </SeasonsStatusContext.Provider>
  );
});
