import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import FormDependency from '@/components/FormDependency';
import { useSearchTorrentDialog } from '@/components/SearchTorrentDialog';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import { jellyfinEpisodeLink } from '@/constants/link';
import {
  DownloadBilibiliCcDocument,
  DownloadTorrentForEpisodeDocument,
  GetEpisodesStatusDocument,
  MetadataSource,
  MockEpisodePublishDocument,
  TorrentFieldsFragment,
} from '@/generated/types';
import { useManualDownloadMagnetDialog } from '@/pages/season/components/manual-download-magnet-dialog';
import { useConfig } from '@/store/config';
import { handleError } from '@/utils/error';
import { extractNode } from '@/utils/graphql';
import { getSeasonKeyword } from '@/utils/season';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { useAsyncButton } from '@/utils/useAsyncButton';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ProFormSelect, ProFormSwitch } from '@ant-design/pro-form';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { useApolloClient, useQuery } from '@apollo/client';
import {
  Alert,
  Button,
  Dropdown,
  Menu,
  message,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { createContext, useContext, useMemo, useRef } from 'react';
import Section from '../../components/section';
import {
  Episode,
  EpisodeStatusFields,
  formItemProps,
  FormValues,
  useSeasonPageContext,
} from '../../help';
import styles from './index.module.less';

const EpisodesStatusContext = createContext<
  Record<number, EpisodeStatusFields> | undefined
>(undefined);

function EpisodeStatusTag({
  episode,
  openEpisodeDetails,
}: {
  episode: Episode;
  openEpisodeDetails: ReturnType<typeof useEpisodeDetailsDialog>[2];
}) {
  const episodesStatus = useContext(EpisodesStatusContext);
  const mergedEpisode = { ...episode, ...episodesStatus?.[episode.id] };

  return (
    <div>
      <DownloadStatusTag
        status={mergedEpisode.jobStatus}
        episodeId={mergedEpisode.id}
        jobId={mergedEpisode.jobId}
        openEpisodeDetails={openEpisodeDetails}
      />
    </div>
  );
}

function useColumns({
  openDownloadMagnet,
  openEpisodeDetails,
  openSearchTorrent,
}: {
  openEpisodeDetails: ReturnType<typeof useEpisodeDetailsDialog>[2];
  openDownloadMagnet: ReturnType<typeof useManualDownloadMagnetDialog>[2];
  openSearchTorrent: ReturnType<typeof useSearchTorrentDialog>[2];
}) {
  const { reloadEpisodes, formRef, id } = useSeasonPageContext();

  const config = useConfig();

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
        title: '原始放送时间',
        dataIndex: 'rawAirTime',
        width: 160,
        valueType: 'dateTime',
      },
      {
        title: '开始下载时间',
        dataIndex: 'airTime',
        width: 160,
        valueType: 'dateTime',
      },
      {
        title: '下载状态',
        dataIndex: 'jobStatus',
        width: 120,
        render: (_, r) => (
          <EpisodeStatusTag
            episode={r}
            openEpisodeDetails={openEpisodeDetails}
          />
        ),
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
                      seasonId: id,
                      useLocalSavedKeyword: true,
                      saveLocalKeyword: true,
                      seasonFullName: formRef.current?.getFieldValue('title'),
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
                        } catch (error) {
                          handleError(error, '下载任务创建失败');
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
                    } catch (error) {
                      handleError(error, '字幕下载失败');
                    } finally {
                      hide();
                    }
                  }}
                >
                  下载字幕
                </Menu.Item>
                {config?.env === 'dev' && (
                  <Menu.Item
                    onClick={async () => {
                      try {
                        await client.mutate({
                          mutation: MockEpisodePublishDocument,
                          variables: {
                            episodeId: r.id,
                          },
                        });
                        void message.success('模拟发布成功');
                      } catch (error) {
                        handleError(error, '模拟发布失败');
                      }
                    }}
                  >
                    模拟发布
                  </Menu.Item>
                )}
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
      id,
    ],
  );
}

function useEpisodeStatus(episodes: Episode[]) {
  const episodeIds = useMemo(
    () => episodes.map((episode) => episode.id),
    [episodes],
  );
  const { data, refetch, startPolling, stopPolling } = useQuery(
    GetEpisodesStatusDocument,
    {
      skip: !episodeIds.length,
      variables: {
        episodeIds,
      },
      pollInterval: 5000,
    },
  );
  useApolloPoll({ pollInterval: 5000, startPolling, stopPolling, refetch });
  return useMemo(() => {
    const episodesStatus = extractNode(data?.allEpisodes);
    if (!episodesStatus) {
      return undefined;
    }
    const episodesStatusMap: Record<number, EpisodeStatusFields> = {};
    for (const item of episodesStatus) {
      const { status, jobId } = calcEpisodeStatus(item);
      episodesStatusMap[item.id] = {
        jobStatus: status,
        jobId,
      };
    }
    return episodesStatusMap;
  }, [data]);
}

export default function Episodes() {
  const { episodes, formRef, syncEpisodes, episodesLastSync } =
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
  const episodesStatus = useEpisodeStatus(episodes);

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

  return (
    <Section
      title="剧集列表"
      extra={[
        <div
          style={{
            display: 'flex',
          }}
          key={3}
        >
          <div
            style={{
              marginRight: 8,
            }}
          >
            自动同步&nbsp;
            <Tooltip title="关闭后，将不会自动从数据源获取剧集信息。目前暂不支持手动编辑剧集信息，推荐仅在数据源存在严重问题时关闭">
              <InfoCircleOutlined />
            </Tooltip>
          </div>
          <ProFormSwitch name="episodesAutoSync" noStyle />
        </div>,
        <div
          style={{
            display: 'flex',
          }}
          key={1}
        >
          上次同步时间：
          {episodesLastSync ? (
            dayjs(episodesLastSync).format('YYYY-MM-DD HH:mm:ss')
          ) : (
            <Typography.Text type="secondary">未同步</Typography.Text>
          )}
        </div>,
        <Button type="primary" ghost {...syncEpisodeProps} key={0}>
          立即同步
        </Button>,
      ]}
      extraClassName={styles.extra}
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
      <EpisodesStatusContext.Provider value={episodesStatus}>
        <ProTable<Episode>
          columns={columns}
          dataSource={episodes}
          rowKey="id"
          pagination={false}
          toolBarRender={false}
          search={false}
          defaultSize="middle"
          actionRef={ref}
          className={styles.table}
        />
      </EpisodesStatusContext.Provider>
      {downloadMagnetDialog}
      {episodeDetailsDiglog}
      {searchTorrentDialog}
    </Section>
  );
}
