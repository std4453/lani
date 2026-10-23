import PageTitle from '@/components/PageTitle';
import { formatEpisode } from '@/utils/episode';
import TorrentSubtitle from '@/components/TorrentSubtitle';
import AsyncButton from '@/components/AsyncButton';
import { TableTitle } from '@/components/Layout';
import MainTable from '@/components/MainTable';
import tableStyles from '@/components/MainTable/index.module.less';
import {
  BigIntFilter,
  ListTorrentsDocument,
  TorrentChannel,
  TorrentFieldsFragment,
  TorrentFilter,
  TorrentParseFieldsFragment,
  TorrentsOrderBy,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import {
  TableColumns,
  useAntdSearchContext,
  useAntdSearchProps,
  useProColumns,
  withAntdSearch,
} from '@/utils/search';
import useMobile from '@/utils/useMobile';
import {
  ExportOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { ActionType } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import {
  Button,
  message,
  Space,
  Tag,
  TagProps,
  Tooltip,
  Typography,
} from 'antd';
import { useTheme } from '@/theme';
import { tagColors } from '@/theme/tagColors';
import md5 from 'md5';
import prettyBytes from 'pretty-bytes';
import { CSSProperties, useMemo, useRef, useEffect } from 'react';
import styles from './index.module.less';
import { syncTorrentHistory } from './history';
import TorrentSeason from './TorrentSeason';
import { handleError } from '@/utils/error';

function chooseColor(text: string) {
  const hash = md5(text);
  return (parseInt(hash.substring(0, 4), 16) / 65536) * 360;
}

function ColoredTag({ text, ...props }: { text: string } & TagProps) {
  const hue = useMemo(() => chooseColor(text), [text]);
  const { theme } = useTheme();
  return (
    <Tooltip title={text}>
      <Tag
        className={styles.tag}
        style={tagColors(hue, theme) as CSSProperties}
        {...props}
      >
        {text}
      </Tag>
    </Tooltip>
  );
}

enum TorrentSizeFilter {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

type TorrentTableRow = TorrentFieldsFragment & TorrentParseFieldsFragment;

function useColumns() {
  const mobile = useMobile();
  const { update } = useAntdSearchContext();

  return useProColumns(
    useMemo(
      (): TableColumns<TorrentTableRow>[] => [
        {
          title: 'ID',
          dataIndex: 'displayId',
          align: 'center',
          width: 88,
        },
        {
          title: '种子标题',
          dataIndex: 'title',
          width: mobile ? 312 : 512,
          copyable: true,
          render: (_, r) => (
            <span className={styles.title}>
              <Typography.Text copyable={{ text: r.title }}>
                {r.title}
              </Typography.Text>
              {r.permalink && (
                <Tooltip title="种子详情">
                  <Typography.Link
                    className={styles.permalinkButton}
                    href={r.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="打开种子详情"
                  >
                    <ExportOutlined />
                  </Typography.Link>
                </Tooltip>
              )}
            </span>
          ),
        },
        {
          title: '来源',
          dataIndex: 'channel',
          width: 92,
          render: (_, r) =>
            r.channel === TorrentChannel.Nyaa ? 'Nyaa' : '蜜柑',
          filters: [
            { text: '蜜柑', value: TorrentChannel.Mikan },
            { text: 'Nyaa', value: TorrentChannel.Nyaa },
          ],
          stateKey: { filter: 'channel' },
        },
        {
          title: '制作组',
          key: 'organizations',
          copyable: false,
          width: 272,
          render: (_, r) => {
            const parts = r.organizationParts ?? [];
            if (!parts.length) {
              return '-';
            }
            return (
              <div className={styles.tagContainer}>
                {parts.map((part, i) =>
                  part ? (
                    <ColoredTag
                      key={i}
                      text={part}
                      onClick={() => {
                        update({
                          custom: { part },
                        });
                      }}
                    />
                  ) : null,
                )}
              </div>
            );
          },
          stateKey: {
            custom: 'part',
          },
        },
        {
          title: (
            <>
              季度{' '}
              <Tooltip title="根据当前季度列表智能识别">
                <InfoCircleOutlined aria-label="根据当前季度列表智能识别" />
              </Tooltip>
            </>
          ),
          dataIndex: 'aliases',
          copyable: false,
          width: 272,
          render: (_, r) => (
            <TorrentSeason key={r.id} torrent={r}>
              {r.seasonTitleAliases?.some(Boolean) ? (
                <div className={styles.tagContainer}>
                  {r.seasonTitleAliases.map((alias, i) =>
                    alias ? (
                      <ColoredTag
                        key={i}
                        text={alias}
                        onClick={() => update({ custom: { alias } })}
                      />
                    ) : null,
                  )}
                </div>
              ) : (
                '-'
              )}
            </TorrentSeason>
          ),
          stateKey: {
            custom: 'alias',
          },
        },
        {
          title: '集数',
          dataIndex: 'episode',
          render: (_, r) => formatEpisode(r.episodeInfo),
          width: 96,
          sorter: true,
          stateKey: {
            sort: 'episode',
          },
        },
        {
          title: '字幕',
          key: 'subtitles',
          width: 104,
          render: (_, r) => <TorrentSubtitle info={r.subtitleInfo} />,
        },
        {
          title: '发布时间',
          dataIndex: 'publishDate',
          valueType: 'dateTime',
          width: 176,
          sorter: true,
          stateKey: {
            sort: 'publishDate',
          },
        },
        {
          title: '种子大小',
          dataIndex: 'size',
          width: 112,
          render: (_, r) =>
            r.size ? prettyBytes(parseInt(r.size as string)) : '-',
          filters: [
            {
              text: <>0~10MB&nbsp;</>,
              value: TorrentSizeFilter.XS,
            },
            {
              text: (
                <>
                  10MB~150MB&nbsp;
                  <Tooltip title="泡面番、非全长动画">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              ),
              value: TorrentSizeFilter.SM,
            },
            {
              text: (
                <>
                  150MB~750MB&nbsp;
                  <Tooltip title="常见的单集动画">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              ),
              value: TorrentSizeFilter.MD,
            },
            {
              text: (
                <>
                  750MB~1.5GB&nbsp;
                  <Tooltip
                    title={
                      <>
                        超高画质（4K）或多集合并，也存在
                        <br />
                        较小以至于落在上一类别的情况
                      </>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              ),
              value: TorrentSizeFilter.LG,
            },
            {
              text: (
                <>
                  &gt;=1.5GB&nbsp;
                  <Tooltip title="整季合集、剧场版、少数极高画质单集">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              ),
              value: TorrentSizeFilter.XL,
            },
          ],
          stateKey: {
            filter: 'size',
          },
        },
        {
          title: '操作',
          render: (_, r) => (
            <Space
              direction={mobile ? 'vertical' : 'horizontal'}
              size={mobile ? 0 : 8}
            >
              <Typography.Link
                href={r.torrentLink}
                download
                target="_blank"
                rel="noreferrer noopener"
              >
                下载种子
              </Typography.Link>
              <Button
                type="link"
                className={styles.copyButton}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(r.torrentLink);
                    void message.success('复制成功');
                  } catch (error) {
                    handleError(error, '复制失败，请检查浏览器剪贴板权限');
                  }
                }}
              >
                复制链接
              </Button>
            </Space>
          ),
          width: mobile ? 88 : 154,
          className: tableStyles.compactCell,
          fixed: 'right',
        },
      ],
      [mobile, update],
    ),
  );
}

export async function queryTorrents(
  client: ApolloClient<object>,
  {
    pageSize = 10,
    current = 1,
    keyword,
  }: {
    pageSize?: number;
    current?: number;
    keyword?: string;
  },
  {
    publishDate: publishDateSort,
    episode: episodeSort,
  }: {
    publishDate?: 'ascend' | 'descend';
    episode?: 'ascend' | 'descend';
  },
  {
    size,
    channel,
  }: {
    size?: TorrentSizeFilter[];
    channel?: TorrentChannel[];
  },
  { alias, part }: Record<string, string>,
) {
  const filter: TorrentFilter = {
    ...(channel?.length ? { channel: { in: channel } } : {}),
    ...(keyword
      ? {
          title: {
            includesInsensitive: keyword,
          },
        }
      : undefined),
    ...(size
      ? {
          or: size.map((value) => ({
            size: (
              {
                xs: {
                  lessThan: 10 * 1024 * 1024,
                },
                sm: {
                  greaterThanOrEqualTo: 10 * 1024 * 1024,
                  lessThan: 150 * 1024 * 1024,
                },
                md: {
                  greaterThanOrEqualTo: 150 * 1024 * 1024,
                  lessThan: 750 * 1024 * 1024,
                },
                lg: {
                  greaterThanOrEqualTo: 750 * 1024 * 1024,
                  lessThan: 1.5 * 1024 * 1024 * 1024,
                },
                xl: {
                  greaterThanOrEqualTo: 1.5 * 1024 * 1024 * 1024,
                },
              } as Record<TorrentSizeFilter, BigIntFilter>
            )[value],
          })),
        }
      : undefined),
    ...(alias
      ? {
          seasonTitleAliases: {
            contains: [alias],
          },
        }
      : undefined),
    ...(part
      ? {
          organizationParts: {
            contains: [part],
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
    ...(episodeSort
      ? episodeSort === 'ascend'
        ? [TorrentsOrderBy.EpisodeSortAsc]
        : [TorrentsOrderBy.EpisodeSortDesc]
      : []),
  ];
  try {
    const { data } = await client.query({
      query: ListTorrentsDocument,
      variables: {
        first: pageSize,
        offset: pageSize * (current - 1),
        orderBy: orderBy.length > 0 ? orderBy : [TorrentsOrderBy.IdDesc],
        ...(Object.keys(filter).length > 0 ? { filter } : undefined),
      },
    });
    const result = data.allTorrents;
    if (!result) {
      return {
        success: false,
      };
    }
    return {
      data: extractNode(result) ?? [],
      success: true,
      total: result.totalCount,
    };
  } catch (error) {
    handleError(error, '种子列表获取失败');
    return {
      success: false,
    };
  }
}

export default withAntdSearch(function Torrents() {
  const columns = useColumns();
  const historyAbort = useRef<AbortController>();
  useEffect(() => () => historyAbort.current?.abort(), []);
  const ref = useRef<ActionType>();
  const client = useApolloClient();
  const props = useAntdSearchProps(
    ({ search, sort, filter, custom, current, pageSize, keyword }) =>
      queryTorrents(
        client,
        { ...search, pageSize, current, keyword },
        sort,
        filter,
        custom,
      ),
    {
      hasKeyword: true,
      pagination: {
        pageSize: 100,
      },
    },
  );

  return (
    <div className={styles.root}>
      <PageTitle title="种子列表" />
      <MainTable<TorrentTableRow>
        columns={columns}
        rowKey="id"
        {...props}
        defaultSize="middle"
        headerTitle={<TableTitle>种子列表</TableTitle>}
        actionRef={ref}
        toolBarRender={() => [
          <Tooltip
            key={0}
            title="同步失败超过 1 天时，获取历史数据补充缺失的种子"
          >
            <AsyncButton
              type="primary"
              onClick={async () => {
                const controller = new AbortController();
                historyAbort.current = controller;
                const key = 'torrent-history-sync';
                const showProgress = (added: number) =>
                  message.loading({
                    key,
                    content: `同步中，已新增 ${added} 条种子`,
                    duration: 0,
                  });
                const hide = showProgress(0);
                try {
                  const added = await syncTorrentHistory(
                    client,
                    controller.signal,
                    (added) => {
                      if (!controller.signal.aborted) void showProgress(added);
                    },
                  );
                  if (controller.signal.aborted) return;
                  void message.success(`同步成功，新增 ${added} 条种子`);
                  void ref.current?.reload();
                } catch (error) {
                  if (!controller.signal.aborted)
                    handleError(error, '同步失败');
                } finally {
                  hide();
                }
              }}
              icon={<HistoryOutlined />}
            >
              同步历史种子
            </AsyncButton>
          </Tooltip>,
        ]}
        search={false}
        scroll={{
          x: columns.reduce((total, column) => total + Number(column.width), 0),
        }}
      />
    </div>
  );
});
