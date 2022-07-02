import { AppDispatch, RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserManagerSettings } from 'oidc-client-ts';

type WithEnabled<T> =
  | {
      enabled: false;
    }
  | ({
      enabled: true;
    } & T);

interface GroupAuthorization {
  type: 'group';
  group: string;
}

type AuthorizationConfig = GroupAuthorization;

export interface AuthConfig {
  config: Omit<UserManagerSettings, 'redirect_uri' | 'response_mode'>;
  authorization?: WithEnabled<AuthorizationConfig>;
}

type AuthConfigConditional = WithEnabled<AuthConfig>;

interface JellyfinConfig {
  host: string;
  serverId: string;
}

interface ConfigType {
  auth: AuthConfigConditional;
  jellyfin: JellyfinConfig;
}

export interface ConfigState {
  state: 'pending' | 'success' | 'error';
  data: ConfigType | undefined;
  error: any;
}

const initialState: ConfigState = {
  state: 'pending',
  data: undefined,
  error: undefined,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    loadConfigSuccess: (
      state,
      { payload: { data } }: PayloadAction<{ data: ConfigType }>,
    ) => {
      state.data = data;
      state.state = 'success';
    },
    loadConfigError: (
      state,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { payload: { error } }: PayloadAction<{ error: any }>,
    ) => {
      state.error = error;
      state.state = 'error';
    },
  },
});

const { loadConfigError, loadConfigSuccess } = configSlice.actions;

export async function loadConfig(dispatch: AppDispatch) {
  try {
    const resp = await fetch('/config.json');
    const data = await resp.json();
    dispatch(loadConfigSuccess({ data }));
  } catch (error) {
    dispatch(loadConfigError({ error }));
  }
}

const configReducer = configSlice.reducer;

export default configReducer;

export const selectConfigState = (state: RootState) => state.config.state;
export const selectConfig = (state: RootState) => state.config.data;
