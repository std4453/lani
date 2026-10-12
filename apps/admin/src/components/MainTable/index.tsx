import ProTable, { ProTableProps } from '@ant-design/pro-table';

// 首页列表的列配置与行密度由页面决定。
export default function MainTable<RowType extends object>({
  options,
  ...props
}: ProTableProps<RowType, Record<string, unknown>>) {
  return (
    <ProTable<RowType>
      {...props}
      tableLayout="fixed"
      options={{
        ...options,
        density: false,
        setting: false,
      }}
    />
  );
}
