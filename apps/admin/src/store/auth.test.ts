jest.mock('@/utils/auth-session', () => ({
  ...jest.requireActual('@/utils/auth-session'),
  loadAuthSession: jest.fn(),
  loginURL: () => '/api/gateway/auth/login',
}));
jest.mock('@/utils/test-routing-notice', () => ({
  notifyTestRouting: jest.fn(),
}));

import { configureStore } from '@reduxjs/toolkit';
import authReducer, { initAuth, login } from './auth';
import { AuthRequestError, loadAuthSession } from '@/utils/auth-session';

const load = jest.mocked(loadAuthSession);
const replace = jest.fn();
const location = window.location;

beforeEach(() => {
  load.mockReset();
  replace.mockReset();
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { ...location, search: '', replace },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: location });
});

it.each(['?auth_error=login_failed', '?signed_out=1'])(
  'stops initialization redirects on LOGIN_REQUIRED with %s',
  async (search) => {
    window.location.search = search;
    load.mockRejectedValue(new AuthRequestError(401, 'LOGIN_REQUIRED'));
    const store = configureStore({ reducer: authReducer });

    await initAuth(store.dispatch);

    expect(replace).not.toHaveBeenCalled();
    expect(load).toHaveBeenCalledTimes(1);
    expect(store.getState()).toMatchObject({
      loading: false,
      authenticated: false,
      error: '登录未完成，请重试',
    });
  },
);

it.each(['?auth_error=login_failed', '?signed_out=1'])(
  'allows an explicit login retry despite %s',
  async (search) => {
    window.location.search = search;
    load.mockRejectedValue(new AuthRequestError(401, 'LOGIN_REQUIRED'));
    const store = configureStore({ reducer: authReducer });

    await login(store.dispatch);

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/api/gateway/auth/login');
  },
);

it('automatically logs in on LOGIN_REQUIRED without failure or logout markers', async () => {
  load.mockRejectedValue(new AuthRequestError(401, 'LOGIN_REQUIRED'));
  const store = configureStore({ reducer: authReducer });

  await initAuth(store.dispatch);

  expect(replace).toHaveBeenCalledTimes(1);
  expect(replace).toHaveBeenCalledWith('/api/gateway/auth/login');
});

it.each(['initialization', 'explicit login'])(
  'ends loading on cancelled %s without restarting login after another tab logs out',
  async (entry) => {
    let cancel!: (error: Error) => void;
    load.mockReturnValue(
      new Promise((_resolve, reject) => {
        cancel = reject;
      }),
    );
    const store = configureStore({ reducer: authReducer });
    const pending = (entry === 'initialization' ? initAuth : login)(
      store.dispatch,
    );
    expect(store.getState().loading).toBe(true);

    cancel(new AuthRequestError(409, 'AUTH_CANCELLED'));
    await pending;

    expect(store.getState()).toMatchObject({
      loading: false,
      authenticated: false,
      error: '登录状态已变更，请重新登录',
    });
    expect(load).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  },
);
