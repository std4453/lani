import { parseWorkflow } from '@lani/workflow';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import {
  LegacyTaskStage,
  EpisodeStatusFieldsFragment,
  TaskType,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { SelectOutlined } from '@ant-design/icons';
import { Tag, TagProps } from 'antd';
import dayjs from 'dayjs';

export type EpisodeStatus =
  | LegacyTaskStage
  | 'DOWNLOAD_FAILED'
  | 'CANCELLED'
  | 'CANCELLING'
  | 'NOT_AIRED'
  | 'DATE_UNKNOWN'
  | 'RESOURCE_WAITING'
  | 'RESOURCE_MISSING';

export function calcEpisodeStatus(episode: EpisodeStatusFieldsFragment): {
  status: EpisodeStatus;
  taskId?: number;
} {
  const task = extractNode(episode.tasks)?.[0];
  if (episode.jellyfinEpisodeId) {
    return { status: LegacyTaskStage.Available };
  } else if (task) {
    if (task.isCancelled) return { status: 'CANCELLED', taskId: task.id };
    if (task.workflow && parseWorkflow(task.workflow).status === 'cancelling')
      return { status: 'CANCELLING', taskId: task.id };
    if (
      task.isFailed ||
      (!task.workflow && task.legacyStage !== LegacyTaskStage.Available)
    ) {
      return { status: 'DOWNLOAD_FAILED', taskId: task.id };
    }
    return { status: task.legacyStage, taskId: task.id };
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
  [LegacyTaskStage.Available]: {
    children: '可用',
    color: 'green',
  },
  [LegacyTaskStage.Downloading]: {
    children: '下载中',
    color: 'blue',
  },
  [LegacyTaskStage.DownloadCompleted]: {
    children: '寻找文件',
    color: 'purple',
  },
  [LegacyTaskStage.Importing]: {
    children: '导入中',
    color: 'purple',
  },
  [LegacyTaskStage.PlayerWaiting]: {
    children: '等待识别',
    color: 'cyan',
  },
  [LegacyTaskStage.WritingMetadata]: {
    children: '写入元数据',
    color: 'purple',
  },
  [LegacyTaskStage.DownloadSubmitting]: {
    children: '提交下载',
    color: 'blue',
  },
  CANCELLED: { children: '已取消' },
  CANCELLING: { children: '取消中', color: 'orange' },
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
  taskId,
  openTaskDetails,
}: {
  status: EpisodeStatus;
  taskId?: number;
  openTaskDetails?: ReturnType<typeof useTaskDetailsDialog>[2];
}) {
  const tagProps = downloadStatusMap[status];
  if (tagProps) {
    const { children, color } = tagProps;
    // 可用状态隐藏按钮
    const showDialog = taskId && status !== LegacyTaskStage.Available;
    return (
      <Tag
        color={color}
        style={{
          cursor: showDialog ? 'pointer' : 'unset',
        }}
        onClick={() => {
          if (showDialog) {
            void openTaskDetails?.({
              taskId,
              taskType: TaskType.Download,
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
