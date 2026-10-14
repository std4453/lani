import { useForegroundOnline } from '@/utils/useApolloPoll';
import { ReactNode, useEffect, useRef } from 'react';
import styles from './JobScroll.module.less';

export default function JobScroll({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const available = useForegroundOnline();
  useEffect(() => {
    const container = ref.current;
    if (!container || !active || !available) return;
    const findCurrent = () =>
      container.querySelector<HTMLElement>('[data-current-step="true"]');
    let previousStep = findCurrent()?.dataset.stepId;
    let revealChangedStep = false;
    let lastManualScroll = Date.now();
    let automaticUntil = 0;
    const manual = () => {
      lastManualScroll = Date.now();
      automaticUntil = 0;
    };
    const scroll = () => {
      if (Date.now() >= automaticUntil) manual();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'PageUp',
          'PageDown',
          'Home',
          'End',
          ' ',
        ].includes(event.key)
      )
        manual();
    };
    const pointer = (event: PointerEvent) => {
      if (event.target === container) manual();
    };
    const toggle = (event: MouseEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest('button[aria-expanded]')
      )
        manual();
    };
    const timer = window.setInterval(() => {
      const current = findCurrent();
      if (!current) return;
      const id = current.dataset.stepId;
      if (id !== previousStep) {
        revealChangedStep = previousStep !== undefined;
        previousStep = id;
      }
      if (
        !revealChangedStep &&
        !['running', 'cancelling'].includes(current.dataset.stepStatus ?? '')
      )
        return;
      const now = Date.now();
      if (now - lastManualScroll < 5000 || now < automaticUntil) return;
      const viewport = container.getBoundingClientRect();
      const step = current.getBoundingClientRect();
      if (step.bottom > viewport.top && step.top < viewport.bottom) {
        revealChangedStep = false;
        return;
      }
      revealChangedStep = false;
      // 只移动任务容器；自动滚动产生的 scroll 事件不算用户操作。
      automaticUntil = now + 1000;
      container.scrollTo({
        top: Math.max(0, container.scrollTop + step.top - viewport.top - 8),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    }, 500);
    container.addEventListener('scroll', scroll, { passive: true });
    container.addEventListener('wheel', manual, { passive: true });
    container.addEventListener('touchmove', manual, { passive: true });
    container.addEventListener('keydown', keyboard);
    container.addEventListener('click', toggle);
    container.addEventListener('pointerdown', pointer);
    return () => {
      window.clearInterval(timer);
      container.removeEventListener('scroll', scroll);
      container.removeEventListener('wheel', manual);
      container.removeEventListener('touchmove', manual);
      container.removeEventListener('keydown', keyboard);
      container.removeEventListener('click', toggle);
      container.removeEventListener('pointerdown', pointer);
    };
  }, [active, available]);
  return (
    <div
      ref={ref}
      className={styles.scroll}
      tabIndex={0}
      role="region"
      aria-label="下载任务步骤"
    >
      {children}
    </div>
  );
}
