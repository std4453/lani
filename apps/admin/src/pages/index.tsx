import { Redirect, useLocation } from 'umi';

export default function Home() {
  const location = useLocation();
  return (
    <Redirect
      to={{
        pathname: '/seasons',
        search: location.search,
        hash: location.hash,
      }}
    />
  );
}
