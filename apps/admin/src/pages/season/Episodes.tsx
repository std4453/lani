import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import FormDependency from '@/components/FormDependency';
import { useSearchTorrentDialog } from '@/components/SearchTorrentDialog';
import { DownloadStatusTag } from '@/constants/download-status';
import { jellyfinEpisodeLink } from '@/constants/link';
import {
  DownloadBilibiliCcDocument,
  DownloadTorrentForEpisodeDocument,
  MetadataSource,
  TorrentFieldsFragment
} from '@/generated/types';
import {
  Episode,
  formItemProps,
  FormValues,
  useSeasonPageContext
} from '@/pages/season/help';
import { useManualDownloadMagnetDialog } from '@/pages/season/ManualDownloadMagnetDialog';
import Section from '@/pages/season/Section';
import { getSeasonKeyword } from '@/utils/season';
import { useAsyncButton } from '@/utils/useAsyncButton';
import { DownOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { useApolloClient } from '@apollo/client';
import { Alert, Button, Dropdown, Menu, message, Typography } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useRef } from 'react';

function useColumns({
  openDownloadMagnet,
  openEpisodeDetails,
  openSearchTorrent,
}: {
  openEpisodeDetails: ReturnType<typeof useEpisodeDetailsDialog>[2];
  openDownloadMagnet: ReturnType<typeof useManualDownloadMagnetDialog>[2];
  openSearchTorrent: ReturnType<typeof useSearchTorrentDialog>[2];
}) {
  const { reloadEpisodes, formRef } = useSeasonPageContext();

  const client = useApolloClient();
  return useMemo(
    (): ProColumns<Episode>[] => [
      {
        title: '#',
        dataIndex: 'index',
        align: 'center',
        width: 48,
      },
      {
        title: '标题',
        dataIndex: 'title',
        copyable: true,
        ellipsis: false,
      },
      {
        title: '放送时间',
        dataIndex: 'airTime',
        width: 120,
        valueType: 'date',
      },
      {
        title: '下载状态',
        dataIndex: 'jobStatus',
        width: 120,
        render: (_, r) => <DownloadStatusTag status={r.jobStatus} />,
      },
      {
        title: 'Jellyfin',
        dataIndex: 'jellyfinEpisodeId',
        render: (_, r) =>
          r.jellyfinEpisodeId ? (
            <Typography.Link
              key={0}
              href={jellyfinEpisodeLink(r.jellyfinEpisodeId)}
              target="_blank"
              rel="noreferer noopener"
            >
              {r.jellyfinEpisodeId.substring(0, 8)}
            </Typography.Link>
          ) : (
            '-'
          ),
        width: 120,
      },
      {
        title: '操作',
        valueType: 'option',
        render: (_, r) => [
          <Typography.Link
            key={0}
            onClick={() => {
              void openEpisodeDetails({ episodeId: r.id });
            }}
          >
            查看详情
          </Typography.Link>,
          <Typography.Link key={1}>手动导入</Typography.Link>,
          <Dropdown
            key={2}
            overlay={
              <Menu>
                <Menu.Item
                  onClick={() => {
                    if (!formRef.current) {
                      return;
                    }
                    void openSearchTorrent({
                      keyword: getSeasonKeyword(
                        formRef.current.getFieldValue('title'),
                      ),
                      async onResolve(torrent: TorrentFieldsFragment) {
                        try {
                          await client.mutate({
                            mutation: DownloadTorrentForEpisodeDocument,
                            variables: {
                              episodeId: r.id,
                              torrentLink: torrent.torrentLink,
                            },
                          });
                          void message.success('下载任务创建成功');
                          void reloadEpisodes();
                        } catch (e) {
                          console.error(e);
                          void message.error('下载任务创建失败');
                        }
                      },
                    });
                  }}
                >
                  搜索种子
                </Menu.Item>
                <Menu.Item
                  onClick={() => {
                    void openDownloadMagnet({
                      episodeId: r.id,
                      onResolve: reloadEpisodes,
                    });
                  }}
                >
                  磁力链接
                </Menu.Item>
              </Menu>
            }
          >
            <Typography.Link>
              手动下载&nbsp;
              <DownOutlined />
            </Typography.Link>
          </Dropdown>,
          <Dropdown
            key={3}
            overlay={
              <Menu>
                <Menu.Item
                  onClick={async () => {
                    const values = formRef.current?.getFieldsValue();
                    if (!values?.bilibiliThmId) {
                      void message.error('未设置Bilibili港澳台ID');
                      return;
                    }
                    const hide = message.loading('正在下载字幕', 0);
                    try {
                      await client.mutate({
                        mutation: DownloadBilibiliCcDocument,
                        variables: {
                          episodeId: r.id,
                        },
                      });
                      void message.success('字幕下载成功');
                    } catch (e) {
                      console.error(e);
                      void message.error('字幕下载失败');
                    } finally {
                      hide();
                    }
                  }}
                >
                  下载字幕
                </Menu.Item>
              </Menu>
            }
          >
            <Typography.Link>
              更多操作&nbsp;
              <DownOutlined />
            </Typography.Link>
          </Dropdown>,
        ],
        search: false,
        width: 360,
      },
    ],
    [
      openDownloadMagnet,
      openEpisodeDetails,
      openSearchTorrent,
      reloadEpisodes,
      client,
      formRef,
    ],
  );
}

