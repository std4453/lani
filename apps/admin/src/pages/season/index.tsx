import {
  GetSeasonByIdAllDocument,
  GetSeasonByIdConfigOnlyDocument,
  GetSeasonByIdEpisodesOnlyDocument,
} from '@/generated/types';
import Connections from '@/pages/season/Connections';
import DownloadSources from '@/pages/season/DownloadSources';
import Episodes from '@/pages/season/Episodes';
import Header from '@/pages/season/Header';
import {
  Episode,
  FormValues,
  mapEpisode,
  queryToFormValues,
  useOnFinish,
} from '@/pages/season/help';
import Metadata from '@/pages/season/Metadata';
import { extractNode } from '@/utils/graphql';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn, useMount } from 'ahooks';
import { message, Spin } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'umi';

export default function SeasonPage() {
  const { id: idStr } = useParams<{
    id: string;
  }>();
  const id = useMemo(() => parseInt(idStr), [idStr]);

  const client = useApolloClient();
  const formRef = useRef<ProFormInstance<FormValues>>();
  const [headerExtraEl, setHeaderExtraEl] = useState<HTMLDivElement | null>(
    null,
  );

  const [initialValues, setInitialValues] = useState<FormValues | undefined>(
    undefined,
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  useMount(async () => {
    setLoading(true);
    try {
      const { data } = await client.query({
        query: GetSeasonByIdAllDocument,
        variables: {
          id,
        },
      });
      if (!data.seasonById || data.seasonById.isArchived) {
        void message.error('动画不存在或已被删除');
        return;
      }
      setInitialValues(queryToFormValues(data.seasonById));
      formRef.current?.resetFields();
      setEpisodes(
        (extractNode(data.seasonById.episodesBySeasonId) ?? []).map(mapEpisode),
      );
    } finally {
      setLoading(false);
    }
  });
  const reloadConfig = useMemoizedFn(async () => {
    setLoading(true);
    try {
      const { data } = await client.query({
        query: GetSeasonByIdConfigOnlyDocument,
        variables: {
          id,
        },
      });
      if (!data.seasonById || data.seasonById.isArchived) {
        return;
      }
      setInitialValues(queryToFormValues(data.seasonById));
      formRef.current?.resetFields();
    } finally {
      setLoading(false);
    }
  });
  const reloadEpisodes = useMemoizedFn(async () => {
    setLoading(true);
    try {
      const { data } = await client.query({
        query: GetSeasonByIdEpisodesOnlyDocument,
        variables: {
          id,
        },
      });
      if (!data.seasonById) {
        return;
      }
      setEpisodes(
        (extractNode(data.seasonById.episodesBySeasonId) ?? []).map(mapEpisode),
      );
    } finally {
      setLoading(false);
    }
  });

  const onFinish = useOnFinish(id, reloadConfig);

  return (
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
        <Header
          id={id}
          formRef={formRef}
          ref={setHeaderExtraEl}
          reloadConfig={reloadConfig}
          reloadEpisodes={reloadEpisodes}
        />
        <Connections id={id} reloadConfig={reloadConfig} />
        <Metadata />
        <DownloadSources />
        <Episodes episodes={episodes} reloadEpisodes={reloadEpisodes} />
        <div style={{ height: 80 }} />
      </ProForm>
    </Spin>
  );
}
