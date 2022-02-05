import { useOpenDialog } from '@/components/dialog';
import {
  DeleteDownloadConfigByIdDocument,
  GetDownloadConfigByAnimeidDocument,
  GetDownloadConfigByAnimeidQuery,
} from '@/generated/types';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { useApolloClient } from '@apollo/client';
import { Button, message, Popconfirm } from 'antd';
import { MutableRefObject, useMemo, useRef } from 'react';

type RowType = ExtractNode<
  GetDownloadConfigByAnimeidQuery['allDownloadConfigs']
>;

function useColumns(
  animeId: number,
  actionsRef: MutableRefObject<ActionType | undefined>,
) {
  const client = useApolloClient();
  const openDownloadConfig = useOpenDialog('DownloadConfig');

  return useMemo(
    (): ProColumns<RowType>[] => [
      {
        dataIndex: 'id',
        valueType: 'index',
        width: 48,
        fixed: 'left',
      },
      {
        title: '季度ID',
        tooltip: '留空表示和关联信息中的「mikanani.me季度ID」一致',
        dataIndex: 'bangumiId',
        width: 100,
      },
      {
        title: '字幕组ID',
        dataIndex: 'publishGroupId',
        width: 100,
        tooltip: (
          <>
            常见字幕组: <br />
            Lilith-Raws: 329
            <br />
            NC-Raws: 338
            <br />
            c.c动漫: 165
            <br />
            NaN-Raws: 353
            <br />
            LoliHouse: 223
          </>
        ),
      },
      {
        title: '匹配模式',
        dataIndex: 'pattern',
        ellipsis: true,
        width: 600,
      },
      {
        title: (
          <>
            类型{' '}
            <a
              href="https://en.wikipedia.org/wiki/Pirated_movie_release_types"
              target="_blank"
              rel="noreferrer"
            >
              <QuestionCircleOutlined />
            </a>
          </>
        ),
        dataIndex: 'type',
        width: 100,
      },
      {
        title: '分辨率',
        dataIndex: 'quality',
        width: 100,
        renderText: (quality: number) => `${quality}p`,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, r) => [
          <a
            key="edit"
            onClick={async () => {
              try {
                await openDownloadConfig({
                  animeId,
                  type: 'edit',
                  id: r.id,
                });
                void actionsRef.current?.reload();
              } catch (e) {}
            }}
          >
            编辑
          </a>,
          <Popconfirm
            key="delete"
            title="确认删除？"
            onConfirm={async () => {
              try {
                await client.mutate({
                  mutation: DeleteDownloadConfigByIdDocument,
                  variables: {
                    id: r.id,
                  },
                });
                void message.success('删除成功');
                void actionsRef.current?.reload();
              } catch (e) {
                console.error(e);
                void message.error('删除失败');
              }
            }}
          >
            <a href="#">删除</a>
          </Popconfirm>,
        ],
        search: false,
        width: 120,
        fixed: 'right',
      },
    ],
    [],
  );
}

export default function DownloadConfig({ animeId }: { animeId: number }) {
  const actionsRef = useRef<ActionType>();
  const columns = useColumns(animeId, actionsRef);
  const client = useApolloClient();
  const openDownloadConfig = useOpenDialog('DownloadConfig');

  return (
    <>
      <ProTable<RowType>
        headerTitle="下载信息"
        search={false}
        columns={columns}
        scroll={{ x: '100%' }}
        request={async () => {
          const { data } = await client.query({
            query: GetDownloadConfigByAnimeidDocument,
            variables: {
              id: animeId,
            },
            fetchPolicy: 'network-only',
          });
          return {
            success: true,
            data: extractNode(data?.allDownloadConfigs) ?? [],
          };
        }}
        pagination={false}
        options={{}}
        actionRef={actionsRef}
        toolBarRender={() => [
          <Button
            key="button"
            icon={<PlusOutlined />}
            type="primary"
            onClick={async () => {
              try {
                await openDownloadConfig({
                  animeId,
                  type: 'create',
                });
                void actionsRef.current?.reload();
              } catch (e) {}
            }}
          >
            新建
          </Button>,
        ]}
        rowKey="id"
      />
    </>
  );
}
