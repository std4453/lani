import { bool, D, obj, opt, str, T } from '@lani/framework';

import parseDuration from 'parse-duration';

/** 使用 parse-duration 的解析语义，统一换算为正秒数。 */
export function durationSeconds(value: string): number {
  const seconds = parseDuration(value, 's');
  if (seconds === null || !(seconds > 0)) throw new Error('保留时长必须大于零');
  return seconds;
}

const duration = () =>
  str().custom((value, helpers) => {
    try {
      durationSeconds(value);
      return value;
    } catch {
      return helpers.error('any.invalid');
    }
  }) as D<string>;

export const torrentRetentionConfig = opt(
  obj({
    enabled: opt(bool(), false),
    afterFinish: opt(duration(), '7d'),
    afterSeeding: opt(duration(), '30d'),
  }),
  { enabled: false, afterFinish: '7d', afterSeeding: '30d' },
);

export type TorrentRetentionConfig = T<typeof torrentRetentionConfig>;
