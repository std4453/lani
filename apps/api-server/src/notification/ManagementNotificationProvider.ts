import { DownloadJob, Episode, Season } from '@lani/db';

export type OnEpisodesMissingEpisode = Episode & {
  season: Season;
  downloadJobs: DownloadJob[];
};

export abstract class ManagementNotificationProvider {
  abstract onEpisodesMissing(
    episodes: OnEpisodesMissingEpisode[],
  ): Promise<void>;
}
