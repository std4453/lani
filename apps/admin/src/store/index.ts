import appReducer from '@/store/app';
import authReducer from '@/store/auth';
import configReducer from '@/store/config';
import { applyMiddleware, configureStore } from '@reduxjs/toolkit';
import thunkMiddleware from 'redux-thunk';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    config: configReducer,
    app: appReducer,
  },
  enhancers: [applyMiddleware(thunkMiddleware)],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUserManager', 'config/loadConfigError'],
        ignoredPaths: ['auth.userManager', 'config.error'],
      },
    }),
});

export type AppGetState = typeof store.getState;
export type RootState = ReturnType<AppGetState>;
export type AppDispatch = typeof store.dispatch;
