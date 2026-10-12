import ProTable, { ProTableProps } from '@ant-design/pro-table';
import { ConfigProvider } from 'antd';
import clsx from 'clsx';
import styles from './index.module.less';

// 首页列表统一保留列显隐，固定位置与行密度由页面决定。
export default function MainTable<RowType extends object>({
  className,
  options,
  ...props
}: ProTableProps<RowType, Record<string, unknown>>) {
  return (
    <ConfigProvider
      getPopupContainer={(trigger) => trigger?.parentElement ?? document.body}
    >
      <ProTable<RowType>
        {...props}
        className={clsx(styles.root, className)}
        tableLayout="fixed"
        options={{
          ...options,
          density: false,
        }}
      />
    </ConfigProvider>
  );
}
