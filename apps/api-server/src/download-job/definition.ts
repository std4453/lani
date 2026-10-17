import { StepDefinition } from '@lani/workflow';
/** 这是当前下载业务的一个流程定义，执行器不依赖其数量或顺序。 */
export const downloadDefinition: StepDefinition[] = [
  { id: 'submit', atom: 'submitDownload', title: '提交下载' },
  { id: 'download', atom: 'download', title: '下载中' },
  { id: 'find', atom: 'findVideoFile', title: '寻找视频文件' },
  { id: 'import', atom: 'importFile', title: '导入文件' },
  { id: 'metadata', atom: 'writeMetadata', title: '写入元数据' },
  { id: 'player', atom: 'refreshPlayer', title: '刷新 Jellyfin' },
  { id: 'publish', atom: 'publishEpisode', title: '完成' },
];
