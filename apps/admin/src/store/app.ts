import { RootState } from '@/store';
import { isMobile } from '@/utils/useMobile';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppState {
  collapsed: boolean;
}

const initialState: AppState = {
  collapsed: isMobile(),
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCollapsed: (
      state,
      { payload: { collapsed } }: PayloadAction<{ collapsed: boolean }>,
    ) => {
      state.collapsed = collapsed;
    },
  },
});

export const { setCollapsed } = appSlice.actions;

const appReducer = appSlice.reducer;

export default appReducer;

export const selectCollapsed = (state: RootState) => state.app.collapsed;
