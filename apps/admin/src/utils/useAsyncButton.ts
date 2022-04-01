import { useMemoizedFn } from 'ahooks';
import { ButtonProps } from 'antd';
import { useState } from 'react';

export function useAsyncButton(onClick: () => Promise<unknown>): ButtonProps {
  const [loading, setLoading] = useState(false);
  const wrappedOnClick = useMemoizedFn(async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      await onClick();
    } finally {
      setLoading(false);
    }
  });
  return {
    loading,
    onClick: wrappedOnClick,
  };
}
