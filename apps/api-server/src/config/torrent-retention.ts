import { bool, D, obj, opt, str, T } from '@lani/framework';

/** 明确单位，拒绝无单位数字、负数、零及超出安全整数范围的时长。 */
export function durationSeconds(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*(s|m|h|d|w)$/i.exec(value.trim());
  const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
  if (!match) throw new Error('保留时长必须带 s、m、h、d 或 w 单位');
  // 按十进制整数换算，避免 1.1h 的浮点误差，也不舍入真正的小数秒。
  const [whole, fraction = ''] = match[1].split('.');
  const scale = BigInt(10) ** BigInt(fraction.length);
  const scaled =
    BigInt(whole + fraction) *
    BigInt(units[match[2].toLowerCase() as keyof typeof units]);
  const seconds = scaled % scale === BigInt(0) ? Number(scaled / scale) : NaN;
  if (!Number.isSafeInteger(seconds) || seconds <= 0)
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
