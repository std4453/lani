import { Task, TaskEpisode } from '@lani/db';
import { TaskInput } from './atom';

export function taskInput(task: Task & { episodes: TaskEpisode[] }): TaskInput {
  const first = task.episodes[0];
  return {
    ...task,
    episodeId: first?.episodeId ?? null,
    importPath: first?.importPath ?? null,
    filePath: first?.filePath ?? null,
    nfoPath: first?.nfoPath ?? null,
    jellyfinEpisodeId: first?.jellyfinEpisodeId ?? null,
  };
}
