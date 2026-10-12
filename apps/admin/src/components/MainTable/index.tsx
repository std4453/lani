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
      // 仅列设置挂载在列表内，确认框等仍挂到 body，避免被滚动容器裁剪。
      getPopupContainer={(trigger) =>
        trigger?.closest('[aria-label="setting"]')
          ? trigger.parentElement ?? document.body
          : document.body
      }
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
