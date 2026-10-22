import { bool, D, obj, opt, str, T } from '@lani/framework';

import parseDuration from 'parse-duration';

/** 使用 parse-duration 换算，保留正整数秒和安全数值范围约束。 */
export function durationSeconds(value: string): number {
  if (value.length > 100 || !/[a-zμ]/i.test(value))
    throw new Error('保留时长必须带时间单位且不超过 100 个字符');
  const milliseconds = parseDuration(value);
  const raw = milliseconds === null ? NaN : milliseconds / 1000;
  const seconds = Math.round(raw);
  // 库使用浮点换算，仅容许一个机器精度的误差（例如 1.1h）。
  if (
    !Number.isSafeInteger(Math.round(milliseconds ?? NaN)) ||
    !Number.isSafeInteger(seconds) ||
    Math.abs(raw - seconds) > Number.EPSILON * Math.abs(raw) ||
    seconds <= 0
  )
    throw new Error('保留时长必须能换算为正的安全整数秒');
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
