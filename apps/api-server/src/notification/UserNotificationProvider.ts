import { Episode, Image, JellyfinFolder, Season } from '@lani/db';

export type OnEpisodePublishEpisode = Episode & {
  season: Season & {
    jellyfinFolder: JellyfinFolder | null;
    posterImage: Image | null;
  };
};

export abstract class UserNotificationProvider {
  abstract onEpisodePublish(episode: OnEpisodePublishEpisode): Promise<void>;
}
