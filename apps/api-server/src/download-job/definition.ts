import { AtomType, StepDefinition } from '@lani/download-workflow';
import { DownloadStatus } from '@lani/db';
export const legacyStatus: Record<AtomType, DownloadStatus> = {
  submitDownload: DownloadStatus.DOWNLOAD_SUBMITTING,
  download: DownloadStatus.DOWNLOADING,
  findVideoFile: DownloadStatus.DOWNLOAD_COMPLETED,
  importFile: DownloadStatus.IMPORTING,
  writeMetadata: DownloadStatus.WRITING_METADATA,
  refreshPlayer: DownloadStatus.PLAYER_WAITING,
};
/** 这是当前下载业务的一个流程定义，执行器不依赖其数量或顺序。 */
export const downloadDefinition: StepDefinition[] = [
  { id: 'submit', atom: 'submitDownload', title: '提交下载' },
  { id: 'download', atom: 'download', title: '下载中' },
  { id: 'find', atom: 'findVideoFile', title: '寻找视频文件' },
  { id: 'import', atom: 'importFile', title: '导入文件' },
  { id: 'metadata', atom: 'writeMetadata', title: '写入元数据' },
  { id: 'player', atom: 'refreshPlayer', title: '刷新 Jellyfin' },
];
