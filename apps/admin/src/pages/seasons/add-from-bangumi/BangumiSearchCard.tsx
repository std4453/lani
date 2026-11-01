import Highlight from '@/components/Highlight';
import { Tag } from 'antd';
import clsx from 'clsx';
import { memo, useCallback, useMemo } from 'react';
import BangumiCover from './BangumiCover';
import BangumiTags from './BangumiTags';
import {
  BangumiSearchItem,
  bangumiDisplayTags,
} from './bangumi-search-display';
import { bangumiTitleMatches } from './bangumi-title-matches';
import styles from './AddFromBangumiDialog.module.less';

function BangumiSearchCard({
  item,
  selected,
  keywords,
  onSelect,
}: {
  item: BangumiSearchItem;
  selected: boolean;
  keywords: string;
  onSelect: (item: BangumiSearchItem) => void;
}) {
  const matches = useMemo(
    () => bangumiTitleMatches(item.name, keywords),
    [item.name, keywords],
  );
  const match = useCallback(() => matches, [matches]);
  const tags = useMemo(() => bangumiDisplayTags(item), [item]);
  return (
    <div className={styles.itemContainer}>
      <div
        aria-disabled={item.added}
        className={clsx(styles.item, {
          [styles.added]: item.added,
          [styles.selected]: selected,
        })}
      >
        <div className={styles.content}>
          <div className={styles.title} title={item.name}>
            <Highlight content={item.name} match={match} />
            {item.added && (
              <Tag color="green" className={styles.addedTag}>
                已添加
              </Tag>
            )}
          </div>
          <div className={styles.date}>
            {item.airDate && item.airDate !== '0000-00-00'
              ? `放送日期：${item.airDate}`
              : ''}
          </div>
          <BangumiTags tags={tags} platform={item.platform} />
        </div>
        <BangumiCover
          src={item.image}
          previewSrc={item.previewImage}
          name={item.name}
        />
        <button
          type="button"
          className={styles.select}
          aria-label={`选择${item.name}`}
          aria-pressed={selected}
          disabled={item.added}
          onClick={() => onSelect(item)}
        />
      </div>
    </div>
  );
}
export default memo(BangumiSearchCard);
