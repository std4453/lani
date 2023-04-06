import { client } from '@/client';
import { AdminConfig, GetConfigDocument } from '@/generated/types';
import { AppDispatch, RootState } from '@/store';
import { handleError } from '@/utils/error';
import { ExcludeTypename } from '@/utils/graphql';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConfigState {
  data: AdminConfig | undefined;
}

const initialState: ConfigState = {
  data: undefined,
};

export const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (
      state,
      { payload: { data } }: PayloadAction<{ data: AdminConfig }>,
    ) => {
      state.data = data;
    },
  },
});

export const { setConfig } = configSlice.actions;

export async function loadConfig(dispatch: AppDispatch) {
  try {
    const { data: response } = await client.query({
      query: GetConfigDocument,
    });
    const data = response.config as ExcludeTypename<typeof response.config>;
    dispatch(setConfig({ data }));
  } catch (error) {
    handleError(error, '配置获取失败');
  }
}

const configReducer = configSlice.reducer;

export default configReducer;

export const selectConfig = (state: RootState) => state.config.data;
