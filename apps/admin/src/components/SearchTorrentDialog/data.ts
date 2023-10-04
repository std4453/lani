import {
  SearchTorrentDocument,
  TorrentFieldsFragment
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { extractNode } from '@/utils/graphql';
import { useDebounce } from '@/utils/useDebounce';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn, useSetState } from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import store2 from 'store2';

export function useSearchTorrentData({
  visible,
  saveLocalKeyword = true,
  seasonId,
  useLocalSavedKeyword = true,
  initialKeyword,
}: {
  visible: boolean;
  seasonId?: number;
  saveLocalKeyword?: boolean;
  useLocalSavedKeyword?: boolean;
    initialKeyword?: string;
}) {
  const [keywords, setKeywords] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialKeyword) {
        const initialKeywordRespectingLocal =
          useLocalSavedKeyword && seasonId
            ? (store2.get(
                `season:${seasonId}:torrentSearchKeyword`,
                initialKeyword,
              ) as string)
            : initialKeyword;
        setKeywords(initialKeywordRespectingLocal);
      } else {
        setKeywords('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
    if (saveLocalKeyword && seasonId) {
      store2.set(`season:${seasonId}:torrentSearchKeyword`, keywords);
    }
  });

  useEffect(() => {
    if (!visible) {
      saveKeyword();
      clearData()
    }
  }, [visible, saveKeyword, clearData]);

  return {
    keywords,
    setKeywords,
    error,
    hasNext,
    loading,
    torrents,
    nextOffset,
    lastQueryKeyword,
    loadMore,
  }
}
