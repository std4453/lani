import { Tag, Tooltip } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import styles from './BangumiTags.module.less';
import { platformColors } from './bangumi-search-display';

export default function BangumiTags({
  tags,
  platform,
}: {
  tags: string[];
  platform?: string | null;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(tags.length);

  useLayoutEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;
    const update = () => {
      const width = measure.getBoundingClientRect().width;
      if (!width) return;
      const elements = Array.from(measure.children) as HTMLElement[];
      const counter = elements[tags.length];
      setCount(
        visibleTagCount(
          elements
            .slice(0, tags.length)
            .map((el) => el.getBoundingClientRect().width),
          width,
          (hidden) => {
            counter.textContent = `+${hidden}`;
            return counter.getBoundingClientRect().width;
          },
        ),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [tags, platform]);

  const hidden = tags.slice(count);
  return (
    <div className={styles.container} aria-label="标签">
      {platform && (
        <Tag className={styles.platform} color={platformColors[platform]}>
          {platform}
        </Tag>
      )}
      {tags.length > 0 && (
        <div className={styles.remaining}>
          <div className={styles.tags}>
            {tags.slice(0, count).map((tag) => (
              <Tag key={tag} title={tag}>
                {tag}
              </Tag>
            ))}
            {hidden.length > 0 && (
              <Tooltip title={hidden.join('、')} trigger={['hover', 'focus']}>
                <Tag
                  className={styles.more}
                  tabIndex={0}
                  aria-label={`另有${hidden.length}个标签：${hidden.join(
                    '、',
                  )}`}
                >
                  +{hidden.length}
                </Tag>
              </Tooltip>
            )}
          </div>
          <div
            ref={measureRef}
            className={`${styles.tags} ${styles.measure}`}
            aria-hidden="true"
          >
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <Tag>+{tags.length}</Tag>
          </div>
        </div>
      )}
    </div>
  );
}

// 为 +X 预留位置，标签与隐藏数量共同限制在一行内。
export function visibleTagCount(
  widths: number[],
  available: number,
  moreWidth: (hidden: number) => number,
  gap: number = 4,
): number {
  const total = (count: number) =>
    widths.slice(0, count).reduce((sum, width) => sum + width, 0) +
    Math.max(0, count - 1) * gap;
  if (total(widths.length) <= available) return widths.length;
  for (let count = widths.length - 1; count >= 0; count--) {
    if (
      total(count) + (count ? gap : 0) + moreWidth(widths.length - count) <=
      available
    )
      return count;
  }
  return 0;
}
