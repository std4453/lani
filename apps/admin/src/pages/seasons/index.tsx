import { TableTitle } from '@/components/Layout';
import { seasonToText, weekdayToText } from '@/constants';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import { IconPath } from '@/constants/icon-path';
import {
  bangumiLink,
  bilibiliSeasonLink,
  jellyfinSeasonLink,
  mikanAnimeLink,
  tvdbLinkById,
} from '@/constants/link';
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
import { TableColumns, useProColumns } from '@/utils/search';
import { useAntdSearchProps, withAntdSearch } from '@/utils/search/hooks';
import useMobile from '@/utils/useMobile';
import { PlusOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
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
  NO_LACK = 'no_lack',
  LACK = 'lack',
  NO_AIRED = 'no_aired',
  ALL_AIRED = 'all_aired',
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
          : '?????????',
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

  return useProColumns(
    useMemo(
      (): TableColumns<RowType>[] => [
        {
          title: '',
          dataIndex: 'id',
          align: 'center',
          search: false,
          width: 48,
          sorter: true,
          stateKey: {
            sort: 'id',
          },
        },
        {
          title: '????????????',
          dataIndex: 'title',
          copyable: true,
          ellipsis: false,
          sorter: true,
          width: 400,
          stateKey: {
            sort: 'title',
          },
        },
        {
          title: '??????',
          dataIndex: 'yearAndSemester',
          width: 180,
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
          stateKey: {
            filter: 'yearAndSemester',
          },
        },
        {
          title: '????????????',
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
          title: '????????????',
          dataIndex: 'isMonitoring',
          valueEnum: {
            true: {
              text: '?????????',
              status: 'Success',
            },
            false: {
              text: '?????????',
              status: 'Default',
            },
          },
          width: 160,
          filters: true,
          stateKey: {
            filter: 'isMonitoring',
          },
        },
        {
          title: '?????????',
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
          stateKey: {
            filter: 'folder',
            mapValue: (f) => Number(f),
          },
        },
        {
          title: '?????????',
          tooltip: '?????????????????????????????????',
          key: 'latestEpisode',
          width: 96,
          render: (_, r) => {
            if (!r.isMonitoring) {
              return '-';
            }
            const episode = extractNode(r.latestEpisode)?.[0];
            if (!episode) {
              return '-';
            }
            const status = calcEpisodeStatus(episode);
            return (
              <div>
                <DownloadStatusTag status={status} />
              </div>
            );
          },
        },
        {
          title: '??????',
          tooltip: '???????????? / ??????????????? / ?????????',
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
                '???'
              )}
            </ColoredCell>
          ),
          filters: [
            {
              text: '??????',
              value: EpisodesFilter.LACK,
            },
            {
              text: '?????????',
              value: EpisodesFilter.NO_LACK,
            },
            {
              text: '?????????',
              value: EpisodesFilter.NO_AIRED,
            },
            {
              text: '????????????',
              value: EpisodesFilter.ALL_AIRED,
            },
          ] as ColumnFilterItem[],
          stateKey: {
            filter: 'episodes',
          },
        },
        {
          title: '??????',
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
                icon={IconPath.mikanAnimeIcon}
                href={mikanAnimeLink(r.mikanAnimeId)}
                valid={r.mikanAnimeId}
              />
              <LinkIcon
                icon={IconPath.jellyfinIcon}
                href={jellyfinSeasonLink(r.jellyfinId)}
                valid={r.jellyfinId}
              />
            </Space>
          ),
          width: 220,
        },
        {
          title: '??????',
          valueType: 'option',
          render: (_, r, __, action) => [
            <Typography.Link
              key={0}
              onClick={() => {
                history.push(`/season/${r.id}`);
              }}
            >
              ??????
            </Typography.Link>,
            <Popconfirm
              key={1}
              title={
                <div
                  style={{
                    width: 260,
                  }}
                >
                  ???????????????{r.title}??????????????????????????????????????????????????????????????????
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
                  void message.success('????????????');
                  void action?.reload();
                } catch (e) {
                  console.error(e);
                  void message.error('????????????');
                }
              }}
            >
              <Typography.Link type="danger">??????</Typography.Link>
            </Popconfirm>,
          ],
          search: false,
          width: 140,
        },
      ],
      [history, semesterOptions, foldersOptions, client],
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
          // ?????????????????????????????????
          filters.push({
            // ???????????????????????????????????????????????????????????????
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
            // ???????????????????????????????????????????????????????????????
            isMonitoring: {
              equalTo: true,
            },
            // ??????????????????????????????????????????
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
            // ??????????????????
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
            // ???????????????
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

export default withAntdSearch(function MetadataPage() {
  const client = useApolloClient();

  const columns = useColumns();

  const ref = useRef<ActionType>();
  const [createSeasonDialog, , openCreateAnime] = useCreateSeasonDialog();
  const [addFromBangumiDialog, , openAddFromBangumi] =
    useAddFromBangumiDialog();
  const history = useHistory();
  const mobile = useMobile();

  const props = useAntdSearchProps(
    ({ search, sort, filter, current, keyword, pageSize }) =>
      querySeasons(
        client,
        { ...search, current, keyword, pageSize },
        sort,
        filter,
      ),
    {
      hasKeyword: true,
      pagination: {
        pageSizeOptions: [10, 30, 50],
        defaultPageSize: 30,
        className: styles.pagination,
        ...(mobile
          ? {
              showTotal: () => null,
            }
          : {}),
      },
    },
  );

  return (
    <>
      <ProTable<RowType>
        columns={columns}
        rowKey="id"
        {...props}
        headerTitle={<TableTitle>?????????</TableTitle>}
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
            ???Bangumi??????
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
            ????????????
          </Button>,
        ]}
        search={false}
        defaultSize={mobile ? 'middle' : 'large'}
        scroll={{ x: 1400 }}
        className={styles.root}
      />
      {createSeasonDialog}
      {addFromBangumiDialog}
    </>
  );
});
