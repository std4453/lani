import { store } from '@/store';
import { loginError, setAuthorized } from '@/store/auth';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: '/api/gateway/graphql',
  credentials: 'same-origin',
  headers: { 'X-Lani-CSRF': '1' },
});
const errorLink = onError(({ graphQLErrors }) => {
  if (
    (graphQLErrors ?? []).some(
      ({ extensions }) => extensions.code === 'UNAUTHENTICATED',
    )
  ) {
    store.dispatch(loginError('登录已过期，请重新登录'));
  }
  if (
    (graphQLErrors ?? []).some(
      ({ extensions }) => extensions.code === 'FORBIDDEN',
    )
  ) {
    store.dispatch(setAuthorized({ authorized: false }));
  }
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});
