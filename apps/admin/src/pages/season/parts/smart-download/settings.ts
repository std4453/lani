import { defaultSettings, SmartDownloadSettings } from '@lani/smart-download';
import type { FormValues } from '../../help';

export const subtitleLabels = {
  chinese: '中文字幕',
  'chinese-or-english': '中英字幕',
  any: '任意',
};
export type DownloadSettings = Pick<
  FormValues,
  | 'smartDownloadEnabled'
  | 'smartDownloadSubtitle'
  | 'smartDownloadPreferBaha'
  | 'smartDownloadWindowHours'
  | 'smartDownloadTimeoutMinutes'
  | 'downloadOffsetType'
  | 'downloadOffsetDays'
  | 'downloadOffsetHours'
>;
export const settingNames: (keyof DownloadSettings)[] = [
  'smartDownloadEnabled',
  'smartDownloadSubtitle',
  'smartDownloadPreferBaha',
  'smartDownloadWindowHours',
  'smartDownloadTimeoutMinutes',
  'downloadOffsetType',
  'downloadOffsetDays',
  'downloadOffsetHours',
];
export function toSettings(value: DownloadSettings): SmartDownloadSettings {
  return {
    subtitle: value.smartDownloadSubtitle ?? defaultSettings.subtitle,
    preferBaha: value.smartDownloadPreferBaha ?? false,
    windowHours: value.smartDownloadWindowHours ?? 48,
    timeoutMinutes: value.smartDownloadTimeoutMinutes ?? null,
  };
}
export function offsetHours(value: DownloadSettings) {
  return (
    (value.downloadOffsetType === 'advance' ? 1 : -1) *
    ((value.downloadOffsetDays || 0) * 24 + (value.downloadOffsetHours || 0))
  );
}
export function describeSettings(value: DownloadSettings) {
  const settings = toSettings(value);
  const offset = offsetHours(value);
  return [
    `字幕要求：${subtitleLabels[settings.subtitle]}`,
    ...(settings.preferBaha ? ['Baha 优先'] : []),
    `下载窗口：剧集发布后 ${settings.windowHours} 小时`,
    settings.timeoutMinutes
      ? `下载超时：${settings.timeoutMinutes} 分钟`
      : '无下载超时',
    ...(offset
      ? [`下载时间：${offset > 0 ? '提前' : '延后'} ${Math.abs(offset)} 小时`]
      : []),
  ].join('；');
}
