import { useUpdate } from "ahooks";
import { useRef } from "react";

export function useDebounce<T>(
  value: T,
  {
    wait,
    leading = false,
  }: {
    wait: number;
    leading?: boolean;
  },
) {
  const update = useUpdate();
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastValueRef = useRef(value);
  const currentValueRef = useRef(value);

  if (value !== lastValueRef.current) {
    if (leading && !timeoutRef.current) {
      currentValueRef.current = value;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      currentValueRef.current = value;
      timeoutRef.current = undefined;
      update();
    }, wait);
  }
  lastValueRef.current = value;

  return currentValueRef.current;
}
