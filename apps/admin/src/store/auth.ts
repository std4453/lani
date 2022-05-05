import { AppDispatch, RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Keycloak, { KeycloakInstance, KeycloakProfile } from 'keycloak-js';

const authConfig = {
  url: 'https://accounts.std4453.com:444/auth',
  realm: 'apps',
  clientId: 'lani',
  role: 'lani-admin',
} as const;

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
    loginSuccess: (
      state,
      {
        payload: { keycloak, authorized, profile, token },
      }: PayloadAction<{
        keycloak: KeycloakInstance;
        profile: KeycloakProfile;
        authorized: boolean;
        token: string | undefined;
      }>,
    ) => {
      state.keycloak = keycloak;
      state.profile = profile;
      state.authroized = authorized;
      state.authenticated = true;
      state.token = token;
      state.loading = false;
    },
    loginError: (state) => {
      state.loading = false;
    },

    logout: (state) => {
      void state.keycloak?.logout();
    },

    toAccountPage: (state) => {
      void state.keycloak?.accountManagement();
    },
  },
});

export const { loginError, loginSuccess, logout, toAccountPage } =
  authSlice.actions;

export async function login(dispatch: AppDispatch) {
  try {
    const keycloak = Keycloak({
      url: authConfig.url,
      realm: authConfig.realm,
      clientId: authConfig.clientId,
    });
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
        keycloak,
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

const authReducer = authSlice.reducer;

export default authReducer;

export const selectToken = (state: RootState) => state.auth.token;
export const selectProfile = (state: RootState) => state.auth.profile;
export const selectAuth = (state: RootState) => state.auth;
