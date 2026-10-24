import { taskImportEntries } from '@/utils/task-episodes';
import { ReactNode } from 'react';
import { Tooltip, Typography } from 'antd';
import { TaskType } from '@/generated/types';
import { AtomType } from '@lani/workflow';
import { TaskDetailsFieldsFragment as Task } from '@/generated/types';
import Field from './Field';
import DownloadProgress from './DownloadProgress';
import styles from './index.module.less';
function Paths({
  task,
  field,
  label,
}: {
  task: Task;
  field: 'importPath' | 'filePath' | 'nfoPath';
  label: string;
}) {
  if (![TaskType.BatchImport, TaskType.BatchDownload].includes(task.type))
    return <Field label={label}>{task[field]}</Field>;
  const paths = taskImportEntries(task).flatMap((entry) =>
    entry?.[field] ? [entry[field]!] : [],
  );
  const text = paths.join('\n');
  return (
    <Field label={label}>
      <Typography.Text copyable={text ? { text } : false}>
        <Tooltip
          overlayClassName={styles.pathsTooltip}
          title={paths.map((path, index) => (
            <div key={index}>{path}</div>
          ))}
        >
          <span>{paths.length} 个文件</span>
        </Tooltip>
      </Typography.Text>
    </Field>
  );
}
export const atomViews: Record<
  AtomType,
  {
    fields: ((task: Task, enabled: boolean) => ReactNode) | null;
    cancelling?(task: Task): ReactNode;
  }
> = {
  submitDownload: {
    fields: (task) => (
      <>
        <Field label="种子 Hash">{task.qbtTorrentHash}</Field>
        <Field label="种子名称">{task.torrentTitle}</Field>
      </>
    ),
  },
  download: {
    fields: (task, enabled) => (
      <>
        <Field label="下载文件根路径">{task.downloadPath}</Field>
        <DownloadProgress id={task.id} enabled={enabled} />
      </>
    ),
  },
  findImportFiles: {
    fields: (task) => (
      <Paths task={task} field="importPath" label="视频文件路径" />
    ),
  },
  findVideoFile: {
    fields: (task) => (
      <Paths task={task} field="importPath" label="视频文件路径" />
    ),
  },
  importFile: {
    fields: (task) => (
      <Paths task={task} field="filePath" label="导入文件路径" />
    ),
  },
  writeMetadata: {
    fields: (task) => <Paths task={task} field="nfoPath" label="元数据路径" />,
  },
  publishEpisode: { fields: null },
  refreshPlayer: {
    fields: (task) =>
      [TaskType.BatchImport, TaskType.BatchDownload].includes(task.type) ? (
        <Field label="Jellyfin 季度 ID">
          {
            task.taskEpisodesByTaskId?.nodes.find(
              (entry) => entry?.episodeByEpisodeId?.seasonBySeasonId,
            )?.episodeByEpisodeId?.seasonBySeasonId?.jellyfinId
          }
        </Field>
      ) : (
        <Field label="Jellyfin 剧集 ID">{task.jellyfinEpisodeId}</Field>
      ),
  },
};
