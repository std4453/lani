import { useMemoizedFn } from 'ahooks';
import { useEffect } from 'react';

export function useApolloPoll({
  startPolling,
  stopPolling,
  refetch,
  pollInterval,
  refetchAfterFocus = false,
}: {
  startPolling(pollInterval: number): void;
  stopPolling(): void;
  refetch?: () => unknown;
  pollInterval: number;
  refetchAfterFocus?: boolean;
}) {
  const startPollingMemoized = useMemoizedFn(startPolling);
  const stopPollingMemoized = useMemoizedFn(stopPolling);
  const refetchMemoized = useMemoizedFn(() => {
    if (refetchAfterFocus) {
      refetch?.();
    }
  });
  useEffect(() => {
    const handleVisiblityChange = () => {
      if (document.hidden) {
        stopPollingMemoized();
      } else {
        refetchMemoized();
        startPollingMemoized(pollInterval);
      }
    };
    document.addEventListener('visibilitychange', handleVisiblityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisiblityChange);
    };
  }, [
    startPollingMemoized,
    stopPollingMemoized,
    refetchMemoized,
    pollInterval,
  ]);
}
