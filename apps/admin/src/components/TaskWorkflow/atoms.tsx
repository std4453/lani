import { ReactNode } from 'react';
import { AtomType } from '@lani/download-workflow';
import { TaskDetailsFieldsFragment as Job } from '@/generated/types';
import Field from './Field';
import DownloadProgress from './DownloadProgress';
export const atomViews: Record<
  AtomType,
  {
    fields(job: Job, enabled: boolean): ReactNode;
    cancelling?(job: Job): ReactNode;
  }
> = {
  submitDownload: {
    fields: (job) => (
      <>
        <Field label="种子 Hash">{job.qbtTorrentHash}</Field>
        <Field label="种子名称">{job.torrentTitle}</Field>
      </>
    ),
  },
  download: {
    fields: (job, enabled) => (
      <>
        <Field label="下载文件根路径">{job.downloadPath}</Field>
        <DownloadProgress id={job.id} enabled={enabled} />
      </>
    ),
  },
  findVideoFile: {
    fields: (job) => <Field label="视频文件路径">{job.importPath}</Field>,
  },
  importFile: {
    fields: (job) => <Field label="导入文件路径">{job.filePath}</Field>,
  },
  writeMetadata: {
    fields: (job) => <Field label="元数据路径">{job.nfoPath}</Field>,
  },
  refreshPlayer: {
    fields: (job) => (
      <Field label="Jellyfin 剧集 ID">{job.jellyfinEpisodeId}</Field>
    ),
  },
};
