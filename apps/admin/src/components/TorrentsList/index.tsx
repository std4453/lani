import Highlight from '@/components/Highlight';
import { TorrentFieldsFragment } from '@/generated/types';
import { useMemoizedFn } from 'ahooks';
import { List, Spin, Typography } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

const noTorrents = [] as TorrentFieldsFragment[];

export default function TorrentsList({
  selected,
  setSelected,
  error = false,
  hasNext = false,
  loading = false,
  keyword = '',
  torrents = noTorrents,
  onScrollToBottom,
}: {
  selected: TorrentFieldsFragment | undefined;
  setSelected: (selected: TorrentFieldsFragment | undefined) => void;
  error?: boolean;
  hasNext?: boolean;
  loading?: boolean;
  keyword?: string;
  torrents: TorrentFieldsFragment[];
  onScrollToBottom?: () => void;
}) {
  const loadMore = useMemoizedFn(() => {
    if (!hasNext || loading) {
      return;
    }
    onScrollToBottom?.();
  });
  const [spinEl, setSpinEl] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (spinEl) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      });
      observer.observe(spinEl);
      return () => {
        observer.disconnect();
      };
    }
  }, [spinEl, loadMore]);

  return (
    <>
      <List
        dataSource={torrents}
        rowKey="id"
        renderItem={(item) => (
          <div
            className={clsx(styles.row, {
              [styles.selected]: item.id === selected?.id,
            })}
            onClick={() => {
              setSelected(item);
            }}
          >
            <Typography.Text className={styles.info}>
              {dayjs(item.publishDate).format('YYYY-MM-DD HH:mm:ss')}
              <br />
              {item.size ? prettyBytes(parseInt(item.size as string)) : '-'}
            </Typography.Text>
            <Typography.Text className={styles.title}>
              <Highlight content={item.title} keyword={keyword} />
            </Typography.Text>
          </div>
        )}
        className={clsx({
          [styles.noEmpty]: loading || error,
        })}
      />
      <div className={styles.spin} ref={setSpinEl}>
        {error ? (
          <>
            <Typography.Text type="secondary">加载失败，</Typography.Text>
            <Typography.Link
              onClick={() => {
                if (error) {
                  loadMore();
                }
              }}
            >
              点击重试
            </Typography.Link>
          </>
        ) : loading || hasNext ? (
          <Spin />
        ) : torrents.length > 0 ? (
          <Typography.Text type="secondary">没有更多了</Typography.Text>
        ) : null}
      </div>
    </>
  );
}
