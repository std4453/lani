import type { TorrentFilter } from '@/generated/types';

const languages: Record<string, string[]> = {
  zh: ['zh', 'zh-Hans', 'zh-Hant'],
  ja: ['ja'],
  en: ['en'],
};

export function subtitleFilter(
  selected: string[] | null = [],
): TorrentFilter | undefined {
  if (!selected?.length) return undefined;
  const codes = [
    ...new Set(
      Object.entries(languages)
        .filter(([value]) => selected.includes(value))
        .flatMap(([, codes]) => codes),
    ),
  ];
  if (!codes.length) return undefined;

  // 与字幕展示口径一致：合并标题与已识别页面；只有未采用新版解析的记录使用旧标记。
  return {
    or: codes.flatMap((language): TorrentFilter[] => {
      const legacyField = {
        'zh-Hans': 'subtitleHasChs',
        'zh-Hant': 'subtitleHasCht',
        ja: 'subtitleHasJp',
      }[language];
      return [
        {
          parseVersion: { isNull: false },
          parseResult: {
            contains: { subtitleInfo: { languages: [language] } },
          },
        },
        {
          metadata: {
            contains: {
              status: 'known',
              subtitleInfo: { languages: [language] },
            },
          },
        },
        ...(legacyField
          ? [
              {
                parseVersion: { isNull: true },
                [legacyField]: { equalTo: true },
              },
            ]
          : []),
      ];
    }),
  };
}
