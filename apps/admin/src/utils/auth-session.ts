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
  public code: string;

  public constructor(status: number, code: string = 'AUTH_UNAVAILABLE') {
    super(
      status === 401
        ? '登录已过期，请重新登录'
        : status === 403
        ? '没有访问权限'
        : '暂时无法连接登录服务，请重试',
    );
    this.status = status;
    this.code = code;
  }
}

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
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new AuthRequestError(response.status, body.error);
    }
    return await response.json();
  } catch (error) {
    throw error instanceof AuthRequestError ? error : new AuthRequestError(503);
  } finally {
    window.clearTimeout(timeout);
  }
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

// 只保存退出代次，不保存 token；用于丢弃退出前已经发出的请求。
const logoutKey = 'lani-auth-logout';
export function authGeneration() {
  try {
    return window.localStorage.getItem(logoutKey) || '';
  } catch {
    return undefined;
  }
}

async function withAuthLock<T>(run: () => Promise<T>): Promise<T> {
  if (!navigator.locks) throw new AuthRequestError(401, 'LOGIN_REQUIRED');
  return navigator.locks.request('lani-auth-session', run);
}

let refreshing: Promise<Session> | undefined;
let loggingOut = false;
export function refreshSession(
  generation: string | undefined = authGeneration(),
): Promise<Session> {
  if (loggingOut || generation !== authGeneration())
    return Promise.reject(new AuthRequestError(409, 'AUTH_CANCELLED'));
  if (!refreshing) {
    refreshing = withAuthLock(async () => {
      if (loggingOut || generation !== authGeneration())
        throw new AuthRequestError(409, 'AUTH_CANCELLED');
      // 无法跨标签页识别退出时回退到重新登录，不冒险自动消费轮换凭据。
      if (generation === undefined)
        throw new AuthRequestError(401, 'LOGIN_REQUIRED');
      return authRequest('refresh', 'POST') as Promise<Session>;
    }).finally(() => {
      refreshing = undefined;
    });
  }
  return refreshing;
}

export async function logoutSession() {
  loggingOut = true;
  try {
    const run = async () => {
      try {
        window.localStorage.setItem(
          logoutKey,
          `${Date.now()}-${Math.random()}`,
        );
      } catch {
        /* 存储不可用时不会自动刷新。 */
      }
      return authRequest('logout', 'POST');
    };
    return navigator.locks ? await withAuthLock(run) : await run();
  } finally {
    loggingOut = false;
  }
}

export async function loadAuthSession(): Promise<Session> {
  const generation = authGeneration();
  const current: Session = await authRequest('session');
  return current.refreshRequired ? refreshSession(generation) : current;
}
