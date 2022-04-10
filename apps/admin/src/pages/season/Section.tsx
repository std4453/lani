import { Divider, Space, Typography } from 'antd';
import { ReactNode } from 'react';
import styles from './Section.module.less';

export interface SectionProps {
  title: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
}

export default function Section({ title, extra, children }: SectionProps) {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <Typography.Title level={5} className={styles.title}>
          {title}
        </Typography.Title>
        <Space direction="horizontal">{extra}</Space>
      </div>
      <Divider className={styles.divider} />
      {children}
    </div>
  );
}
