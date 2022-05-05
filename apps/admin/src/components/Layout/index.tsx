import laniText from '@/assets/lani-text.svg';
import { logout, selectProfile, toAccountPage } from '@/store/auth';
import { selectConfig } from '@/store/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  DatabaseOutlined,
  DownloadOutlined,
  HomeOutlined,
  NodeExpandOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { Avatar, Popover, Typography } from 'antd';
import clsx from 'clsx';
import { ElementType, useState } from 'react';
import { Link } from 'umi';
import styles from './index.module.less';

const pathToIcon: { [x: string]: ElementType } = {
  '/': HomeOutlined,
  '/seasons': DatabaseOutlined,
  '/torrents': DownloadOutlined,
  '/jobs': NodeExpandOutlined,
};

function UserProfile({ collapsed }: { collapsed: boolean }) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);

  return profile ? (
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
              dispatch(toAccountPage);
            }}
          >
            账户设置
          </div>
          <div
            className={styles.menu}
            onClick={() => {
              dispatch(logout);
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
    >
      <Avatar icon={<UserOutlined />} className={styles.avatar} />
      <Typography.Text className={styles.username}>未登录</Typography.Text>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout(props: any) {
  const [collapsed, setCollapsed] = useState(false);

  const config = useAppSelector(selectConfig);

  return (
    <ProLayout
      {...props}
      navTheme="light"
      headerRender={false}
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
      }}
      className={styles.layout}
      menuFooterRender={() =>
        config?.auth?.enabled ? <UserProfile collapsed={collapsed} /> : null
      }
    />
  );
}
