import { SearchBangumiDocument, SearchBangumiQuery } from '@/generated/types';
import { useApolloClient } from '@apollo/client';
import { useEffect, useState } from 'react';

type Results = SearchBangumiQuery['searchBangumi'];

export function useBangumiSearch(
  keywords: string,
  useNewBangumiSearchApi: boolean,
  enabled: boolean,
) {
  const client = useApolloClient();
  const [items, setItems] = useState<Results>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const [loadMore, setLoadMore] = useState<() => void>(() => () => {});

  useEffect(() => {
    let active = true;
    const pagination = { pending: false, offset: 0, more: true };
    setItems([]);
    setLoading(false);
    setHasMore(true);
    setError(false);

    const load = async () => {
      if (!enabled || !active || pagination.pending || !pagination.more) return;
      pagination.pending = true;
      setLoading(true);
      setError(false);
      try {
        const { data } = await client.query({
          query: SearchBangumiDocument,
          variables: {
            keywords,
            useNewBangumiSearchApi,
            offset: pagination.offset,
          },
          fetchPolicy: 'no-cache',
        });
        // 切换关键词、渠道或关闭弹窗后，丢弃旧请求的迟到结果。
        if (!active) return;
        const page = data.searchBangumi;
        pagination.offset += page.length;
        // 后端每页最多返回 20 条；整页结果继续请求，短页结束。
        pagination.more = page.length === 20;
        setItems((previous) => {
          const unique = new Map(previous.map((item) => [item.id, item]));
          page.forEach((item) => unique.set(item.id, item));
          return [...unique.values()];
        });
        setHasMore(pagination.more);
      } catch {
        if (active) setError(true);
      } finally {
        // 同一轮搜索由 pending 锁串行请求，旧轮次的状态独立且不会再启动。
        // eslint-disable-next-line require-atomic-updates
        pagination.pending = false;
        if (active) setLoading(false);
      }
    };
    setLoadMore(() => load);
    void load();
    return () => {
      active = false;
    };
  }, [client, keywords, useNewBangumiSearchApi, enabled]);

  return { items, loading, hasMore, error, loadMore };
}