export default function Episodes() {
  const { episodes, formRef, syncEpisodes, reloadEpisodes } =
    useSeasonPageContext();

  const [downloadMagnetDialog, , openDownloadMagnet] =
    useManualDownloadMagnetDialog();
  const ref = useRef<ActionType>();
  const [episodeDetailsDiglog, , openEpisodeDetails] =
    useEpisodeDetailsDialog();
  const [searchTorrentDialog, , openSearchTorrent] = useSearchTorrentDialog();
  const columns = useColumns({
    openDownloadMagnet,
    openEpisodeDetails,
    openSearchTorrent,
  });

  const syncEpisodeProps = useAsyncButton(async () => {
    if (!formRef.current) {
      return;
    }
    if (formRef.current.isFieldsTouched(false)) {
      void message.info('有未保存的修改，请先保存再同步');
      return;
    }
    await syncEpisodes();
  });

  const refreshEpisodesProps = useAsyncButton(reloadEpisodes);

  return (
    <Section
      title="剧集列表"
      extra={[
        <div
          style={{
            display: 'flex',
          }}
          key={1}
        >
          上次同步时间：
          <FormDependency<FormValues> name={['episodesLastSync']}>
            {({ episodesLastSync }) =>
              episodesLastSync ? (
                dayjs(episodesLastSync).format('YYYY-MM-DD HH:mm:ss')
              ) : (
                <Typography.Text type="secondary">未同步</Typography.Text>
              )
            }
          </FormDependency>
        </div>,
        <Button type="primary" ghost {...syncEpisodeProps} key={0}>
          立即同步
        </Button>,
        <Button
          {...refreshEpisodesProps}
          key={2}
          icon={<ReloadOutlined />}
          type="default"
        >
          刷新
        </Button>,
      ]}
    >
      <FormDependency<FormValues> name={['episodesSource']}>
        {({ episodesSource }) =>
          episodesSource === MetadataSource.Manual ? (
            <Alert
              message="剧集数据来源为手动，无法自动同步。目前剧集数据无法前端修改，这部分数据将缺失"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <FormDependency<FormValues> name={['episodesSource', 'bangumiId']}>
        {({ episodesSource, bangumiId }) =>
          episodesSource === MetadataSource.BgmCn && !bangumiId ? (
            <Alert
              message="Bangumi关联信息未设置，无法从Bangumi同步剧集数据"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <FormDependency<FormValues>
        name={['episodesSource', 'tvdbId', 'tvdbSeason']}
      >
        {({ episodesSource, tvdbId, tvdbSeason }) =>
          episodesSource === MetadataSource.Skyhook &&
          (!tvdbId || typeof tvdbSeason !== 'number') ? (
            <Alert
              message="theTVDB关联信息不完整，无法从Skyhook同步剧集数据"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <ProFormSelect
        name="episodesSource"
        label="剧集数据来源"
        formItemProps={formItemProps}
        options={[
          {
            label: 'Bangumi（中文）',
            value: MetadataSource.BgmCn,
          },
          {
            label: 'Skyhook（英语）',
            value: MetadataSource.Skyhook,
          },
          {
            label: '手动',
            value: MetadataSource.Manual,
          },
        ]}
        width="sm"
      />
      <ProTable<Episode>
        columns={columns}
        dataSource={episodes}
        rowKey="id"
        pagination={false}
        toolBarRender={false}
        search={false}
        defaultSize="middle"
        actionRef={ref}
      />
      {downloadMagnetDialog}
      {episodeDetailsDiglog}
      {searchTorrentDialog}
    </Section>
  );
}
