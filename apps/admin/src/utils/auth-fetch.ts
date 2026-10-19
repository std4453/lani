import {
  AuthRequestError,
  authGeneration,
  loginURL,
  refreshSession,
} from './auth-session';

async function gatewayError(response: Response): Promise<string | undefined> {
  if (response.status !== 401) return;
  const body = await response
    .clone()
    .json()
    .catch(() => undefined);
  if (!body || 'data' in body || body.errors?.length !== 1) return;
  const error = body.errors[0];
  if (error.extensions?.authPhase === 'gateway') return error.extensions.code;
}

export function createAuthFetch(
  request: typeof fetch,
  refresh: typeof refreshSession = refreshSession,
  requireLogin: () => void = () => window.location.replace(loginURL()),
): typeof fetch {
  return async (input, init) => {
    const generation = authGeneration();
    const response = await request(input, init);
    const code = await gatewayError(response);
    const cancelled = () =>
      init?.signal?.aborted || generation !== authGeneration();
    if (cancelled()) return response;
    if (code === 'LOGIN_REQUIRED') {
      requireLogin();
      return response;
    }
    if (code !== 'SESSION_REFRESH_REQUIRED') return response;
    try {
      await refresh(generation);
    } catch (error) {
      if (
        !cancelled() &&
        error instanceof AuthRequestError &&
        error.code === 'LOGIN_REQUIRED'
      )
        requireLogin();
      throw error;
    }
    if (cancelled()) throw new AuthRequestError(409, 'AUTH_CANCELLED');
    // 仅 Gateway 执行业务前拒绝的请求允许重试一次；网络错误和业务错误均不重放。
    const retried = await request(input, init);
    if (!cancelled() && (await gatewayError(retried)) === 'LOGIN_REQUIRED')
      requireLogin();
    return retried;
  };
}

export const authFetch = createAuthFetch((input, init) => fetch(input, init));
