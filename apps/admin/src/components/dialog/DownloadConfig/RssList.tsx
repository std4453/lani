import ProList from '@ant-design/pro-list';
import { useMemo } from 'react';

export default function RssList({
  loading,
  data,
}: {
  loading: boolean;
  data: string[] | undefined;
}) {
  const datasource = useMemo(
    () => (data ?? []).map((content) => ({ content })),
    [data],
  );

  return (
    <ProList<{ content: string }>
      loading={loading}
      headerTitle="推送列表"
      dataSource={datasource}
      onRow={(r) => ({
        onClick() {
          console.log(r.content);
        },
      })}
    />
  );
}
