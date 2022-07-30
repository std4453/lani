import { JellyfinFolder, Season } from '@lani/db';

export type SeasonWithJellyfinFolder = Season & {
  jellyfinFolder: JellyfinFolder;
};
