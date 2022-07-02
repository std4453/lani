import laniText from '@/assets/lani-text.svg';
import { selectCollapsed, setCollapsed } from '@/store/app';
import {
  logout,
  selectHasAccountPage,
  selectProfile,
  toAccountPage,
} from '@/store/auth';
import { selectConfig } from '@/store/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import useMobile from '@/utils/useMobile';
import {
  DatabaseOutlined,
  DownloadOutlined,
  HomeOutlined,
  MenuOutlined,
  NodeExpandOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ProLayout from '@ant-design/pro-layout';
import { Avatar, Popover, Typography } from 'antd';
import clsx from 'clsx';
import { ElementType } from 'react';
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
  const hasAccountPage = useAppSelector(selectHasAccountPage);

  const mobile = useMobile();

  if (profile) {
    return mobile ? (
      <>
        <div
          className={clsx(styles.userRow, {
            [styles.collapsed]: collapsed,
          })}
        >
          <Avatar
            icon={<UserOutlined />}
            className={styles.avatar}
            src={profile?.picture}
          />
          <Typography.Text className={styles.username}>
            {profile?.preferred_username ?? '用户'}
          </Typography.Text>
        </div>
        <div className={styles.mobileActions}>
          {hasAccountPage && (
            <Typography.Text
              className={styles.mobileAction}
              onClick={() => {
                dispatch(toAccountPage);
              }}
            >
              账户设置
            </Typography.Text>
          )}
          <Typography.Text
            className={styles.mobileAction}
            onClick={() => {
              dispatch(logout);
            }}
          >
            退出登录
          </Typography.Text>
        </div>
      </>
    ) : (
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
            {hasAccountPage && (
              <div
                className={styles.menu}
                onClick={() => {
                  dispatch(toAccountPage);
                }}
              >
                账户设置
              </div>
            )}
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
            {profile?.preferred_username ?? '用户'}
          </Typography.Text>
        </div>
      </Popover>
    );
  } else {
    return (
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Layout(props: any) {
  const collapsed = useAppSelector(selectCollapsed);
  const config = useAppSelector(selectConfig);
  const dispatch = useAppDispatch();

  const mobile = useMobile();

  return (
    <ProLayout
      {...props}
      navTheme="light"
      headerRender={false}
      collapsed={collapsed}
      onCollapse={(collapsed: boolean) => {
        dispatch(setCollapsed({ collapsed }));
      }}
      menuHeaderRender={() => (
        <Link
          to="/"
          onClick={() => {
            dispatch(setCollapsed({ collapsed: true }));
          }}
        >
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
          <Link
            to={item.path ?? '/'}
            onClick={() => {
              // 移动端点击时关闭菜单
              if (mobile) {
                dispatch(setCollapsed({ collapsed: true }));
              }
            }}
          >
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

export interface HamburgerProps {
  inTable?: boolean;
  className?: string;
}

export function Hamburger({ inTable, className }: HamburgerProps) {
  const collapsed = useAppSelector(selectCollapsed);
  const dispatch = useAppDispatch();

  return (
    <MenuOutlined
      className={clsx(
        styles.hamburger,
        {
          [styles.inTable]: inTable,
        },
        className,
      )}
      onClick={() => {
        dispatch(setCollapsed({ collapsed: !collapsed }));
      }}
    />
  );
}
