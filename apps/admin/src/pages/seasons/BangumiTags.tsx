import { Tag, Tooltip } from 'antd';
import { useLayoutEffect, useRef, useState } from 'react';
import { visibleTagCount } from './bangumi-tags-layout';
import styles from './BangumiTags.module.less';

export default function BangumiTags({ tags }: { tags: string[] }) {
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
  }, [tags]);

  if (!tags.length) return null;
  const hidden = tags.slice(count);
  return (
    <div className={styles.container}>
      <div className={styles.tags} aria-label="标签">
        {tags.slice(0, count).map((tag) => (
          <Tag key={tag} title={tag}>
            {tag}
          </Tag>
        ))}
        {hidden.length > 0 && (
          <Tooltip title={hidden.join('、')} trigger={['hover', 'focus']}>
            <Tag
              tabIndex={0}
              aria-label={`另有${hidden.length}个标签：${hidden.join('、')}`}
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
  );
}
