import { Image, Season } from '@lani/db';

export const SEASON_SAVE_EVENT = 'SEASON_SAVE_EVENT';

export type OnSeasonSaveSeason = Season & {
  posterImage: Image | null;
};

export class SeasonSaveEvent {
  constructor(public readonly season: OnSeasonSaveSeason) {}
}
