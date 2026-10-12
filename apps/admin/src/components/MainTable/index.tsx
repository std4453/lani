import useMobile from '@/utils/useMobile';
import ProTable, { ProTableProps } from '@ant-design/pro-table';
import clsx from 'clsx';
import styles from './index.module.less';

// 首页列表的列配置与行密度由页面决定。
export default function MainTable<RowType extends object>({
  options,
  className,
  scroll,
  ...props
}: ProTableProps<RowType, Record<string, unknown>>) {
  const mobile = useMobile();

  return (
    <ProTable<RowType>
      {...props}
      className={clsx(styles.root, className)}
      scroll={{ ...scroll, y: mobile ? undefined : '100%' }}
      tableLayout="fixed"
      options={{
        ...options,
        density: false,
        setting: false,
        reload: !mobile,
      }}
    />
  );
}
