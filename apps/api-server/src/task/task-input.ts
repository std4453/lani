import { Task } from '@lani/db';
import { batchImportEntries } from '@lani/workflow';

/** 通知、字幕等业务读取指定剧集产物，不赋予关联表执行语义。 */
export function taskEpisodeOutput(task: Task, episodeId: number) {
  return task.type === 'BATCH_IMPORT'
    ? batchImportEntries(task.batchEntries).find(
        (entry) => entry.episodeId === episodeId,
      )
    : task;
}
