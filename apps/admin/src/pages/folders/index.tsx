import AsyncButton from '@/components/AsyncButton';
import { TableTitle } from '@/components/Layout';
import { jellyfinFolderLink } from '@/constants/link';
import {
  Folders_ListFoldersDocument,
  Folders_ListFoldersFieldsFragment,
  Folders_SetFolderDefaultDocument,
  Folders_SyncJellyfinFoldersDocument,
  Folders_UpdateFolderByIdDocument,
  JellyfinFoldersOrderBy,
} from '@/generated/types';
import { ExcludeTypename } from '@/utils/graphql';
import {
  TableColumns,
  processApolloQueryResult,
  useAntdSearchProps,
  useProColumns,
  withAntdSearch,
} from '@/utils/search';
import { HistoryOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@ant-design/pro-table';
import { useApolloClient } from '@apollo/client';
import { Typography, message } from 'antd';
import { MutableRefObject, useMemo, useRef } from 'react';
import styles from './index.module.less';

type RowType = ExcludeTypename<Folders_ListFoldersFieldsFragment>;

function useColumns(action: MutableRefObject<ActionType | undefined>) {
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
        },
        {
          title: '名称',
          tooltip: '创建新季度时会自动选中默认媒体库',
          dataIndex: 'name',
          ellipsis: false,
          width: 240,
          sorter: true,
          stateKey: {
            sort: 'name',
          },
          render: (_, r) => (
            <>
              {r.name}
              {r.isDefault ? (
                <span className={styles.default}>（默认）</span>
              ) : null}
            </>
          ),
        },
        {
          title: 'Jellyfin',
          dataIndex: 'jellyfinId',
          render: (_, r) =>
            r.jellyfinId ? (
              <Typography.Link
                key={0}
                href={jellyfinFolderLink(r.jellyfinId)}
                target="_blank"
                rel="noreferer noopener"
              >
                {r.jellyfinId.substring(0, 8)}
              </Typography.Link>
            ) : (
              '-'
            ),
          width: 120,
        },
        {
          title: '原始路径',
          tooltip: 'Jellyfin内配置的媒体库路径',
          dataIndex: 'location',
          ellipsis: true,
          width: 400,
        },
        {
          title: '映射路径',
          tooltip: '映射到lani系统中的路径',
          dataIndex: 'mappedLocation',
          ellipsis: true,
          width: 400,
        },
        {
          title: '可见性',
          tooltip: '季度列表页未筛选媒体库时，是否展示对应媒体库的季度',
          dataIndex: 'isHidden',
          valueEnum: {
            false: {
              text: '默认展示',
              status: 'Success',
            },
            true: {
              text: '默认隐藏',
              status: 'Error',
            },
          },
          width: 160,
        },
        {
          title: '操作',
          valueType: 'option',
          render: (_, r, __, action) => [
            <Typography.Link
              key={0}
              onClick={async () => {
                try {
                  await client.mutate({
                    mutation: Folders_UpdateFolderByIdDocument,
                    variables: {
                      id: r.id,
                      folderPatch: {
                        isHidden: false,
                      },
                    },
                  });
                  void message.success('设置成功');
                  void action?.reload();
                } catch (error) {
                  console.error(error);
                  void message.error('设置失败');
                }
              }}
              disabled={!r.isHidden}
            >
              展示
            </Typography.Link>,
            <Typography.Link
              key={1}
              onClick={async () => {
                try {
                  await client.mutate({
                    mutation: Folders_UpdateFolderByIdDocument,
                    variables: {
                      id: r.id,
                      folderPatch: {
                        isHidden: true,
                      },
                    },
                  });
                  void message.success('设置成功');
                  void action?.reload();
                } catch (error) {
                  console.error(error);
                  void message.error('设置失败');
                }
              }}
              disabled={r.isHidden}
            >
              隐藏
            </Typography.Link>,
            <Typography.Link
              key={2}
              onClick={async () => {
                try {
                  await client.mutate({
                    mutation: Folders_SetFolderDefaultDocument,
                    variables: {
                      id: r.id,
                    },
                  });
                  void message.success('设置成功');
                  void action?.reload();
                } catch (error) {
                  console.error(error);
                  void message.error('设置失败');
                }
              }}
              disabled={r.isDefault}
            >
              设为默认
            </Typography.Link>,
          ],
          search: false,
          width: 180,
        },
      ],
      [client],
    ),
  );
}

function FoldersPage() {
  const client = useApolloClient();
  const action = useRef<ActionType>();
  const columns = useColumns(action);
  const props = useAntdSearchProps(
    async ({ pageSize = 10, current = 1, sort }) => {
      const orderBy: JellyfinFoldersOrderBy[] = [
        ...(sort.name
          ? sort.name === 'ascend'
            ? [JellyfinFoldersOrderBy.NameAsc]
            : [JellyfinFoldersOrderBy.NameDesc]
          : []),
      ];
      const result = await client.query({
        query: Folders_ListFoldersDocument,
        variables: {
          orderBy,
          first: pageSize,
          offset: (current - 1) * pageSize,
        },
      });
      return processApolloQueryResult(result);
    },
    {
      hasKeyword: false,
    },
  );

  return (
    <ProTable<RowType>
      columns={columns}
      rowKey="id"
      actionRef={action}
      {...props}
      headerTitle={<TableTitle>媒体库管理</TableTitle>}
      search={false}
      toolBarRender={() => [
        <AsyncButton
          key={0}
          type="primary"
          onClick={async () => {
            const hide = message.loading('同步中，请稍候……', 0);
            try {
              await client.mutate({
                mutation: Folders_SyncJellyfinFoldersDocument,
              });
              void message.success('同步成功');
              void action.current?.reload();
            } catch (error) {
              console.error(error);
              void message.error('同步失败');
            } finally {
              hide();
            }
          }}
          icon={<HistoryOutlined />}
        >
          同步媒体库
        </AsyncButton>,
      ]}
    />
  );
}

export default withAntdSearch(FoldersPage);
