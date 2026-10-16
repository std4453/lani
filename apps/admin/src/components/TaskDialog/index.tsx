import { Modal, ModalProps } from 'antd';
import { ReactNode } from 'react';
import styles from './index.module.less';

export default function TaskDialog({
  title,
  running,
  ...props
}: ModalProps & { running?: boolean }) {
  return (
    <Modal
      {...props}
      className={styles.dialog}
      title={
        <div className={styles.title}>
          <span role="heading" aria-level={2}>
            {title}
          </span>
          {running && (
            <span className={styles.hint}>后台执行中，可关闭弹窗</span>
          )}
        </div>
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
