import {
  authRequest,
  loadAuthSession,
  logoutSession,
  refreshSession,
} from './auth-session';

let queue: Promise<unknown>;
const requestLock = jest.fn((_name, run) => {
  const pending = queue.then(run);
  queue = pending.catch(() => {});
  return pending;
});
const fetchMock = jest.fn();
const session = { authenticated: true, authorized: true, expiresAt: 1000 };
function reply(body: unknown, status: number = 200) {
  return { ok: status === 200, status, json: async () => body };
}
beforeEach(() => {
  localStorage.clear();
  queue = Promise.resolve();
  requestLock.mockClear();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: { request: requestLock },
  });
});

it('coalesces simultaneous refresh requests and sends credentials with CSRF protection', async () => {
  fetchMock.mockResolvedValue(reply(session));
  const results = await Promise.all([
    refreshSession(),
    refreshSession(),
    refreshSession(),
  ]);
  expect(results).toEqual([session, session, session]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(requestLock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/gateway/auth/refresh',
    expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Lani-CSRF': '1' },
    }),
  );
});

it('waits for another tab before reading the current cookies at refresh time', async () => {
  let release!: () => void;
  queue = new Promise<void>((resolve) => {
    release = resolve;
  });
  fetchMock.mockResolvedValue(reply(session));
  const refresh = refreshSession();
  await Promise.resolve();
  expect(fetchMock).not.toHaveBeenCalled();
  release();
  expect(await refresh).toEqual(session);
});

it('initialization refreshes an expired session instead of immediately navigating away', async () => {
  fetchMock
    .mockResolvedValueOnce(
      reply({ authenticated: false, refreshRequired: true }),
    )
    .mockResolvedValueOnce(reply(session));
  expect(await loadAuthSession()).toEqual(session);
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    '/api/gateway/auth/session',
    '/api/gateway/auth/refresh',
  ]);
});

it('preserves provider errors and allows a later retry', async () => {
  fetchMock
    .mockResolvedValueOnce(reply({ error: 'AUTH_UNAVAILABLE' }, 503))
    .mockResolvedValueOnce(reply(session));
  await expect(refreshSession()).rejects.toMatchObject({
    status: 503,
    code: 'AUTH_UNAVAILABLE',
  });
  expect(await refreshSession()).toEqual(session);
});

it('serializes logout after an in-flight refresh, clearing the final cookies last', async () => {
  let finish!: (value: unknown) => void;
  fetchMock
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValueOnce(reply({ redirectTo: '/?signed_out=1' }));
  const refresh = refreshSession();
  await Promise.resolve();
  const logout = logoutSession();
  await expect(refreshSession()).rejects.toMatchObject({
    code: 'AUTH_CANCELLED',
  });
  finish(reply(session));
  await refresh;
  await logout;
  expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
    '/api/gateway/auth/refresh',
    '/api/gateway/auth/logout',
  ]);
  expect(localStorage.getItem('lani-auth-logout')).toBeTruthy();
});

it('cancels refresh queued before another tab logs out', async () => {
  let release!: () => void;
  queue = new Promise<void>((resolve) => {
    release = resolve;
  });
  const pending = refreshSession();
  localStorage.setItem('lani-auth-logout', 'other-tab');
  release();
  await expect(pending).rejects.toMatchObject({ code: 'AUTH_CANCELLED' });
  expect(fetchMock).not.toHaveBeenCalled();
});

it('falls back to login when cross-tab locking is unavailable, but still permits logout', async () => {
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: undefined,
  });
  await expect(refreshSession()).rejects.toMatchObject({
    code: 'LOGIN_REQUIRED',
  });
  fetchMock.mockResolvedValue(reply({ redirectTo: '/?signed_out=1' }));
  await logoutSession();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('keeps invalid grant and permission denial distinguishable', async () => {
  fetchMock.mockResolvedValue(reply({ error: 'LOGIN_REQUIRED' }, 401));
  await expect(authRequest('refresh', 'POST')).rejects.toMatchObject({
    status: 401,
    code: 'LOGIN_REQUIRED',
  });
});
