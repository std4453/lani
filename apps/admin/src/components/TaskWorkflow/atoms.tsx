import { ReactNode } from 'react';
import { AtomType } from '@lani/workflow';
import { TaskDetailsFieldsFragment as Task } from '@/generated/types';
import Field from './Field';
import DownloadProgress from './DownloadProgress';
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
  findVideoFile: {
    fields: (task) => <Field label="视频文件路径">{task.importPath}</Field>,
  },
  importFile: {
    fields: (task) => <Field label="导入文件路径">{task.filePath}</Field>,
  },
  writeMetadata: {
    fields: (task) => <Field label="元数据路径">{task.nfoPath}</Field>,
  },
  publishEpisode: { fields: null },
  refreshPlayer: {
    fields: (task) => (
      <Field label="Jellyfin 剧集 ID">{task.jellyfinEpisodeId}</Field>
    ),
  },
};
