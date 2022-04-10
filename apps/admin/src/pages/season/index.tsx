import Connections from '@/pages/season/Connections';
import DownloadSources from '@/pages/season/DownloadSources';
import Episodes from '@/pages/season/Episodes';
import Header from '@/pages/season/Header';
import {
  FormValues,
  SeasonPageContext,
  useLoad as useLoadData,
  useOnFinish,
} from '@/pages/season/help';
import Metadata from '@/pages/season/Metadata';
import ProForm from '@ant-design/pro-form';
import { Spin } from 'antd';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'umi';

export default function SeasonPage() {
  const { id: idStr } = useParams<{
    id: string;
  }>();
  const id = useMemo(() => parseInt(idStr), [idStr]);

  const [headerExtraEl, setHeaderExtraEl] = useState<HTMLDivElement | null>(
    null,
  );

  const {
    initialValues,
    loading,
    formRef,
    values,
    values: { reloadConfig },
  } = useLoadData(id);

  const onFinish = useOnFinish(id, reloadConfig);

  return (
    <SeasonPageContext.Provider value={values}>
      <Spin spinning={loading}>
        <ProForm<FormValues>
          formRef={formRef}
          onFinish={onFinish}
          params={{ id }}
          initialValues={initialValues}
          submitter={{
            searchConfig: {
              submitText: '保存',
            },
            render: (_props, dom) =>
              headerExtraEl && createPortal(dom, headerExtraEl),
          }}
          layout="horizontal"
          colon={false}
          style={{
            maxHeight: '100vh',
            overflow: 'auto',
          }}
        >
          <Header ref={setHeaderExtraEl} />
          <Connections />
          <Metadata />
          <DownloadSources />
          <Episodes />
          <div style={{ height: 80 }} />
        </ProForm>
      </Spin>
    </SeasonPageContext.Provider>
  );
}
