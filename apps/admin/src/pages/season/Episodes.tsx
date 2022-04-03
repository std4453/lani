import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import FormDependency from '@/components/FormDependency';
import { DownloadStatus, MetadataSource } from '@/generated/types';
import {
  Episode,
  ExtendedDownloadStatus,
  formItemProps,
  FormValues,
} from '@/pages/season/help';
import { useManualDownloadMagnetDialog } from '@/pages/season/ManualDownloadMagnetDialog';
import { DownOutlined } from '@ant-design/icons';
import { ProFormDependency, ProFormSelect } from '@ant-design/pro-form';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import {
  Alert,
  Divider,
  Dropdown,
  Menu,
  Tag,
  TagProps,
  Typography,
} from 'antd';
import { useMemo, useRef } from 'react';
import styles from './Episodes.module.less';

const downloadStatusMap: Partial<Record<ExtendedDownloadStatus, TagProps>> = {
  [DownloadStatus.Available]: {
    children: '可用',
    color: 'green',
  },
  [DownloadStatus.Downloading]: {
    children: '下载中',
    color: 'blue',
  },
  [DownloadStatus.DownloadCompleted]: {
    children: '寻找文件',
    color: 'purple',
  },
  [DownloadStatus.Importing]: {
    children: '导入中',
    color: 'purple',
  },
  [DownloadStatus.PlayerWaiting]: {
    children: '等待识别',
    color: 'cyan',
  },
  [DownloadStatus.WritingMetadata]: {
    children: '写入元数据',
    color: 'purple',
  },
  NOT_AIRED: {
    children: '未放送',
  },
  DOWNLOAD_FAILED: {
    children: '下载失败',
    color: 'red',
  },
  RESOURCE_WAITING: {
    children: '等待资源',
    color: 'gold',
  },
  DATE_UNKNOWN: {
    children: '日期未知',
  },
};

function useColumns({
  openDownloadMagnet,
  openEpisodeDetails,
}: {
  openEpisodeDetails: ReturnType<typeof useEpisodeDetailsDialog>[2];
  openDownloadMagnet: ReturnType<typeof useManualDownloadMagnetDialog>[2];
}) {
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
        render: (_, r) =>
          downloadStatusMap[r.jobStatus] ? (
            <Tag {...downloadStatusMap[r.jobStatus]} />
          ) : (
            <Tag color="red">未知状态</Tag>
          ),
      },
      {
        title: 'Jellyfin',
        dataIndex: 'jellyfinEpisodeId',
        render: (_, r) =>
          r.jellyfinEpisodeId ? (
            <Typography.Link
              key={0}
              href={`https://jellyfin.std4453.com:444/web/index.html#!/details?serverId=510e48488c4e4a6b981894df79711cdc&id=${r.jellyfinEpisodeId}`}
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
                <Menu.Item disabled>搜索种子</Menu.Item>
                <Menu.Item
                  onClick={() => {
                    void openDownloadMagnet({ episodeId: r.id });
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
        ],
        search: false,
        width: 300,
      },
    ],
    [],
  );
}

export default function Episodes({ episodes }: { episodes: Episode[] }) {
  const [downloadMagnetDialog, , openDownloadMagnet] =
    useManualDownloadMagnetDialog();
  const ref = useRef<ActionType>();
  const [episodeDetailsDiglog, , openEpisodeDetails] =
    useEpisodeDetailsDialog();
  const columns = useColumns({ openDownloadMagnet, openEpisodeDetails });

  return (
    <div className={styles.root}>
      <Typography.Text>剧集列表</Typography.Text>
      <Divider className={styles.divider} />
      <FormDependency<FormValues> name={['episodesSource']}>
        {({ episodesSource }) =>
          episodesSource === MetadataSource.Manual ? (
            <Alert
              message="剧集数据来源为手动，无法自动同步。目前剧集数据无法前端修改，这部分数据将缺失"
              type="warning"
              showIcon
              className={styles.warning}
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
              className={styles.warning}
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
              className={styles.warning}
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
    </div>
  );
}
