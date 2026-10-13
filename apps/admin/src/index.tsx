import { client } from '@/client';
import Layout from '@/components/Layout';
import { store } from '@/store';
import { initAuth, selectAuth } from '@/store/auth';
import { loadConfig } from '@/store/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ThemeProvider } from '@/theme';
import { useEffect } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useMount } from 'ahooks';
import { Provider } from 'react-redux';
import './global.less';

// Build-only acceptance marker; runtime behavior is unchanged.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function App(props: any) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppInner {...props} />
      </ThemeProvider>
    </Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AppInner(props: any) {
  const dispatch = useAppDispatch();
  const { authenticated, authorized } = useAppSelector(selectAuth);

  useMount(async () => {
    await dispatch(initAuth);
  });

  useEffect(() => {
    if (authenticated && authorized) void dispatch(loadConfig);
  }, [authenticated, authorized, dispatch]);

  return (
    <ApolloProvider client={client}>
      <Layout {...props} />
    </ApolloProvider>
  );
}
