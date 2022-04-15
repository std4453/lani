import { DownloadStatus, EpisodeStatusFieldsFragment } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { Tag, TagProps } from 'antd';
import dayjs from 'dayjs';

export type EpisodeStatus =
  | DownloadStatus
  | 'DOWNLOAD_FAILED'
  | 'NOT_AIRED'
  | 'DATE_UNKNOWN'
  | 'RESOURCE_WAITING';

export function calcEpisodeStatus(
  episode: EpisodeStatusFieldsFragment,
): EpisodeStatus {
  const job = extractNode(episode.jobs)?.[0];
  if (job) {
    if (job.isFailed) {
      return 'DOWNLOAD_FAILED';
    }
    return job.status;
  } else {
    if (episode.airTime) {
      if (dayjs(episode.airTime).isBefore(dayjs())) {
        return 'RESOURCE_WAITING';
      } else {
        return 'NOT_AIRED';
      }
    } else {
      return 'DATE_UNKNOWN';
    }
  }
}

export const downloadStatusMap: Partial<Record<EpisodeStatus, TagProps>> = {
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
  DATE_UNKNOWN: {
    children: '日期未知',
  },
};

export function DownloadStatusTag({ status }: { status: EpisodeStatus }) {
  return downloadStatusMap[status] ? (
    <Tag {...downloadStatusMap[status]} />
  ) : (
    <Tag color="red">未知状态</Tag>
  );
}
