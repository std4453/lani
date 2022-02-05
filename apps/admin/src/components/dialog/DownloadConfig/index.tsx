import { useSingletonDialog } from '@/components/dialog';
import RssList from '@/components/dialog/DownloadConfig/RssList';
import useRssList from '@/components/dialog/DownloadConfig/useRssList';
import {
  CreateDownloadConfigDocument,
  GetAnimeBangumiIdDocument,
  GetDownloadConfigByIdDocument,
  GetDownloadConfigByIdQuery,
  UpdateDownloadConfigDocument,
} from '@/generated/types';
import { QuestionCircleOutlined, SelectOutlined } from '@ant-design/icons';
import ProForm, {
  ModalForm,
  ProFormInstance,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-form';
import { useApolloClient, useQuery } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { Button, Layout, message, Spin } from 'antd';
import { escapeRegExp } from 'lodash';
import { useEffect, useMemo, useRef } from 'react';
import { FormValues } from './types';

function mapDataToValues(
  data: GetDownloadConfigByIdQuery,
): FormValues | undefined {
  if (!data?.downloadConfigById) {
    void message.error('请求的元数据条目不存在');
    return;
  }

  const {
    bangumiId,
    isArchived,
    language,
    pattern,
    publishGroupId,
    quality,
    type,
  } = data?.downloadConfigById;

  if (isArchived) {
    void message.error('请求的元数据条目已被删除');
    return;
  }

  return {
    bangumiId,
    language,
    pattern,
    publishGroupId,
    quality,
    type,
  };
}

export default function DownloadConfig() {
  const { reject, resolve, params, visible } =
    useSingletonDialog('DownloadConfig');

  const animeId = params?.animeId ?? 0;

  const { loading: animeLoading, data: animeData } = useQuery(
    GetAnimeBangumiIdDocument,
    {
      variables: {
        id: animeId,
      },
      skip: !animeId,
    },
  );
  const animeBangumiId = useMemo(
    () => animeData?.animeMetadatumById?.mikanAnimeId ?? '',
    [animeData],
  );

  const isEdit = params?.type === 'edit';
  const id = isEdit ? params.id : 0;

  const { loading: dataloading, data: configData } = useQuery(
    GetDownloadConfigByIdDocument,
    {
      variables: {
        id,
      },
      skip: !isEdit,
    },
  );

  const formRef = useRef<ProFormInstance<FormValues>>();

  useEffect(() => {
    if (configData && formRef.current) {
      const values = mapDataToValues(configData);
      if (values) {
        formRef.current.setFieldsValue(values);
      }
    }
  }, [configData]);

  const client = useApolloClient();

  const handleMikanAnimeRSSLink = useMemoizedFn(() => {
    const finalBangumiId =
      formRef.current?.getFieldValue('bangumiId') || animeBangumiId;
    if (!finalBangumiId) {
      void message.info('未指定季度ID');
      return;
    }
    const publishGroupId = formRef.current?.getFieldValue('publishGroupId');
    if (!publishGroupId) {
      void message.info('未指定字幕组ID');
      return;
    }
    window.open(
      `https://mikanani.me/RSS/Bangumi?bangumiId=${finalBangumiId}&subgroupid=${publishGroupId}`,
      '_blank',
    );
  });

  const handleEscape = useMemoizedFn(() => {
    formRef.current?.setFieldsValue({
      pattern: escapeRegExp(formRef.current.getFieldValue('pattern')),
    });
  });

  const { onChange, data, loading } = useRssList(animeBangumiId, formRef);

  return (
    <ModalForm<FormValues>
      visible={visible}
      modalProps={{
        destroyOnClose: true,
        onCancel: reject,
        width: 1200,
      }}
      formRef={formRef}
      onFinish={async ({
        bangumiId,
        language,
        pattern,
        publishGroupId,
        quality,
        type,
      }) => {
        try {
          if (isEdit) {
            await client.mutate({
              mutation: UpdateDownloadConfigDocument,
              variables: {
                id,
                downloadConfigPatch: {
                  bangumiId,
                  language,
                  pattern,
                  publishGroupId,
                  quality,
                  type,
                },
              },
            });
          } else {
            await client.mutate({
              mutation: CreateDownloadConfigDocument,
              variables: {
                downloadConfig: {
                  anime: animeId,
                  bangumiId,
                  language,
                  pattern,
                  publishGroupId,
                  quality,
                  type,
                },
              },
            });
          }
          resolve();
          return true;
        } catch (e) {
          console.error(e);
          void message.error(isEdit ? '保存失败' : '新建失败');
          return false;
        }
      }}
      title={
        <>
          {isEdit ? '编辑下载配置' : '新建下载配置'}&nbsp;
          <a
            href="https://std-4453.feishu.cn/wiki/wikcnCXHwF33Jud4IcfiNtrP0jh"
            target="_blank"
            style={{ fontWeight: 'normal' }}
            rel="noreferrer"
          >
            <QuestionCircleOutlined />
          </a>
        </>
      }
      initialValues={{
        language: 'Chinese',
        quality: 1080,
        type: 'WEBDL',
      }}
      onValuesChange={(changedValues) => {
        if ('bangumiId' in changedValues || 'publishGroupId' in changedValues) {
          onChange();
        }
      }}
    >
      <Layout
        style={{
          background: 'none',
        }}
      >
        <Layout.Content>
          <Spin spinning={animeLoading || dataloading}>
            <ProForm.Group>
              <ProFormText
                name="bangumiId"
                label="季度ID"
                tooltip="留空表示与动画配置一致"
                width="sm"
              />
              <ProFormText
                name="publishGroupId"
                label="字幕组ID"
                tooltip={
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
                }
                width="sm"
                addonAfter={
                  <>
                    <Button type="link" onClick={handleMikanAnimeRSSLink}>
                      <SelectOutlined /> RSS地址
                    </Button>
                  </>
                }
                required
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                name="pattern"
                label="匹配规则"
                tooltip="命名组episode用于匹配集数"
                width="xl"
                required
                rules={[
                  {
                    required: true,
                  },
                ]}
                addonAfter={<Button onClick={handleEscape}>反转义</Button>}
              />
            </ProForm.Group>
            <ProForm.Group>
              <ProFormText
                name="language"
                label="语言"
                width="sm"
                required
                rules={[
                  {
                    required: true,
                  },
                ]}
              />
              <ProFormSelect
                name="quality"
                label="分辨率"
                width="sm"
                required
                rules={[
                  {
                    required: true,
                  },
                ]}
                options={[
                  {
                    value: 720,
                    label: '720p',
                  },
                  {
                    value: 1080,
                    label: '1080p',
                  },
                  {
                    value: 2160,
                    label: '4K',
                  },
                ]}
                showSearch
              />
              <ProFormSelect
                name="type"
                label="下载类型"
                width="sm"
                required
                rules={[
                  {
                    required: true,
                  },
                ]}
                options={['WEBDL', 'WEBRIP', 'Blu-ray']}
              />
            </ProForm.Group>
          </Spin>
        </Layout.Content>
        <Layout.Sider theme="light" width={300}>
          <RssList data={data} loading={loading} />
        </Layout.Sider>
      </Layout>
    </ModalForm>
  );
}
