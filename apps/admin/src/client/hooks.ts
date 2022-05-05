import { selectToken } from '@/store/auth';
import { useAppSelector } from '@/store/hooks';
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useMemo } from 'react';

export default function useAppClient() {
  const token = useAppSelector(selectToken);

  return useMemo(() => {
    const httpLink = createHttpLink({
      uri: '/api/gateway/graphql',
    });
    const authLink = setContext((_, { headers }) => {
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'network-only',
        },
      },
    });
  }, [token]);
}
