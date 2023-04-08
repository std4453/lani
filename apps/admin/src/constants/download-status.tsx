import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import { DownloadStatus, EpisodeStatusFieldsFragment } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { SelectOutlined } from '@ant-design/icons';
import { Tag, TagProps } from 'antd';
import dayjs from 'dayjs';

export type EpisodeStatus =
  | DownloadStatus
  | 'DOWNLOAD_FAILED'
  | 'NOT_AIRED'
  | 'DATE_UNKNOWN'
  | 'RESOURCE_WAITING'
  | 'RESOURCE_MISSING';

export function calcEpisodeStatus(episode: EpisodeStatusFieldsFragment): {
  status: EpisodeStatus;
  jobId?: number;
} {
  const job = extractNode(episode.jobs)?.[0];
  if (job) {
    if (job.isFailed) {
      return { status: 'DOWNLOAD_FAILED', jobId: job.id };
    }
    return { status: job.status, jobId: job.id };
  } else {
    if (episode.airTime) {
      const now = dayjs();
      const startDownloadTime = dayjs(episode.airTime);
      const resourceMissingTime = startDownloadTime.add(12, 'h');
      if (startDownloadTime.isBefore(now)) {
        if (now.isBefore(resourceMissingTime)) {
          return { status: 'RESOURCE_WAITING' };
        } else {
          return { status: 'RESOURCE_MISSING' };
        }
      } else {
        return { status: 'NOT_AIRED' };
      }
    } else {
      return { status: 'DATE_UNKNOWN' };
    }
  }
}

export const downloadStatusMap: Partial<
  Record<EpisodeStatus, Pick<TagProps, 'children' | 'color'>>
> = {
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
  [DownloadStatus.DownloadSubmitting]: {
    children: '提交下载',
    color: 'blue',
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
  RESOURCE_MISSING: {
    children: '缺集',
    color: 'red',
  },
  DATE_UNKNOWN: {
    children: '日期未知',
  },
};

export function DownloadStatusTag({
  status,
  episodeId,
  jobId,
  openEpisodeDetails,
}: {
  status: EpisodeStatus;
  episodeId?: number;
  jobId?: number;
  openEpisodeDetails?: ReturnType<typeof useEpisodeDetailsDialog>[2];
}) {
  const tagProps = downloadStatusMap[status];
  if (tagProps) {
    const { children, color } = tagProps;
    // 可用状态隐藏按钮
    const showDialog =
      episodeId && jobId && status !== DownloadStatus.Available;
    return (
      <Tag
        color={color}
        style={{
          cursor: showDialog ? 'pointer' : 'unset',
        }}
        onClick={() => {
          if (showDialog) {
            void openEpisodeDetails?.({
              episodeId,
              jobId,
            });
          }
        }}
        icon={showDialog ? <SelectOutlined /> : null}
      >
        {children}
      </Tag>
    );
  } else {
    return <Tag color="red">未知状态</Tag>;
  }
}
