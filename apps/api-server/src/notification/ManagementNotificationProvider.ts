import { Task, Episode, Season } from '@lani/db';

export type OnEpisodesMissingEpisode = Episode & {
  season: Season;
  tasks: Task[];
};

export abstract class ManagementNotificationProvider {
  abstract onEpisodesMissing(
    episodes: OnEpisodesMissingEpisode[],
  ): Promise<void>;
}
