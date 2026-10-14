import { useMemoizedFn } from 'ahooks';
import { useEffect, useState } from 'react';
import { createPoller } from './polling';

export function isForegroundOnline() {
  return !document.hidden && navigator.onLine !== false;
}
export function useForegroundOnline() {
  const [available, setAvailable] = useState(isForegroundOnline);
  useEffect(() => {
    const update = () => setAvailable(isForegroundOnline());
    document.addEventListener('visibilitychange', update);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      document.removeEventListener('visibilitychange', update);
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  return available;
}
export function useApolloPoll({
  stopPolling,
  refetch,
  pollInterval,
  enabled = true,
}: {
  startPolling?(interval: number): void;
  stopPolling?(): void;
  refetch?: () => unknown;
  pollInterval: number;
  enabled?: boolean;
  refetchAfterFocus?: boolean;
}) {
  const refresh = useMemoizedFn(() => refetch?.());
  const hasRefetch = !!refetch;
  const stop = useMemoizedFn(() => stopPolling?.());
  useEffect(() => {
    stop();
    if (!enabled || !hasRefetch) return;
    const poller = createPoller({
      refresh,
      available: isForegroundOnline,
      interval: pollInterval,
    });
    document.addEventListener('visibilitychange', poller.changed);
    window.addEventListener('online', poller.changed);
    window.addEventListener('offline', poller.changed);
    return () => {
      poller.dispose();
      stop();
      document.removeEventListener('visibilitychange', poller.changed);
      window.removeEventListener('online', poller.changed);
      window.removeEventListener('offline', poller.changed);
    };
  }, [enabled, pollInterval, refresh, stop, hasRefetch]);
}
