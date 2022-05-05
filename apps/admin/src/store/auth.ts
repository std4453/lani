import { AppDispatch, AppGetState, RootState } from '@/store';
import { selectConfig } from '@/store/config';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Keycloak, { KeycloakInstance, KeycloakProfile } from 'keycloak-js';

export interface AuthState {
  keycloak: KeycloakInstance | undefined;
  authroized: boolean;
  authenticated: boolean;
  loading: boolean;
  profile: KeycloakProfile | undefined;
  token: string | undefined;
}

const initialState: AuthState = {
  keycloak: undefined,
  authroized: false,
  authenticated: false,
  loading: true,
  profile: undefined,
  token: undefined,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setKeycloak: (
      state,
      { payload: { keycloak } }: PayloadAction<{ keycloak: KeycloakInstance }>,
    ) => {
      state.keycloak = keycloak;
    },

    loginSuccess: (
      state,
      {
        payload: { authorized, profile, token },
      }: PayloadAction<{
        profile: KeycloakProfile;
        authorized: boolean;
        token: string | undefined;
      }>,
    ) => {
      state.profile = profile;
      state.authroized = authorized;
      state.authenticated = true;
      state.token = token;
      state.loading = false;
    },
    loginError: (state) => {
      state.loading = false;
    },
  },
});

const { setKeycloak } = authSlice.actions;
export const { loginError, loginSuccess } = authSlice.actions;

export async function logout(_dispatch: AppDispatch, getState: AppGetState) {
  const keycloak = getState().auth.keycloak;
  await keycloak?.logout();
}

export async function toAccountPage(
  _dispatch: AppDispatch,
  getState: AppGetState,
) {
  const keycloak = getState().auth.keycloak;
  await keycloak?.accountManagement();
}

export async function login(dispatch: AppDispatch, getState: AppGetState) {
  try {
    const config = selectConfig(getState());
    if (
      !config ||
      !config.auth.enabled ||
      config.auth.provider !== 'keycloak'
    ) {
      throw new Error('Invalid auth config');
    }
    const authConfig = config.auth.keycloak;

    const keycloak = Keycloak({
      url: authConfig.url,
      realm: authConfig.realm,
      clientId: authConfig.clientId,
    });
    dispatch(setKeycloak({ keycloak }));
    // 这里如果设置 login-required 则会多跳一次，我们这里默认后台检查登陆状态，如果没有登录则跳到登录页，
    // 如果登录了则对用户无感知。虽然登录过程中也会展示加载中，但用户体验会好一点
    await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
    });
    if (!keycloak.authenticated) {
      void keycloak.login();
    }
    const profile = await keycloak.loadUserProfile();
    dispatch(
      loginSuccess({
        authorized: keycloak.hasRealmRole(authConfig.role),
        profile: profile,
        token: keycloak.token,
      }),
    );
  } catch (error) {
    console.error(error);
    dispatch(loginError);
  }
}

export async function initAuth(dispatch: AppDispatch, getState: AppGetState) {
  const config = getState().config;
  if (!config?.data?.auth?.enabled) {
    return;
  }
  const provider = config.data.auth.provider;
  if (provider === 'keycloak') {
    await dispatch(login);
  } else {
    throw new Error(`Unsupported provider ${provider}`);
  }
}

const authReducer = authSlice.reducer;

export default authReducer;

export const selectToken = (state: RootState) => state.auth.token;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectAuth = (state: RootState) => state.auth;
