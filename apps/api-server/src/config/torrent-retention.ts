import { bool, D, obj, opt, str, T } from '@lani/framework';

/** 明确单位，拒绝无单位数字、负数、零及超出安全整数范围的时长。 */
export function durationSeconds(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*(s|m|h|d|w)$/i.exec(value.trim());
  const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  const seconds = match
    ? Number(match[1]) * units[match[2].toLowerCase() as keyof typeof units]
    : NaN;
  if (!Number.isSafeInteger(seconds) || seconds <= 0)
    throw new Error('保留时长必须是正数并带 s、m、h、d 或 w 单位');
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
