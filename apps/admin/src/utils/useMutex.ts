import { useMemoizedFn } from 'ahooks';
import { useState } from 'react';

export default function useMutex<Args extends unknown[]>(
  fn: (...args: Args) => void | Promise<void>,
): [boolean, (...args: Args) => Promise<void>] {
  const [locked, setLocked] = useState(false);

  const mutex = useMemoizedFn(async (...args: Args): Promise<void> => {
    if (locked) return;
    try {
      setLocked(true);
      await fn(...args);
    } finally {
      setLocked(false);
    }
  });

  return [locked, mutex];
}
