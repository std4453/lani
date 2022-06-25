import useWidth from '@/utils/useWidth';

// antd 默认断点
const breakpoint = 768;

export function isMobile() {
  return window.innerWidth < breakpoint;
}

export default function useMobile() {
  const width = useWidth();
  return width < breakpoint;
}
