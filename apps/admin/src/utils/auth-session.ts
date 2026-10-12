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
