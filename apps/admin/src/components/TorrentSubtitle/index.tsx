import { Tooltip } from 'antd';
import type { SubtitleInfo } from '@lani/parse-torrent-title';

export default function TorrentSubtitle({
  info,
}: {
  info?: SubtitleInfo | null;
}) {
  if (!info) return <>-</>;
  const languages = info.languages ?? [];
  const known = ['zh-Hans', 'zh-Hant', 'zh', 'ja'].filter((language) =>
    languages.includes(language),
  );
  const names: Record<string, string> =
    known.length === 1
      ? { 'zh-Hans': '简体', 'zh-Hant': '繁体', zh: '中文', ja: '日语' }
      : { 'zh-Hans': '简', 'zh-Hant': '繁', zh: '中', ja: '日' };
  const delivery: Record<string, string> = {
    'burned-in': '内嵌',
    muxed: '内封',
    external: '外挂',
  };
  const deliveryText = (info.delivery ?? [])
    .map((kind) => delivery[kind])
    .filter(Boolean)
    .join('、');
  const text = known.length
    ? known.map((language) => names[language]).join('') +
      (deliveryText || (known.length === 1 && known[0] === 'zh' ? '字幕' : ''))
    : '其他字幕';
  const languageNames: Record<string, string> = {
    'zh-Hans': '简体中文',
    'zh-Hant': '繁体中文',
    zh: '中文',
    ja: '日语',
    en: '英语',
    ko: '韩语',
  };
  return languages.length ? (
    <Tooltip
      title={languages
        .map((language) => languageNames[language] ?? language)
        .join('、')}
    >
      <span>{text}</span>
    </Tooltip>
  ) : (
    <>{text}</>
  );
}
