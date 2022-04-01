import { GetSeasonByIdDocument } from '@/generated/types';
import Header from '@/pages/season/Header';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { useMemo, useRef, useState } from 'react';
import { useParams } from 'umi';
import {
  FormValues,
  queryToFormValues,
  useOnFinish,
} from '@/pages/season/help';
import { createPortal } from 'react-dom';
import Connections from '@/pages/season/Connections';
import Metadata from '@/pages/season/Metadata';
import DownloadSources from '@/pages/season/DownloadSources';
import Episodes from '@/pages/season/Episodes';
import { useMemoizedFn } from 'ahooks';

export default function SeasonPage() {
  const { id: idStr } = useParams<{
    id: string;
  }>();
  const id = useMemo(() => parseInt(idStr), [idStr]);

  const client = useApolloClient();
  const formRef = useRef<ProFormInstance<FormValues>>();
  const onFinish = useOnFinish(id);
  const [headerExtraEl, setHeaderExtraEl] = useState<HTMLDivElement | null>(
    null,
  );

  const [key, setKey] = useState(0);
  const refresh = useMemoizedFn(() => {
    setKey((key) => key + 1);
  });

  return (
    <ProForm<FormValues>
      key={key}
      formRef={formRef}
      onFinish={onFinish}
      params={{ id }}
      request={async ({ id }) => {
        const { data, error } = await client.query({
          query: GetSeasonByIdDocument,
          variables: {
            id,
          },
        });
        if (error) {
          throw error;
        }
        if (!data.seasonById || data.seasonById.isArchived) {
          throw new Error('动画不存在或已被删除');
        }
        return queryToFormValues(data.seasonById);
      }}
      submitter={{
        searchConfig: {
          submitText: '保存',
        },
        render: (_props, dom) =>
          headerExtraEl && createPortal(dom, headerExtraEl),
      }}
      layout="horizontal"
      colon={false}
    >
      <Header
        id={id}
        formRef={formRef}
        ref={setHeaderExtraEl}
        refresh={refresh}
      />
      <Connections />
      <Metadata />
      <DownloadSources />
      <Episodes />
      <div style={{ height: 200 }} />
    </ProForm>
  );
}
