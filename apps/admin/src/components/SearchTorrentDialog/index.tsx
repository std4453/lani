import Highlight from '@/components/Highlight';
import {
  SearchTorrentDocument,
  TorrentFieldsFragment,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { extractNode } from '@/utils/graphql';
import {
  createUseDialogWithOnResolve,
  DialogPropsWithOnResolve,
} from '@/utils/useDialog';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn, useSetState, useUpdate } from 'ahooks';
import { Input, List, Modal, Spin, Typography } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { useEffect, useRef, useState } from 'react';
import store2 from 'store2';
import styles from './index.module.less';

function useDebounce<T>(
  value: T,
  {
    wait,
    leading = false,
  }: {
    wait: number;
    leading?: boolean;
  },
) {
  const update = useUpdate();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastValueRef = useRef(value);
  const currentValueRef = useRef(value);

  if (value !== lastValueRef.current) {
    if (leading && !timeoutRef.current) {
      currentValueRef.current = value;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      currentValueRef.current = value;
      timeoutRef.current = undefined;
      update();
    }, wait);
  }
  lastValueRef.current = value;

  return currentValueRef.current;
}

export default function SearchTorrentDialog({
  reject,
  resolve,
  visible,
  submitting,
  input,
}: DialogPropsWithOnResolve<
  {
    keyword: string;
    seasonFullName?: string;
    seasonId?: number;
    useLocalSavedKeyword?: boolean;
    saveLocalKeyword?: boolean;
  } | void,
  TorrentFieldsFragment
>) {
  const [keywords, setKeywords] = useState('');
  const [selected, setSelected] = useState<TorrentFieldsFragment | undefined>(
    undefined,
  );
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (visible) {
      if (typeof input === 'object' && 'keyword' in input) {
        const { keyword, seasonId, useLocalSavedKeyword = false } = input;
        const initialKeyword =
          useLocalSavedKeyword && seasonId
            ? (store2.get(
                `season:${seasonId}:torrentSearchKeyword`,
                keyword,
              ) as string)
            : keyword;
        setKeywords(initialKeyword);
      } else {
        setKeywords('');
      }
      setSelected(undefined);
    }
  }, [visible, input]);

  const keywordsDebounced = useDebounce(keywords, {
    wait: 300,
    // 首次不等待
    leading: !initialized,
  });
  const [
    {
      error,
      hasNext,
      loading,
      queryParams,
      torrents,
      nextOffset,
      lastQueryKeyword,
    },
    setData,
  ] = useSetState({
    lastQueryKeyword: '',
    torrents: [] as TorrentFieldsFragment[],
    hasNext: true,
    nextOffset: 0,
    loading: false,
    error: false,
    queryParams: {
      keywords: '',
      offset: 0,
    },
  });
  const promiseRevisionRef = useRef(0);

  useEffect(() => {
    setData({
      torrents: [],
      hasNext: true,
      nextOffset: 0,
      queryParams: {
        keywords: keywordsDebounced,
        offset: 0,
      },
    });
  }, [keywordsDebounced, setData]);

  const client = useApolloClient();

  const fetchData = useMemoizedFn(async () => {
    // 隐藏的时候不加载
    if (!visible) {
      return;
    }

    ++promiseRevisionRef.current;
    const currentPromiseRevision = promiseRevisionRef.current;
    try {
      setData({
        loading: true,
        error: false,
      });
      const { data } = await client.query({
        query: SearchTorrentDocument,
        variables: {
          first: 50,
          offset: queryParams.offset,
          keyword: queryParams.keywords,
        },
      });
      if (promiseRevisionRef.current === currentPromiseRevision) {
        const additionalTorrents = extractNode(data.allTorrents) ?? [];
        const totalCount = data.allTorrents?.totalCount ?? 0;
        const newTorrents = [...torrents, ...additionalTorrents];
        setData({
          lastQueryKeyword: queryParams.keywords,
          torrents: newTorrents,
          loading: false,
          error: false,
          hasNext: totalCount > newTorrents.length,
          nextOffset: queryParams.offset + additionalTorrents.length,
        });
      }
    } catch (error) {
      if (promiseRevisionRef.current === currentPromiseRevision) {
        handleError(error, '搜索种子失败');
        setData({
          error: true,
          loading: false,
        });
      }
    } finally {
      if (promiseRevisionRef.current === currentPromiseRevision) {
        setData({ loading: false });
        setInitialized(true);
      }
    }
  });
  useEffect(() => {
    void fetchData();
  }, [queryParams, fetchData]);

  const loadMore = useMemoizedFn(() => {
    if (!visible || !hasNext || loading) {
      return;
    }
    setData({
      queryParams: {
        ...queryParams,
        offset: nextOffset,
      },
    });
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

  const clearData = useMemoizedFn(() => {
    setInitialized(false);
    setKeywords('');
    ++promiseRevisionRef.current;
    const currentPromiseRevision = promiseRevisionRef.current;
    // 用setTimeout等待动画结束后清除数据，避免内存泄漏
    setTimeout(() => {
      // 如果已经开始了新的请求则不清除数据
      if (promiseRevisionRef.current !== currentPromiseRevision) {
        return;
      }
      setData({
        torrents: [],
        nextOffset: 0,
        queryParams: {
          keywords: '',
          offset: 0,
        },
        hasNext: true,
        error: false,
      });
    }, 600);
  });

  const saveKeyword = useMemoizedFn(() => {
    if (input?.saveLocalKeyword && input?.seasonId) {
      store2.set(`season:${input.seasonId}:torrentSearchKeyword`, keywords);
    }
  });

  return (
    <Modal
      visible={visible}
      destroyOnClose={true}
      title="搜索种子"
      width={900}
      onCancel={() => {
        reject();
        saveKeyword();
        clearData();
      }}
      okButtonProps={{
        disabled: !selected,
        loading: submitting,
      }}
      onOk={async () => {
        if (selected) {
          await resolve(selected);
          saveKeyword();
          clearData();
        }
      }}
      centered
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="输入关键词"
          allowClear
        />
        {input?.seasonFullName ? (
          <Typography.Link
            onClick={() => {
              if (input.seasonFullName) {
                setKeywords(input.seasonFullName);
              }
            }}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            使用季度全名
          </Typography.Link>
        ) : null}
      </div>
      <div className={styles.list}>
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
                <Highlight content={item.title} keyword={lastQueryKeyword} />
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
      </div>
    </Modal>
  );
}

export const useSearchTorrentDialog =
  createUseDialogWithOnResolve(SearchTorrentDialog);
