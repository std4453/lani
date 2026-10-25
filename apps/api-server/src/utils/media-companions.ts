import fs from 'fs/promises';
import path from 'path';
import { VIDEO_FILE_MATCHER } from './video-file';

export const SUBTITLE = /\.(?:srt|ass|ssa|sub|idx|vtt)$/i;
/** 字幕归属同目录中唯一的最长视频 stem；同名不同格式有歧义时跳过。 */
export async function companions(video: string) {
  const directory = path.dirname(video);
  const names = (await fs.readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  const videos = names
    .filter((name) => VIDEO_FILE_MATCHER.test(name))
    .map((name) => ({
      name,
      stem: path.basename(name, path.extname(name)),
    }));
  return names
    .filter((name) => {
      if (!SUBTITLE.test(name)) return false;
      const matches = videos
        .filter(({ stem }) => name.startsWith(`${stem}.`))
        .sort((a, b) => b.stem.length - a.stem.length);
      return (
        matches[0]?.name === path.basename(video) &&
        matches[0].stem.length !== matches[1]?.stem.length
      );
    })
    .sort()
    .map((name) => path.join(directory, name));
}
