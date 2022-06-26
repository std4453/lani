import { Divider, Space, Typography } from 'antd';
import clsx from 'clsx';
import { ReactNode } from 'react';
import styles from './Section.module.less';

export interface SectionProps {
  title: ReactNode;
  extra?: ReactNode;
  children?: ReactNode;
  className?: string;
  extraClassName?: string;
}

export default function Section({
  title,
  extra,
  children,
  className,
  extraClassName,
}: SectionProps) {
  return (
    <div className={clsx(styles.root, className)}>
      <div className={styles.container}>
        <Typography.Title level={5} className={styles.title}>
          {title}
        </Typography.Title>
        <Space direction="horizontal" size="middle" className={extraClassName}>
          {extra}
        </Space>
      </div>
      <Divider className={styles.divider} />
      {children}
    </div>
  );
}
