import { TableTitle } from '@/components/Layout';
import {
  BigIntFilter,
  ListTorrentsDocument,
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
import { QuestionCircleOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { ApolloClient, useApolloClient } from '@apollo/client';
import { Space, Tag, TagProps, Tooltip, Typography } from 'antd';
import { hsluvToHex } from 'hsluv';
import md5 from 'md5';
import prettyBytes from 'pretty-bytes';
import { useMemo, useRef } from 'react';
import styles from './index.module.less';

function chooseColor(text: string) {
  const hash = md5(text);
  return (parseInt(hash.substring(0, 4), 16) / 65536) * 360;
}

function ColoredTag({ text, ...props }: { text: string } & TagProps) {
  const hue = useMemo(() => chooseColor(text), [text]);
  return (
    <Tooltip title={text}>
      <Tag
        className={styles.tag}
        style={{
          ['--tag-border-color' as string]: hsluvToHex([hue, 80, 80]),
          ['--tag-hover-border-color' as string]: hsluvToHex([hue, 90, 65]),
          ['--tag-color' as string]: hsluvToHex([hue, 65, 50]),
          ['--tag-hover-color' as string]: hsluvToHex([hue, 90, 30]),
          ['--tag-bg-color' as string]: hsluvToHex([hue, 65, 96]),
          ['--tag-hover-bg-color' as string]: hsluvToHex([hue, 50, 90]),
        }}
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

function useColumns() {
  const mobile = useMobile();
  const { update } = useAntdSearchContext();

  return useProColumns(
    useMemo(
      (): TableColumns<
        TorrentFieldsFragment & TorrentParseFieldsFragment
      >[] => [
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
            <Typography.Text className={styles.title} copyable>
              {r.title}
            </Typography.Text>
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
          render: (_, r) =>
            typeof r.index === 'number'
              ? `${r.index}`
              : typeof r.indexFrom === 'number' && typeof r.indexTo === 'number'
              ? `${r.indexFrom}-${r.indexTo}`
              : '-',
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
          render: (_, r) =>
            r.subtitleHasChs || r.subtitleHasCht || r.subtitleHasJp
              ? `${r.subtitleHasChs ? '简' : ''}${
                  r.subtitleHasCht ? '繁' : ''
                }${r.subtitleHasJp ? '日' : ''}${r.subtitleType || ''}`
              : '-',
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
      [mobile, update],
    ),
  );
}

async function queryTorrents(
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
  }: {
    size?: TorrentSizeFilter[];
  },
  { alias, part }: Record<string, string>,
) {
  const filter: TorrentFilter = {
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
        ? [TorrentsOrderBy.IndexAsc, TorrentsOrderBy.IndexFromAsc]
        : [TorrentsOrderBy.IndexDesc, TorrentsOrderBy.IndexFromDesc]
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

export default withAntdSearch(function Torrents() {
  const columns = useColumns();

  const ref = useRef<ActionType>();
  const client = useApolloClient();
  const mobile = useMobile();

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
        pageSizeOptions: [50, 100, 200],
        defaultPageSize: 100,
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
      <ProTable<TorrentFieldsFragment & TorrentParseFieldsFragment>
        columns={columns}
        rowKey="id"
        {...props}
        defaultSize="middle"
        headerTitle={<TableTitle>种子列表</TableTitle>}
        actionRef={ref}
        search={false}
        className={styles.root}
        scroll={{
          x: 1300,
        }}
      />
    </>
  );
});
