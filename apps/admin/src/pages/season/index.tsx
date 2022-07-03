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
import Notifications from '@/pages/season/Notifications';
import ProForm from '@ant-design/pro-form';
import { useMemoizedFn } from 'ahooks';
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
    values: { reloadConfig, modified },
    updateTouched,
  } = useLoadData(id);

  const onFinish = useOnFinish(id, reloadConfig);

  const handleReset = useMemoizedFn(() => {
    formRef.current?.resetFields();
    updateTouched();
  });

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
            submitButtonProps: {
              disabled: !modified,
            },
            resetButtonProps: {
              disabled: !modified,
              onClick: handleReset,
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
