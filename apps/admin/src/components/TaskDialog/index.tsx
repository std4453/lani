import { ModalProps, Tabs, Typography } from 'antd';
import clsx from 'clsx';
import { ComponentProps, ReactNode } from 'react';
import ContentDialog from '../ContentDialog';
import styles from './index.module.less';

export default function TaskDialog({
  running,
  ...props
}: ModalProps & {
  running?: boolean;
  titleActions?: ReactNode;
}) {
  return (
    <ContentDialog
      {...props}
      titleHint={
        running && <span className={styles.hint}>后台执行中，可关闭弹窗</span>
      }
    />
  );
}

/** 概览与任务步骤分别滚动，滚动条贴近弹窗外沿。 */
export function TaskDialogHeader({ children }: { children: ReactNode }) {
  return (
    <div
      className={styles.header}
      role="region"
      aria-label="任务概览"
      tabIndex={0}
    >
      {children}
    </div>
  );
}

/** 页签栏同时分隔概览与详情，任务内容保留独立滚动区域。 */
export function TaskDialogTabs({
  className,
  ...props
}: ComponentProps<typeof Tabs>) {
  return (
    <Tabs
      tabBarGutter={16}
      tabBarExtraContent={{
        right: <Typography.Text type="secondary">自动刷新中</Typography.Text>,
      }}
      {...props}
      className={clsx(styles.tabs, className)}
    />
  );
}
