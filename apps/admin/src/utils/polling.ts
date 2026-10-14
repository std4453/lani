/** 串行轮询：请求结束后才计时，恢复前台/网络时合并为一次立即刷新。 */
export function createPoller(options: {
  refresh(): Promise<unknown> | unknown;
  available(): boolean;
  interval: number;
}) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  let pending = false;
  let again = false;
  const run = () => {
    if (disposed || !options.available()) return;
    if (pending) {
      again = true;
      return;
    }
    pending = true;
    void Promise.resolve()
      .then(options.refresh)
      .catch(() => {
        // 查询错误由调用方展示，下个周期允许恢复。
      })
      .finally(() => {
        pending = false;
        if (again) {
          again = false;
          run();
        } else if (!disposed && options.available())
          timer = setTimeout(run, options.interval);
      });
  };
  if (options.available()) timer = setTimeout(run, options.interval);
  return {
    changed() {
      clearTimeout(timer);
      if (options.available()) void run();
      else again = false;
    },
    dispose() {
      disposed = true;
      clearTimeout(timer);
      again = false;
    },
  };
}
