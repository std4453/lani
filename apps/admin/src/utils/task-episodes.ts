import { batchImportEntries } from '@lani/workflow';
import { TaskDetailsFieldsFragment } from '@/generated/types';
import { TaskType } from '@/generated/types';
import { formatNumbering, EpisodeNumbering } from './episode';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  [TaskType.Download]: '下载',
  [TaskType.Import]: '导入',
  [TaskType.BatchImport]: '批量导入',
};

/** 只合并连续普通整数；特别篇和小数编号保持各自命名空间。 */
export function episodeRange(
  episodes: Array<{ numbering?: EpisodeNumbering | null }>,
): string {
  const integers = [
    ...new Set(
      episodes.flatMap((e) =>
        e.numbering?.type === 'episode' &&
        e.numbering.number !== null &&
        Number.isInteger(Number(e.numbering.number))
          ? [Number(e.numbering.number)]
          : [],
      ),
    ),
  ].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < integers.length; i++) {
    const start = integers[i];
    let end = start;
    while (integers[i + 1] === end + 1) end = integers[++i];
    parts.push(start === end ? `${start}` : `${start}-${end}`);
  }
  const extra = episodes.filter(
    (e) =>
      !(
        e.numbering?.type === 'episode' &&
        e.numbering.number !== null &&
        Number.isInteger(Number(e.numbering.number))
      ),
  );
  parts.push(...extra.map((e) => formatNumbering(e.numbering)));
  return parts.length ? `#${parts.join(',')}` : '-';
}

export function taskEpisodesLabel(task: {
  taskEpisodesByTaskId?: {
    nodes: Array<{
      episodeByEpisodeId?: { numbering?: EpisodeNumbering | null } | null;
    } | null>;
  } | null;
}): string {
  return episodeRange(
    (task.taskEpisodesByTaskId?.nodes ?? []).flatMap((e) =>
      e?.episodeByEpisodeId ? [e.episodeByEpisodeId] : [],
    ),
  );
}

export function commonDirectory(paths: string[]): string {
  if (!paths.length) return '/';
  const segments = paths.map((p) => p.split('/').slice(0, -1));
  const common = segments[0].filter((segment, i) =>
    segments.every(
      (parts) =>
        parts.slice(0, i + 1).join('/') ===
        segments[0].slice(0, i + 1).join('/'),
    ),
  );
  return common.join('/') || '/';
}

/** 输入顺序来自 Task，关联表只补充当前仍存在的剧集信息。 */
export function taskImportEntries(task?: TaskDetailsFieldsFragment | null) {
  const episodes = new Map(
    (task?.taskEpisodesByTaskId?.nodes ?? []).flatMap((entry) =>
      entry ? [[entry.episodeId, entry.episodeByEpisodeId] as const] : [],
    ),
  );
  return batchImportEntries(task?.batchEntries).map((entry) => ({
    ...entry,
    episodeByEpisodeId: episodes.get(entry.episodeId),
  }));
}
