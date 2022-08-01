import {
  FormValues,
  SeasonPageContext,
  useSeasonPage,
} from '@/pages/season/help';
import ProForm from '@ant-design/pro-form';
import { Spin } from 'antd';
import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'umi';
import Connections from './parts/connections';
import DownloadSources from './parts/download-sources';
import Episodes from './parts/episodes';
import Header from './parts/header';
import Metadata from './parts/metadata';
import Notifications from './parts/notifications';

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
    values: { modified, submit, reset },
    updateTouched,
  } = useSeasonPage(id);

  return (
    <SeasonPageContext.Provider value={values}>
      <Spin spinning={loading}>
        <ProForm<FormValues>
          formRef={formRef}
          onFinish={submit}
          params={{ id }}
          initialValues={initialValues}
          submitter={{
            searchConfig: {
              submitText: '保存',
            },
            submitButtonProps: {
              disabled: !modified,
            },
            resetButtonProps: {
              disabled: !modified,
              onClick: reset,
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
          onValuesChange={updateTouched}
        >
          <Header ref={setHeaderExtraEl} />
          <Connections />
          <Metadata />
          <DownloadSources />
          <Notifications />
          <Episodes />
          <div style={{ height: 80 }} />
        </ProForm>
      </Spin>
    </SeasonPageContext.Provider>
  );
}
