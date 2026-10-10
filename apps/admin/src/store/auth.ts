import { AppDispatch, AppGetState, RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserManager, UserManagerSettings, UserProfile } from 'oidc-client-ts';
import { parse, stringify } from 'qs';

type WithEnabled<T> =
  | {
      enabled: false;
    }
  | ({
      enabled: true;
    } & T);

interface AuthConfig {
  config: Omit<UserManagerSettings, 'redirect_uri'>;
}

type AuthConfigConditional = WithEnabled<AuthConfig> & {
  // 仅供测试；旧 Gateway 未返回此字段时保持关闭。
  testRoutingEnabled?: boolean;
};

export interface AuthState {
  userManager: UserManager | undefined;
  authorized: boolean;
  authenticated: boolean;
  loading: boolean;
  profile: UserProfile | undefined;
  token: string | undefined;
  config: AuthConfigConditional | undefined;
}

const initialState: AuthState = {
  userManager: undefined,
  authorized: false,
  authenticated: false,
  loading: true,
  profile: undefined,
  token: undefined,
  config: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setConfig: (
      state,
      { payload: { config } }: PayloadAction<{ config: AuthConfigConditional }>,
    ) => {
      state.config = config;
    },

    setUserManager: (
      state,
      { payload: { userManager } }: PayloadAction<{ userManager: UserManager }>,
    ) => {
      state.userManager = userManager;
    },

    loginSuccess: (
      state,
      {
        payload: { profile, token },
      }: PayloadAction<{
        profile: UserProfile;
        token: string | undefined;
      }>,
    ) => {
      state.profile = profile;
      state.authorized = true;
      state.authenticated = true;
      state.token = token;
      state.loading = false;
    },
    loginError: (state) => {
      state.loading = false;
    },
    loginSkipped: (state) => {
      state.loading = false;
      state.authenticated = true;
      state.authorized = true;
    },

    setAuthorized: (
      state,
      {
        payload: { authorized },
      }: PayloadAction<{
        authorized: boolean;
      }>,
    ) => {
      state.authorized = authorized;
    },
  },
});

const { setUserManager, setConfig, loginSkipped, loginError, loginSuccess } =
  authSlice.actions;
export const { setAuthorized } = authSlice.actions;

export async function logout(_dispatch: AppDispatch, getState: AppGetState) {
  const manager = getState().auth.userManager;
  await manager?.signoutRedirect({
    post_logout_redirect_uri: location.href,
  });
}

export async function toAccountPage(
  _dispatch: AppDispatch,
  getState: AppGetState,
) {
  const profileURL = getState().auth.profile?.profile;
  if (profileURL) {
    window.location.href = profileURL;
  }
}

// https://github.com/authts/react-oidc-context/blob/4a2a457371b9829bc2c02bdb5f916f068335e562/src/utils.ts
function hasAuthParams(location = window.location) {
  // response_mode: query
  const searchParams = new URLSearchParams(location.search);
  if (
    (searchParams.get('code') || searchParams.get('error')) &&
    searchParams.get('state')
  ) {
    return true;
  }

  return false;
}

async function fetchAuthConfig() {
  const resp = await fetch('/api/gateway/auth_config', { cache: 'no-store' });
  const data = await resp.json();
  return data as AuthConfigConditional;
}

export async function login(dispatch: AppDispatch) {
  try {
    const authConfig = await fetchAuthConfig();

    dispatch(setConfig({ config: authConfig }));

    if (!authConfig.enabled) {
      dispatch(loginSkipped());
      return;
    }

    const redirectURL = new URL('/redirect', window.location.href);
    redirectURL.search = `?${stringify({
      url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    })}`;

    const manager = new UserManager({
      // 这里让用户重写 scope，因为在请求 oidc-configuration 之前不知道有哪些可用的 scope，如果填错
      // 会报错，用户自己应该知道有什么 scope 可用，默认只会获取 openid，没有用户名和头像这些，比较完整的是
      // scope: openid profile name nickname email picture,
      ...authConfig.config,
      redirect_uri: redirectURL.href,
      loadUserInfo: true,
      // response_type: query
    });
    dispatch(setUserManager({ userManager: manager }));

    let user = await manager.getUser();

    // 用户完成登录后会将本次用的 state 从 storage 中删除，如果此时（不可避免地）
    // 通过返回再次跳转到包含 state 的地址则会报错，因此这里判断如果已经完成登录，则
    // 不再调用 signinCallback
    if (!user && window.location.pathname === '/redirect' && hasAuthParams()) {
      await manager.signinCallback();
      const { url } = parse(window.location.search, {
        ignoreQueryPrefix: true,
      });
      window.location.replace(url as string);
    }

    if (!user) {
      user = await manager.getUser();
    }

    if (!user) {
      await manager.signinRedirect();
    } else {
      dispatch(
        loginSuccess({
          profile: user.profile,
          token: user.access_token,
        }),
      );
    }
  } catch (error) {
    console.error(error);
    dispatch(loginError);
  }
}

export async function initAuth(dispatch: AppDispatch) {
  await dispatch(login);
}

const authReducer = authSlice.reducer;

export default authReducer;

export const selectToken = (state: RootState) => state.auth.token;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectAuth = (state: RootState) => state.auth;
export const selectHasAccountPage = (state: RootState) =>
  Boolean(state.auth.profile?.profile);
