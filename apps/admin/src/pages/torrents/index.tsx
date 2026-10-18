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
  SyncMikanHistoryDocument,
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
import {
  CSSProperties,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from 'react';
import styles from './index.module.less';
import { syncNyaaHistory } from './history';
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
          width: 96,
        },
        {
          title: '种子标题',
          dataIndex: 'title',
          copyable: true,
          render: (_, r) => (
            <Typography.Text
              className={styles.title}
              copyable={{ text: r.title }}
            >
              {r.title}
              {r.permalink && (
                <Button
                  type="link"
                  className={styles.permalinkButton}
                  icon={<ExportOutlined />}
                  href={r.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="打开种子详情"
                  title="打开种子详情"
                />
              )}
            </Typography.Text>
          ),
        },
        {
          title: '来源',
          dataIndex: 'channel',
          width: 100,
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
          width: 200,
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
          title: '剧集名称',
          dataIndex: 'aliases',
          copyable: false,
          width: mobile ? 200 : 300,
          render: (_, r) => {
            const aliases = r.seasonTitleAliases ?? [];
            if (!aliases.length) {
              return '-';
            }
            return (
              <div className={styles.tagContainer}>
                {aliases.map((alias, i) =>
                  alias ? (
                    <ColoredTag
                      key={i}
                      text={alias}
                      onClick={() => {
                        update({
                          custom: { alias },
                        });
                      }}
                    />
                  ) : null,
                )}
              </div>
            );
          },
          stateKey: {
            custom: 'alias',
          },
        },
        {
          title: '集数',
          dataIndex: 'episode',
          render: (_, r) => formatEpisode(r.episodeInfo),
          width: 72,
          sorter: true,
          stateKey: {
            sort: 'episode',
          },
        },
        {
          title: '字幕',
          key: 'subtitles',
          width: 100,
          render: (_, r) => <TorrentSubtitle info={r.subtitleInfo} />,
        },
        {
          title: '发布时间',
          dataIndex: 'publishDate',
          valueType: 'dateTime',
          width: 180,
          sorter: true,
          stateKey: {
            sort: 'publishDate',
          },
        },
        {
          title: '种子大小',
          dataIndex: 'size',
          width: 100,
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
            <Space direction="horizontal">
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
          width: 176,
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
        orderBy:
          orderBy.length > 0 ? orderBy : [TorrentsOrderBy.PublishDateDesc],
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
  const baseColumns = useColumns();
  const historyAbort = useRef<AbortController>();
  useEffect(() => () => historyAbort.current?.abort(), []);
  const container = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<readonly TorrentTableRow[]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  useLayoutEffect(() => {
    const root = container.current;
    if (!root) return;
    const measure = () => {
      const next = baseColumns.map((column, index) => {
        const cells = root.querySelectorAll<HTMLElement>(
          `[data-torrent-column="${index}"]`,
        );
        const header = root.querySelectorAll<HTMLElement>('thead th')[index];
        const padding = header
          ? parseFloat(getComputedStyle(header).paddingLeft) +
            parseFloat(getComputedStyle(header).paddingRight)
          : 16;
        const content = Math.max(
          0,
          ...Array.from(cells, (cell) => cell.getBoundingClientRect().width),
        );
        // 内容最大宽度外保留 16px，单元格 padding 另计。
        return Math.ceil(content + 16 + padding);
      });
      setWidths((old) => (old.join() === next.join() ? old : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    root
      .querySelectorAll('[data-torrent-column]')
      .forEach((cell) => observer.observe(cell));
    return () => observer.disconnect();
  }, [rows, baseColumns]);
  const columns = baseColumns.map((column, index) => ({
    ...column,
    width: widths[index] || column.width,
    title: (
      <span className={styles.cellContent} data-torrent-column={index}>
        {column.title as string}
      </span>
    ),
    render: (
      dom: React.ReactNode,
      row: TorrentTableRow,
      rowIndex: number,
      action: any,
      schema: any,
    ) => (
      <span className={styles.cellContent} data-torrent-column={index}>
        {column.render
          ? (column.render(
              dom,
              row,
              rowIndex,
              action,
              schema,
            ) as React.ReactNode)
          : dom}
      </span>
    ),
  }));

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
    <div ref={container} className={styles.root}>
      <PageTitle title="种子列表" />
      <MainTable<TorrentTableRow>
        columns={columns}
        onDataSourceChange={setRows}
        rowKey="id"
        {...props}
        defaultSize="middle"
        headerTitle={<TableTitle>种子列表</TableTitle>}
        actionRef={ref}
        toolBarRender={() => [
          <Tooltip key={0} title="同步蜜柑历史及 Nyaa 约 10 天的历史种子">
            <AsyncButton
              type="primary"
              onClick={async () => {
                const controller = new AbortController();
                historyAbort.current = controller;
                const hide = message.loading('同步中，请稍候……', 0);
                try {
                  const results = await Promise.allSettled([
                    client
                      .mutate({ mutation: SyncMikanHistoryDocument })
                      .then(({ data }) => data?.syncMikanHistory ?? 0),
                    syncNyaaHistory(client, controller.signal),
                  ]);
                  if (controller.signal.aborted) return;
                  const names = ['蜜柑', 'Nyaa'];
                  results.forEach((result, index) => {
                    if (result.status === 'fulfilled') {
                      const count = result.value;
                      void message.success(
                        `${names[index]}同步成功，新增 ${count ?? 0} 条种子`,
                      );
                    } else {
                      handleError(result.reason, `${names[index]}同步失败`);
                    }
                  });
                  void ref.current?.reload();
                } catch (error) {
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
          x: widths.length ? widths.reduce((a, b) => a + b, 0) : 1800,
        }}
      />
    </div>
  );
});
