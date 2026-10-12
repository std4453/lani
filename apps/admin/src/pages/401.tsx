import image401 from '@/assets/undraw_login_re_4vu2.svg';
import { Button, Typography } from 'antd';
import { login, selectAuth } from '@/store/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function Page401() {
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(selectAuth);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img src={image401} width={400} alt="请登录" />
      {error && <Typography.Paragraph>{error}</Typography.Paragraph>}
      <Button type="primary" onClick={() => void dispatch(login)}>
        {error ? '重试登录' : '登录'}
      </Button>
    </div>
  );
}
