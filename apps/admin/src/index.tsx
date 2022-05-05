import useAppClient from '@/client/hooks';
import Layout from '@/components/Layout';
import { store } from '@/store';
import { login } from '@/store/auth';
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
  useMount(() => void dispatch(login));

  const client = useAppClient();

  return (
    <ApolloProvider client={client}>
      <Layout {...props} />
    </ApolloProvider>
  );
}
