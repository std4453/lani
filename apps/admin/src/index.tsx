import laniText from '@/assets/lani-text.svg';
import {
  DatabaseOutlined,
  DownloadOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useMount, useSetState } from 'ahooks';
import { Avatar, Popover, Typography } from 'antd';
import clsx from 'clsx';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import {
  createContext,
  ElementType,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Link } from 'umi';
import styles from './index.module.less';

const pathToIcon: { [x: string]: ElementType } = {
  '/': HomeOutlined,
  '/seasons': DatabaseOutlined,
  '/torrents': DownloadOutlined,
};

export interface AuthState {
  authroized: boolean;
  authenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  authroized: false,
  authenticated: false,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function App(props: any) {
  const [collapsed, setCollapsed] = useState(false);

  const keycloak = useMemo(
    () =>
      Keycloak({
        url: 'https://accounts.std4453.com:444/auth',
        realm: 'apps',
        clientId: 'lani',
      }),
    [],
  );

  const [profile, setProfile] = useState<KeycloakProfile | undefined>(
    undefined,
  );
  const [auth, setAuth] = useSetState<AuthState>({
    authroized: false,
    authenticated: false,
    loading: true,
  });
  const [token, setToken] = useState('');
  useMount(async () => {
    try {
      await keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri:
          window.location.origin + '/silent-check-sso.html',
      });
      const profile = await keycloak.loadUserProfile();
      setProfile(profile);
      setAuth({
        authroized: keycloak.hasRealmRole('lani-admin'),
        authenticated: true,
      });
      if (keycloak.token) {
        setToken(keycloak.token);
      }
    } finally {
      setAuth({
        loading: false,
      });
    }
  });

  const client = useMemo(() => {
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

  return (
    <ApolloProvider client={client}>
      <AuthContext.Provider value={auth}>
        <ProLayout
          {...props}
          navTheme="light"
          headerRender={false}
          style={{
            height: '100vh',
          }}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          menuHeaderRender={() => (
            <Link to="/">
              <div
                className={clsx(styles.logoContainer, {
                  [styles.collapsed]: collapsed,
                })}
              >
                <div className={styles.logoBlock}>
                  <img src={laniText} alt="Lani" className={styles.logo} />
                </div>
              </div>
            </Link>
          )}
          menuItemRender={(item, dom) => {
            const Icon = item.path ? pathToIcon[item.path] : undefined;
            const icon = Icon ? <Icon /> : null;
            return (
              <Link to={item.path ?? '/'}>
                {icon}
                {dom}
              </Link>
            );
          }}
          contentStyle={{
            margin: 0,
            backgroundColor: '#FFFFFF',
            maxHeight: '100vh',
            overflow: 'auto',
          }}
          className={styles.layout}
          menuFooterRender={() =>
            profile ? (
              <Popover
                placement="rightBottom"
                overlayClassName={styles.popover}
                content={
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      className={styles.menu}
                      onClick={() => {
                        void keycloak.accountManagement();
                      }}
                    >
                      账户设置
                    </div>
                    <div
                      className={styles.menu}
                      onClick={() => {
                        void keycloak.logout();
                      }}
                    >
                      登出
                    </div>
                  </div>
                }
              >
                <div
                  className={clsx(styles.userRow, {
                    [styles.collapsed]: collapsed,
                  })}
                >
                  <Avatar icon={<UserOutlined />} className={styles.avatar} />
                  <Typography.Text className={styles.username}>
                    {profile.username}
                  </Typography.Text>
                </div>
              </Popover>
            ) : (
              <div
                className={clsx(styles.userRow, {
                  [styles.collapsed]: collapsed,
                })}
                onClick={() => {
                  void keycloak.login();
                }}
              >
                <Avatar icon={<UserOutlined />} className={styles.avatar} />
                <Typography.Text className={styles.username}>
                  未登录
                </Typography.Text>
              </div>
            )
          }
        />
      </AuthContext.Provider>
    </ApolloProvider>
  );
}
