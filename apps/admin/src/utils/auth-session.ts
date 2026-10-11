export interface Profile {
  sub: string;
  name?: string;
  nickname?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
  profile?: string;
}

export interface Session {
  testRoutingEnabled?: boolean;
  enabled: boolean;
  authenticated: boolean;
  authorized?: boolean;
  profile?: Profile;
  expiresAt?: number;
  refreshRequired?: boolean;
}

export class AuthRequestError extends Error {
  public status: number;

  public constructor(status: number) {
    super(
      status === 401
        ? '登录已过期，请重新登录'
        : '暂时无法连接登录服务，请重试',
    );
    this.status = status;
  }
}

let cached: Session | undefined;
let pending: Promise<Session> | undefined;
let refreshRetryAfter = 0;

export async function authRequest(path: string, method: string = 'GET') {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`/api/gateway/auth/${path}`, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: method === 'POST' ? { 'X-Lani-CSRF': '1' } : {},
      signal: controller.signal,
    });
    if (!response.ok) throw new AuthRequestError(response.status);
    return await response.json();
  } catch (error) {
    throw error instanceof AuthRequestError ? error : new AuthRequestError(503);
  } finally {
    window.clearTimeout(timeout);
  }
}

export function forgetSession() {
  cached = undefined;
}

export function withAuthLock<T>(callback: () => Promise<T>): Promise<T> {
  const locks = (
    navigator as Navigator & {
      locks?: {
        request<R>(name: string, callback: () => Promise<R>): Promise<R>;
      };
    }
  ).locks;
  return locks ? locks.request('lani-auth-refresh', callback) : callback();
}

// Serialize refresh across tabs; the endpoint checks the latest cookie again.
async function refreshSession(): Promise<Session> {
  let session: Session = await authRequest('session');
  if (session.refreshRequired) {
    try {
      session = await authRequest('refresh', 'POST');
      refreshRetryAfter = 0;
    } catch (error) {
      if (
        error instanceof AuthRequestError &&
        error.status === 503 &&
        session.authenticated &&
        (session.expiresAt || 0) > Date.now() / 1000 + 5
      ) {
        // A temporary refresh outage must not discard a still-valid access token.
        refreshRetryAfter = Date.now() + 5000;
        cached = session;
        return session;
      }
      if (!(error instanceof AuthRequestError) || error.status !== 401)
        throw error;
      session = await authRequest('session');
      if (!session.authenticated || session.refreshRequired) throw error;
    }
  }
  cached = session;
  return session;
}

export function ensureSession(): Promise<Session> {
  const remaining = (cached?.expiresAt || 0) - Date.now() / 1000;
  if (
    cached &&
    (!cached.enabled ||
      (cached.authenticated &&
        (remaining > 30 || (remaining > 5 && Date.now() < refreshRetryAfter))))
  ) {
    return Promise.resolve(cached);
  }
  if (!pending) {
    pending = withAuthLock(refreshSession).finally(() => {
      pending = undefined;
    });
  }
  return pending;
}

export function loginURL() {
  const url = new URL(window.location.href);
  // Recover bookmarks/history entries left by the old SPA callback.
  let returnTo = `${url.pathname}${url.search}${url.hash}`;
  if (url.pathname === '/redirect')
    returnTo = url.searchParams.get('url') || '/';
  const target = new URL(returnTo, url.origin);
  if (
    target.origin !== url.origin ||
    target.pathname.startsWith('/api/') ||
    target.pathname === '/redirect'
  )
    return '/api/gateway/auth/login';
  for (const key of [
    'code',
    'state',
    'session_state',
    'iss',
    'auth_error',
    'signed_out',
  ])
    target.searchParams.delete(key);
  return `/api/gateway/auth/login?returnTo=${encodeURIComponent(
    `${target.pathname}${target.search}${target.hash}`,
  )}`;
}
