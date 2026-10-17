import { AppDispatch, AppGetState, RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authRequest, loginURL, Profile, Session } from '@/utils/auth-session';
import { notifyTestRouting } from '@/utils/test-routing-notice';

export interface AuthState {
  authorized: boolean;
  authenticated: boolean;
  loading: boolean;
  profile?: Profile;
  config?: { enabled: boolean; testRoutingEnabled?: boolean };
  error?: string;
}

const initialState: AuthState = {
  authorized: false,
  authenticated: false,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStarted: (state) => {
      state.loading = true;
      state.error = undefined;
    },
    sessionLoaded: (state, { payload }: PayloadAction<Session>) => {
      state.config = {
        enabled: payload.enabled,
        testRoutingEnabled: payload.testRoutingEnabled,
      };
      state.authenticated = payload.authenticated;
      state.authorized = payload.authorized ?? false;
      state.profile = payload.profile;
      state.loading = false;
      state.error = undefined;
    },
    loginError: (state, { payload }: PayloadAction<string>) => {
      state.loading = false;
      state.authenticated = false;
      state.error = payload;
    },
    setAuthorized: (
      state,
      { payload }: PayloadAction<{ authorized: boolean }>,
    ) => {
      state.authorized = payload.authorized;
    },
  },
});

export const { sessionLoaded, loginError, setAuthorized } = authSlice.actions;

async function loadSession(dispatch: AppDispatch, initial: boolean) {
  dispatch(authSlice.actions.loginStarted());
  try {
    const session: Session = await authRequest('session');
    notifyTestRouting(session.testRoutingEnabled);
    dispatch(sessionLoaded(session));
    const params = new URLSearchParams(window.location.search);
    if (session.authenticated) {
      if (window.location.pathname === '/redirect') {
        const target =
          new URL(loginURL(), window.location.origin).searchParams.get(
            'returnTo',
          ) || '/';
        window.location.replace(target);
      } else if (params.has('auth_error') || params.has('signed_out')) {
        params.delete('auth_error');
        params.delete('signed_out');
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${params.toString() ? `?${params}` : ''}${
            window.location.hash
          }`,
        );
      }
    } else if (
      initial &&
      (params.has('auth_error') || params.has('signed_out'))
    ) {
      if (params.has('auth_error')) dispatch(loginError('登录未完成，请重试'));
    } else {
      window.location.replace(loginURL());
    }
  } catch (error) {
    dispatch(
      loginError(
        error instanceof Error ? error.message : '暂时无法连接登录服务，请重试',
      ),
    );
  }
}

export async function login(dispatch: AppDispatch) {
  await loadSession(dispatch, false);
}
export async function initAuth(dispatch: AppDispatch) {
  await loadSession(dispatch, true);
}

export async function logout(dispatch: AppDispatch) {
  try {
    const result = await authRequest('logout', 'POST');
    window.location.replace(result.redirectTo);
  } catch {
    dispatch(loginError('退出登录未完成，请重试'));
  }
}

export async function toAccountPage(
  _dispatch: AppDispatch,
  getState: AppGetState,
) {
  const profileURL = getState().auth.profile?.profile;
  if (profileURL && /^https?:\/\//.test(profileURL))
    window.location.href = profileURL;
}

export default authSlice.reducer;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectAuth = (state: RootState) => state.auth;
export const selectHasAccountPage = (state: RootState) =>
  Boolean(state.auth.profile?.profile);
