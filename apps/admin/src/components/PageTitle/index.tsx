import { useTitle } from 'ahooks';

export default function PageTitle({ title }: { title: string }) {
  useTitle(`${title} | Lani 管理后台`);

  return null;
}
