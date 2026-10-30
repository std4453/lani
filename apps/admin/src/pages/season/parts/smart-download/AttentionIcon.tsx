import { useEffect, useRef, useState } from 'react';
import { ThunderboltFilled } from '@ant-design/icons';
import clsx from 'clsx';
import styles from './index.module.less';

export default function AttentionIcon() {
  const ref = useRef<HTMLSpanElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setEntered(true);
          observer.disconnect();
        }
      },
      // 上下各留出 30% 屏高，只在可视区域中央的 40% 内提示。
      { rootMargin: `-${window.innerHeight * 0.3}px 0px` },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <ThunderboltFilled
      ref={ref}
      className={clsx(styles.attention, entered && styles.shaking)}
      aria-hidden
    />
  );
}
