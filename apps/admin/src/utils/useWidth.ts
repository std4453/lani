import { useDebounceFn } from 'ahooks';
import { useEffect, useState } from 'react';

export default function useWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  const { run: updateWidth } = useDebounceFn(
    () => {
      setWidth(window.innerWidth);
    },
    {
      wait: 500,
    },
  );
  useEffect(() => {
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, [updateWidth]);
  return width;
}
