import { AppDispatch, RootState } from '@/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type WithEnabled<T> =
  | {
      enabled: false;
    }
  | ({
      enabled: true;
    } & T);

type AuthConfig = WithEnabled<{
  provider: 'keycloak';
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
    role: string;
  };
}>;

interface ConfigType {
  auth: AuthConfig;
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
