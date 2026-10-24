import path from 'path';
import {
  getSeasonDirectory,
  resolveSeasonPath,
} from '@/utils/season-directory';
import { mapPath } from '@/utils/path';
import config from '@/config';
import { SeasonWithJellyfinFolder } from '@/types/entities';

/** 版本只描述季度内布局，禁止任何跨目录或平台相关的路径解释。 */
export function relativeMediaPath(value: string): string {
  if (
    !value ||
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value.includes('\\') ||
    value.includes('\0') ||
    /^[A-Za-z]:/.test(value) ||
    value.split('/').some((part) => !part || part === '.' || part === '..')
  )
    throw new Error('版本文件路径必须是季度目录内的相对路径');
  return value;
}

export function mediaTarget(root: string, relative: string): string {
  return resolveSeasonPath(root, relativeMediaPath(relative));
}

export function seasonMediaRoot(season: SeasonWithJellyfinFolder): string {
  return resolveSeasonPath(
    mapPath(config.jellyfin.pathMapping, season.jellyfinFolder.location),
    getSeasonDirectory(season),
  );
}
