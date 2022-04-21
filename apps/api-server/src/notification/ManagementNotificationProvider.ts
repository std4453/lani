import { DownloadJob, Episode, Season } from '@prisma/client';

export type OnEpisodesMissingEpisode = Episode & {
  season: Season;
  downloadJobs: DownloadJob[];
};

export abstract class ManagementNotificationProvider {
  abstract onEpisodesMissing(
    episodes: OnEpisodesMissingEpisode[],
  ): Promise<void>;
}
