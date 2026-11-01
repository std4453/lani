import type { SubjectTags } from '@/api/bangumi';

export function bangumiSearchTags(tags: SubjectTags = []): string[] {
  return [
    ...new Set(
      [...tags]
        .sort((a, b) => b.count - a.count)
        .map(({ name }) => name.trim())
        .filter(Boolean),
    ),
  ];
}
