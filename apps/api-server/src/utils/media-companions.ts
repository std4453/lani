import fs from 'fs/promises';
import path from 'path';

export const SUBTITLE = /\.(?:srt|ass|ssa|sub|idx|vtt)$/i;
/** 仅选取视频完整 stem 下的附属字幕，不跨视频猜测归属。 */
export async function companions(video: string) {
  const stem = path.basename(video, path.extname(video));
  return (await fs.readdir(path.dirname(video)))
    .filter((name) => SUBTITLE.test(name) && name.startsWith(`${stem}.`))
    .sort()
    .map((name) => path.join(path.dirname(video), name));
}
