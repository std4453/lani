import { client } from '@/client';
import Layout from '@/components/Layout';
import { store } from '@/store';
import { initAuth } from '@/store/auth';
import { loadConfig } from '@/store/config';
import { useAppDispatch } from '@/store/hooks';
import { ThemeProvider } from '@/theme';
import { ApolloProvider } from '@apollo/client';
import { useMount } from 'ahooks';
import { Provider } from 'react-redux';
import './global.less';

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

  useMount(async () => {
    await dispatch(initAuth);
    await dispatch(loadConfig);
  });

  return (
    <ApolloProvider client={client}>
      <Layout {...props} />
    </ApolloProvider>
  );
}
