import Page401 from '@/pages/401';
import Page403 from '@/pages/403';
import { selectAuth } from '@/store/auth';
import { useAppSelector } from '@/store/hooks';
import { Spin } from 'antd';
import { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children?: ReactNode }) {
  const { authroized, authenticated, loading } = useAppSelector(selectAuth);
  if (loading) {
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
