import Page401 from '@/pages/401';
import Page403 from '@/pages/403';
import { selectAuth } from '@/store/auth';
import { selectConfig, selectConfigState } from '@/store/config';
import { useAppSelector } from '@/store/hooks';
import { Spin } from 'antd';
import { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children?: ReactNode }) {
  const state = useAppSelector(selectConfigState);
  const config = useAppSelector(selectConfig);
  const { authroized, authenticated, loading } = useAppSelector(selectAuth);
  if (state === 'success' && !config?.auth?.enabled) {
    return <div>{children}</div>;
  }
  if (state === 'pending' || loading) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  } else if (!authenticated) {
    return <Page401 />;
  } else if (!authroized) {
    return <Page403 />;
  } else {
    return <div>{children}</div>;
  }
}
