import useAppClient from '@/client/hooks';
import Layout from '@/components/Layout';
import { store } from '@/store';
import { initAuth } from '@/store/auth';
import { loadConfig } from '@/store/config';
import { useAppDispatch } from '@/store/hooks';
import { ApolloProvider } from '@apollo/client';
import { useMount } from 'ahooks';
import { Provider } from 'react-redux';
import './global.less';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function App(props: any) {
  return (
    <Provider store={store}>
      <AppInner {...props} />
    </Provider>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AppInner(props: any) {
  const dispatch = useAppDispatch();
  useMount(async () => {
    await dispatch(loadConfig);
    await dispatch(initAuth);
  });

  const client = useAppClient();

  return (
    <ApolloProvider client={client}>
      <Layout {...props} />
    </ApolloProvider>
  );
}
