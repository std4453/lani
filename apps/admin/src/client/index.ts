import { store } from '@/store';
import { selectToken, setAuthorized } from '@/store/auth';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: '/api/gateway/graphql',
});
const authLink = setContext((_, { headers }) => {
  const token = selectToken(store.getState());
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
const errorLink = onError(({ graphQLErrors }) => {
  if (
    (graphQLErrors ?? []).some(
      ({ extensions }) => extensions.code === 'UNAUTHENTICATED',
    )
  ) {
    store.dispatch(setAuthorized({ authorized: false }));
  }
});

export const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});
