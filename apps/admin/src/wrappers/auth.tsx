import { useAuth } from '@/index';
import Page401 from '@/pages/401';
import Page403 from '@/pages/403';
import { ReactNode } from 'react';

export default function AuthWrapper({ children }: { children?: ReactNode }) {
  const { authroized, authenticated, loading } = useAuth();
  if (loading) {
    return <div>logging in</div>;
  } else if (!authenticated) {
    return <Page401 />;
  } else if (!authroized) {
    return <Page403 />;
  } else {
    return <div>{children}</div>;
  }
}
