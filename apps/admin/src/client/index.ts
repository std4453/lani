import { store } from '@/store';
import { loginError, sessionLoaded, setAuthorized } from '@/store/auth';
import {
  AuthRequestError,
  ensureSession,
  forgetSession,
} from '@/utils/auth-session';
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
  credentials: 'same-origin',
});
const authLink = setContext(async (_, { headers }) => {
  try {
    const session = await ensureSession();
    store.dispatch(sessionLoaded(session));
    if (!session.authenticated) throw new AuthRequestError(401);
  } catch (error) {
    if (error instanceof AuthRequestError && error.status === 401) {
      store.dispatch(loginError(error.message));
    }
    throw error;
  }
  return {
    headers: {
      ...headers,
      'X-Lani-CSRF': '1',
    },
  };
});
const errorLink = onError(({ graphQLErrors }) => {
  if (
    (graphQLErrors ?? []).some(
      ({ extensions }) => extensions.code === 'UNAUTHENTICATED',
    )
  ) {
    forgetSession();
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
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
  },
});
