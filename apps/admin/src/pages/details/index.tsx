import {
  DeleteAnimeByIdDocument,
  GetAnimeDataByIdDocument,
} from '@/generated/types';
import BasicInfo from '@/pages/details/BasicInfo';
import DownloadConfig from '@/pages/details/DownloadConfig';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient, useQuery } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { Button, message, PageHeader, Popconfirm, Spin } from 'antd';
import { useEffect, useMemo, useRef } from 'react';
import { useHistory, useParams } from 'umi';
import { FormValues, mapDataToValues, useOnFinish } from './help';

export default function DetailsPage() {
  const { id: idStr } = useParams<{
    id: string;
  }>();
  const id = useMemo(() => parseInt(idStr), [idStr]);

  const { loading: animeLoading, data: animeData } = useQuery(
    GetAnimeDataByIdDocument,
    {
      variables: {
        id,
      },
    },
  );

  const formRef = useRef<ProFormInstance<FormValues>>();

  const handleReset = useMemoizedFn(() => {
    if (animeData && formRef.current) {
      const values = mapDataToValues(animeData);
      if (values) {
        formRef.current.setFieldsValue(values);
      }
    }
  });

  useEffect(() => {
    handleReset();
  }, [animeData]);

  const client = useApolloClient();
  const history = useHistory();
  const onFinish = useOnFinish(id);

  return (
    <>
      <PageHeader
        title="动画详情"
        extra={[
          <Popconfirm
            key="delete"
            title="确认删除动画？"
            onConfirm={async () => {
              try {
                await client.mutate({
                  mutation: DeleteAnimeByIdDocument,
                  variables: {
                    id,
                  },
                });
                void message.success('删除成功');
                history.replace('/metadata');
              } catch (e) {
                console.error(e);
                void message.error('删除失败');
              }
            }}
          >
            <Button danger>删除</Button>
          </Popconfirm>,
          <Button
            key="save"
            type="primary"
            onClick={() => {
              formRef.current?.submit();
            }}
          >
            保存
          </Button>,
        ]}
      />
      <Spin spinning={animeLoading}>
        <ProForm<FormValues>
          formRef={formRef}
          onReset={handleReset}
          onFinish={onFinish}
          submitter={false}
          style={{
            padding: 24,
          }}
        >
          <BasicInfo />
          <DownloadConfig animeId={id} />
        </ProForm>
      </Spin>
    </>
  );
}
