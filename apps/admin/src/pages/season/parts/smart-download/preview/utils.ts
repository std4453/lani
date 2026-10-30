export function relativePublishTime(publishDate: string, releaseAt: number) {
  const seconds = Math.max(
    0,
    Math.floor((Date.parse(publishDate) - releaseAt) / 1000),
  );
  return `+${[
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')}`;
}

/** 读取正常流中的分界行，而非吸顶单元格；50px 采样与 48px 恢复留 2px 余量。 */
export function captureRelease(viewport: HTMLElement): number | undefined {
  const top = viewport.getBoundingClientRect().top + 50;
  const rows = [
    ...viewport.querySelectorAll<HTMLElement>('tr[data-release-ids]'),
  ];
  return rows
    .reverse()
    .find((row) => row.getBoundingClientRect().top <= top)
    ?.dataset.releaseIds?.split(',')
    .map(Number)[0];
}
export function restoreRelease(viewport: HTMLElement, episodeId: number) {
  const row = [
    ...viewport.querySelectorAll<HTMLElement>('tr[data-release-ids]'),
  ].find((element) =>
    element.dataset.releaseIds?.split(',').map(Number).includes(episodeId),
  );
  if (row)
    viewport.scrollTop +=
      row.getBoundingClientRect().top -
      viewport.getBoundingClientRect().top -
      48;
}
