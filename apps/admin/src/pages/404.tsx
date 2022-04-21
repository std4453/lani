import image404 from '@/assets/undraw_page_not_found_re_e9o6.svg';

export default function Page404() {
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
      <img src={image404} width={400} />
    </div>
  );
}
