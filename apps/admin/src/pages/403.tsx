import image403 from '@/assets/undraw_secure_login_pdn4.svg';
import PageTitle from '@/components/PageTitle';

export default function Page403() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PageTitle title="无访问权限" />
      <img src={image403} width={400} />
    </div>
  );
}
