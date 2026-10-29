import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  defaultSettings,
  episodeReleases,
  previewRows,
  SmartEpisode,
} from '@lani/smart-download';
import {
  captureRelease,
  PreviewCache,
  PreviewSnapshot,
  restoreRelease,
} from './preview';

export function useTimeline(
  cache: PreviewCache,
  directory: SmartEpisode[],
  now: number,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const locked = useRef<number>();
  const pending = useRef<{ episodeId?: number }>();
  const alignedRelease = useRef<{ episodeId: number; scrollTop: number }>();
  const initialized = useRef(false);
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(true);
  const [frozen, setFrozen] = useState(false);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [view, setView] =
    useState<{ preview: PreviewSnapshot; directory: SmartEpisode[] }>();
  const [height, setHeight] = useState(460);

  useEffect(() => {
    const element = viewport.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => setHeight(element.clientHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function beforeOffsetChange(next: SmartEpisode[]) {
    if (!pending.current)
      pending.current = {
        episodeId: viewport.current
          ? alignedRelease.current?.scrollTop === viewport.current.scrollTop
            ? alignedRelease.current.episodeId
            : captureRelease(viewport.current)
          : undefined,
      };
    if (
      locked.current !== undefined ||
      cache.needsEarlier(episodeReleases(next)[0]?.at)
    ) {
      if (locked.current === undefined)
        locked.current = viewport.current?.scrollTop ?? 0;
      setFrozen(true);
      setLoading(true);
      setError(undefined);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(undefined);
    if (!initialized.current && !pending.current)
      pending.current = {
        episodeId: episodeReleases(directory)[0]?.episodeIds[0],
      };
    const run = async () => {
      try {
        const preview = await cache.ensure(
          count,
          directory,
          now,
          controller.signal,
          pending.current?.episodeId,
        );
        if (controller.signal.aborted) return;
        const rows = previewRows(
          directory,
          preview.nodes,
          defaultSettings,
          now,
          preview.excludes,
          preview.coverage,
        );
        const anchorIndex = rows.findIndex((row) =>
          row.release?.episodeIds.includes(pending.current?.episodeId!),
        );
        if (anchorIndex >= count)
          setCount(Math.ceil((anchorIndex + 1) / 30) * 30);
        initialized.current = true;
        locked.current = undefined;
        setView({ preview, directory });
        setFrozen(false);
        setLoading(false);
      } catch (reason) {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : '加载种子失败');
        setLoading(false);
        // 缺口未补齐时仍保留锁定状态；可重试或继续调整偏移。
      }
    };
    const timer = setTimeout(
      () => void run(),
      locked.current === undefined ? 0 : 300,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cache, count, directory, now, retry]);

  useLayoutEffect(() => {
    if (!view || frozen || loading || !pending.current || !viewport.current)
      return;
    if (pending.current.episodeId !== undefined) {
      restoreRelease(viewport.current, pending.current.episodeId);
      // 到达列表末尾时浏览器会限制滚动距离；连续调偏移仍跟随同一集。
      alignedRelease.current = {
        episodeId: pending.current.episodeId,
        scrollTop: viewport.current.scrollTop,
      };
    }
    pending.current = undefined;
  }, [view, frozen, loading, count, height]);

  const more = () => {
    if (locked.current === undefined && !loading && !error)
      setCount((value) => value + 30);
  };
  return {
    viewport,
    view,
    count,
    loading,
    frozen,
    error,
    beforeOffsetChange,
    retry: () => setRetry((value) => value + 1),
    loadMore: more,
    // 尚有下一页时允许当前页末尾的分界线对齐，全部展示后移除此空间。
    tailSpace: Math.max(0, height - 48),
    onScroll: () => {
      const element = viewport.current;
      if (!element) return;
      if (locked.current !== undefined) {
        element.scrollTop = locked.current;
        return;
      }
      if (alignedRelease.current?.scrollTop !== element.scrollTop)
        alignedRelease.current = undefined;
      const last = element.querySelector('tbody:last-of-type tr:last-child');
      if (
        last &&
        last.getBoundingClientRect().bottom -
          element.getBoundingClientRect().bottom <
          80
      )
        more();
    },
  };
}
