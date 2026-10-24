import { AtomType } from '@lani/workflow';
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
  | 'RUNNING'
  | 'AVAILABLE'
  | 'DOWNLOAD_FAILED'
  | 'CANCELLED'
  | 'CANCELLING'
  | 'UNKNOWN'
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

export const EPISODE_STATUS_TAGS: Record<
  EpisodeStatus,
  Pick<TagProps, 'children' | 'color'>
> = {
  RUNNING: { children: '进行中', color: 'blue' },
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
  findImportFiles: {
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
  publishEpisode: { children: '完成', color: 'green' },
  UNKNOWN: { children: '未知状态', color: 'red' },
  CANCELLED: { children: '已取消' },
  CANCELLING: { children: '取消中', color: 'orange' },
  NOT_AIRED: {
    children: '未放送',
  },
  DOWNLOAD_FAILED: {
    children: '任务失败',
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

export function calcEpisodeStatus(episode: EpisodeStatusFieldsFragment): {
  status: EpisodeStatus;
  taskId?: number;
  taskType?: TaskType;
  label?: string;
} {
  const task = extractNode(episode.tasks)?.[0];
  if (episode.jellyfinEpisodeId) {
    return { status: 'AVAILABLE' };
  } else if (task) {
    const summary = task.statusSummary;
    const workflow = summary?.workflow;
    const step = workflow?.steps.find(
      ({ id }) => id === workflow.currentStepId,
    );
    let status: EpisodeStatus = 'UNKNOWN';
    let label: string | undefined;
    if (workflow) {
      if (workflow.status === 'running') {
        // 步骤标题来自流程快照；未知 atom 仍可显示，颜色回退为进行中。
        status =
          step &&
          Object.prototype.hasOwnProperty.call(EPISODE_STATUS_TAGS, step.atom)
            ? (step.atom as EpisodeStatus)
            : 'RUNNING';
        label = step?.title;
      } else {
        status =
          (
            {
              succeeded: 'AVAILABLE',
              failed: 'DOWNLOAD_FAILED',
              cancelled: 'CANCELLED',
              cancelling: 'CANCELLING',
            } as Record<string, EpisodeStatus>
          )[workflow.status] ?? 'UNKNOWN';
        if (step && status === 'UNKNOWN')
          label = `${step.title} · ${EPISODE_STATUS_TAGS[status].children}`;
      }
    } else if (summary?.legacy) {
      const legacy = summary.legacy;
      status = legacy.isCancelled
        ? 'CANCELLED'
        : legacy.isFailed || legacy.stage !== LegacyTaskStage.Available
        ? 'DOWNLOAD_FAILED'
        : 'AVAILABLE';
    }
    return { status, label, taskId: task.id, taskType: task.type };
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

export function DownloadStatusTag({
  status,
  taskId,
  taskType,
  openTaskDetails,
  label,
}: {
  status: EpisodeStatus;
  label?: string;
  taskId?: number;
  taskType?: TaskType;
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
              taskType: taskType ?? TaskType.Download,
            });
          }
        }}
        icon={showDialog ? <SelectOutlined /> : null}
      >
        {['DOWNLOAD_FAILED', 'CANCELLING', 'CANCELLED'].includes(status)
          ? children
          : label ?? children}
      </Tag>
    );
  } else {
    return <Tag color="red">未知状态</Tag>;
  }
}
