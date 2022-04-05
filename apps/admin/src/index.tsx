import laniText from '@/assets/lani-text.svg';
import client from '@/client';
import {
  DatabaseOutlined,
  DownloadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { ApolloProvider } from '@apollo/client';
import clsx from 'clsx';
import { ElementType, useState } from 'react';
import { Link } from 'umi';
import styles from './index.module.less';

const pathToIcon: { [x: string]: ElementType } = {
  '/': HomeOutlined,
  '/seasons': DatabaseOutlined,
  '/torrents': DownloadOutlined,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function App(props: any) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <ApolloProvider client={client}>
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
      />
    </ApolloProvider>
  );
}
