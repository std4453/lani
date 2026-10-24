import { UserLibraryService } from './generated';
import { CancelablePromise } from './generated/core/CancelablePromise';
import { getLibraryItem } from './library-item';
jest.mock('./generated', () => ({
  UserLibraryService: { getItem: jest.fn() },
}));
afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});
it('请求经过生成接入层；超时取消请求并返回可重试的无凭据错误', async () => {
  jest.useFakeTimers();
  let cancelled = false;
  (UserLibraryService.getItem as jest.Mock).mockImplementation(
    () =>
      new CancelablePromise((_resolve, _reject, onCancel) => {
        onCancel(() => {
          cancelled = true;
        });
      }),
  );
  const request = getLibraryItem(
    'user',
    'item',
    new AbortController().signal,
    30,
  );
  const assertion = expect(request).rejects.toMatchObject({
    code: 'ETIMEDOUT',
  });
  jest.advanceTimersByTime(30);
  await assertion;
  expect(cancelled).toBe(true);
  expect(UserLibraryService.getItem).toHaveBeenCalledWith('user', 'item');
});
it('关闭取消在途请求，错误不会携带认证配置', async () => {
  const abort = new AbortController();
  (UserLibraryService.getItem as jest.Mock).mockImplementation(
    () => new CancelablePromise(() => undefined),
  );
  const request = getLibraryItem('user', 'item', abort.signal);
  abort.abort();
  await expect(request).rejects.toThrow('cancelled');
  (UserLibraryService.getItem as jest.Mock).mockReturnValue(
    Promise.reject({ status: 403, request: { token: 'secret' } }),
  );
  await expect(
    getLibraryItem('user', 'item', new AbortController().signal),
  ).rejects.toMatchObject({
    message: 'Jellyfin request failed (403)',
    status: 403,
  });
});
