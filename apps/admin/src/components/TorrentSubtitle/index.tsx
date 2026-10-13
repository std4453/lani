import { Tooltip } from 'antd';
import type { SubtitleInfo } from '@lani/parse-torrent-title';

export default function TorrentSubtitle({
  info,
}: {
  info?: SubtitleInfo | null;
}) {
  if (!info) return <>-</>;
  const languages = info.languages ?? [];
  const known = ['zh-Hans', 'zh-Hant', 'ja'].filter((language) =>
    languages.includes(language),
  );
  const names: Record<string, string> =
    known.length === 1
      ? { 'zh-Hans': '简体', 'zh-Hant': '繁体', ja: '日语' }
      : { 'zh-Hans': '简', 'zh-Hant': '繁', ja: '日' };
  const delivery: Record<string, string> = {
    'burned-in': '内嵌',
    muxed: '内封',
    external: '外挂',
  };
  const text = known.length
    ? known.map((language) => names[language]).join('') +
      (info.delivery ?? [])
        .map((kind) => delivery[kind])
        .filter(Boolean)
        .join('、')
    : '多字幕';
  return languages.length ? (
    <Tooltip title={languages.join('、')}>
      <span>{text}</span>
    </Tooltip>
  ) : (
    <>{text}</>
  );
}
