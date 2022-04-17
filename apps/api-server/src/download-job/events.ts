import { Episode } from '@prisma/client';

export const EPISODE_PUBLISH_EVENT = 'EPISODE_PUBLISH_EVENT';

export class EpisodePublishEvent {
  constructor(public readonly episode: Episode) {}
}
