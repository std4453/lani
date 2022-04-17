import { Episode, Image, JellyfinFolder, Season } from '@prisma/client';

export type OnEpisodePublishEpisode = Episode & {
  season: Season & {
    jellyfinFolder: JellyfinFolder | null;
    posterImage: Image | null;
  };
};

export abstract class UserNotificationProvider {
  abstract onEpisodePublish(episode: OnEpisodePublishEpisode): Promise<void>;
}
