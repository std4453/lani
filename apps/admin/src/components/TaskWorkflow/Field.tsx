import { ReactNode } from 'react';
import { Typography } from 'antd';
import styles from './index.module.less';
export default function Field({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <Typography.Text type="secondary">{label}：</Typography.Text>
      <Typography.Text copyable={typeof children === 'string' && !!children}>
        {children || '-'}
      </Typography.Text>
    </div>
  );
}
