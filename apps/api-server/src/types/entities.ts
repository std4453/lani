import { Image, JellyfinFolder, Season } from '@lani/db';

export type SeasonWithJellyfinFolder = Season & {
  jellyfinFolder: JellyfinFolder;
};

export type SeasonWithFolderAndImages = Season & {
  jellyfinFolder: JellyfinFolder;
  bannerImage: Image | null;
  fanartImage: Image | null;
  posterImage: Image | null;
};
