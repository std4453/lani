import { UserLibraryService } from './generated';

/** 统一接入层的可取消、有超时边界的详情请求；错误不携带认证配置。 */
export async function getLibraryItem(
  userId: string,
  itemId: string,
  signal: AbortSignal,
  timeout = 30000,
) {
  if (signal.aborted) throw new Error('Jellyfin request cancelled');
  const request = UserLibraryService.getItem(userId, itemId);
  let timedOut = false;
  const cancel = () => request.cancel();
  const timer = setTimeout(() => {
    timedOut = true;
    request.cancel();
  }, timeout);
  signal.addEventListener('abort', cancel, { once: true });
  try {
    return await request;
  } catch (error) {
    const code = timedOut ? 'ETIMEDOUT' : error.code;
    const status = error.status ?? error.response?.status;
    throw Object.assign(
      new Error(
        `Jellyfin request failed (${
          status ?? code ?? (signal.aborted ? 'cancelled' : 'network error')
        })`,
      ),
      { code, status },
    );
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', cancel);
  }
}
