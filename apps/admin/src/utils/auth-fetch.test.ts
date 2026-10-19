import { createAuthFetch } from './auth-fetch';
import { AuthRequestError } from './auth-session';

function response(
  code?: string,
  status: number = code ? 401 : 200,
  extra: Record<string, unknown> = {},
) {
  const body = code
    ? { errors: [{ extensions: { code, authPhase: 'gateway' } }], ...extra }
    : { data: { done: true } };
  return { status, clone: () => ({ json: async () => body }) } as Response;
}
beforeEach(() => localStorage.clear());

it('retries the exact mutation once only after explicit pre-execution rejection', async () => {
  const rejected = response('SESSION_REFRESH_REQUIRED');
  const success = response();
  const request = jest
    .fn()
    .mockResolvedValueOnce(rejected)
    .mockResolvedValue(success);
  const refresh = jest.fn().mockResolvedValue({ authenticated: true });
  const login = jest.fn();
  const fetch = createAuthFetch(request, refresh, login);
  const init = {
    method: 'POST',
    body: '{"query":"mutation { doWork }"}',
    headers: { 'X-Lani-CSRF': '1' },
  };
  expect(await fetch('/graphql', init)).toBe(success);
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(request.mock.calls).toEqual([
    ['/graphql', init],
    ['/graphql', init],
  ]);
  expect(login).not.toHaveBeenCalled();
});

it('does not refresh or replay ordinary errors, partial results or ambiguous network failures', async () => {
  for (const rejected of [
    response('SESSION_REFRESH_REQUIRED', 200),
    response('SESSION_REFRESH_REQUIRED', 401, { data: null }),
    response('FORBIDDEN', 403),
    {
      status: 401,
      clone: () => ({
        json: async () => ({
          errors: [{ extensions: { code: 'SESSION_REFRESH_REQUIRED' } }],
        }),
      }),
    },
  ]) {
    const request = jest.fn().mockResolvedValue(rejected);
    const refresh = jest.fn();
    expect(await createAuthFetch(request, refresh)('/graphql')).toBe(rejected);
    expect(request).toHaveBeenCalledTimes(1);
    expect(refresh).not.toHaveBeenCalled();
  }
  const request = jest.fn().mockRejectedValue(new Error('Connection lost'));
  const refresh = jest.fn();
  await expect(createAuthFetch(request, refresh)('/graphql')).rejects.toThrow(
    'Connection lost',
  );
  expect(request).toHaveBeenCalledTimes(1);
  expect(refresh).not.toHaveBeenCalled();
});

it('does not loop when the retried operation also requires refresh', async () => {
  const rejected = response('SESSION_REFRESH_REQUIRED');
  const request = jest.fn().mockResolvedValue(rejected);
  const refresh = jest.fn().mockResolvedValue({ authenticated: true });
  expect(await createAuthFetch(request, refresh)('/graphql')).toBe(rejected);
  expect(request).toHaveBeenCalledTimes(2);
  expect(refresh).toHaveBeenCalledTimes(1);
});

it('redirects only when authentication is required, preserving transient errors', async () => {
  for (const [status, code, redirects] of [
    [401, 'LOGIN_REQUIRED', 1],
    [503, 'AUTH_UNAVAILABLE', 0],
    [403, 'FORBIDDEN', 0],
  ] as const) {
    const request = jest
      .fn()
      .mockResolvedValue(response('SESSION_REFRESH_REQUIRED'));
    const refresh = jest
      .fn()
      .mockRejectedValue(new AuthRequestError(status, code));
    const login = jest.fn();
    await expect(
      createAuthFetch(request, refresh, login)('/graphql'),
    ).rejects.toThrow();
    expect(login).toHaveBeenCalledTimes(redirects);
    expect(request).toHaveBeenCalledTimes(1);
  }
  const login = jest.fn();
  await createAuthFetch(
    jest.fn().mockResolvedValue(response('LOGIN_REQUIRED')),
    jest.fn(),
    login,
  )('/graphql');
  expect(login).toHaveBeenCalledTimes(1);
});

it('does not replay cancelled requests or redirect requests from before logout', async () => {
  const controller = new AbortController();
  const request = jest
    .fn()
    .mockResolvedValue(response('SESSION_REFRESH_REQUIRED'));
  const refresh = jest.fn().mockImplementation(async () => {
    controller.abort();
  });
  await expect(
    createAuthFetch(request, refresh)('/graphql', {
      signal: controller.signal,
    }),
  ).rejects.toMatchObject({ code: 'AUTH_CANCELLED' });
  expect(request).toHaveBeenCalledTimes(1);
  const stale = jest.fn().mockImplementation(async () => {
    localStorage.setItem('lani-auth-logout', 'new-generation');
    return response('LOGIN_REQUIRED');
  });
  const login = jest.fn();
  await createAuthFetch(stale, jest.fn(), login)('/graphql');
  expect(login).not.toHaveBeenCalled();
});
