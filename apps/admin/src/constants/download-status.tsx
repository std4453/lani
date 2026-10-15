import { AtomType, currentStep, parseWorkflow } from '@lani/workflow';
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
  | AtomType
  | 'AVAILABLE'
  | 'UNKNOWN'
  | 'DOWNLOAD_FAILED'
  | 'CANCELLED'
  | 'CANCELLING'
  | 'NOT_AIRED'
  | 'DATE_UNKNOWN'
  | 'RESOURCE_WAITING'
  | 'RESOURCE_MISSING';

/** 旧任务保留的阶段只在这里转译，展示状态不再沿用数据库枚举。 */
export const LEGACY_EPISODE_STATUS: Record<LegacyTaskStage, EpisodeStatus> = {
  [LegacyTaskStage.Available]: 'AVAILABLE',
  [LegacyTaskStage.DownloadSubmitting]: 'submitDownload',
  [LegacyTaskStage.Downloading]: 'download',
  [LegacyTaskStage.DownloadCompleted]: 'findVideoFile',
  [LegacyTaskStage.Importing]: 'importFile',
  [LegacyTaskStage.WritingMetadata]: 'writeMetadata',
  [LegacyTaskStage.PlayerWaiting]: 'refreshPlayer',
  [LegacyTaskStage.Renaming]: 'UNKNOWN',
  [LegacyTaskStage.Unavailable]: 'UNKNOWN',
};

export function calcEpisodeStatus(episode: EpisodeStatusFieldsFragment): {
  status: EpisodeStatus;
  taskId?: number;
} {
  const task = extractNode(episode.tasks)?.[0];
  if (episode.jellyfinEpisodeId) {
    return { status: 'AVAILABLE' };
  } else if (task) {
    if (task.workflow) {
      const workflow = parseWorkflow(task.workflow);
      const status: EpisodeStatus =
        workflow.status === 'running'
          ? currentStep(workflow).atom
          : (
              {
                succeeded: 'AVAILABLE',
                failed: 'DOWNLOAD_FAILED',
                cancelled: 'CANCELLED',
                cancelling: 'CANCELLING',
              } as const
            )[workflow.status];
      return { status, taskId: task.id };
    }
    return {
      status: task.isCancelled
        ? 'CANCELLED'
        : task.isFailed || task.legacyStage !== LegacyTaskStage.Available
        ? 'DOWNLOAD_FAILED'
        : LEGACY_EPISODE_STATUS[task.legacyStage],
      taskId: task.id,
    };
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

export const EPISODE_STATUS_TAGS: Record<
  EpisodeStatus,
  Pick<TagProps, 'children' | 'color'>
> = {
  AVAILABLE: {
    children: '可用',
    color: 'green',
  },
  download: {
    children: '下载中',
    color: 'blue',
  },
  findVideoFile: {
    children: '寻找文件',
    color: 'purple',
  },
  importFile: {
    children: '导入中',
    color: 'purple',
  },
  refreshPlayer: {
    children: '等待识别',
    color: 'cyan',
  },
  writeMetadata: {
    children: '写入元数据',
    color: 'purple',
  },
  submitDownload: {
    children: '提交下载',
    color: 'blue',
  },
  publishEpisode: { children: '下载完成', color: 'green' },
  UNKNOWN: { children: '未知状态', color: 'red' },
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
  const tagProps = EPISODE_STATUS_TAGS[status];
  if (tagProps) {
    const { children, color } = tagProps;
    // 可用状态隐藏按钮
    const showDialog = taskId && status !== 'AVAILABLE';
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
