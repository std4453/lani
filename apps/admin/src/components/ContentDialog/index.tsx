import { Modal, ModalProps } from 'antd';
import clsx from 'clsx';
import { ReactNode } from 'react';
import styles from './index.module.less';

export default function ContentDialog({
  title,
  titleHint,
  titleActions,
  closeHint,
  className,
  ...props
}: ModalProps & {
  titleHint?: ReactNode;
  titleActions?: ReactNode;
  closeHint?: ReactNode;
}) {
  return (
    <Modal
      {...props}
      className={clsx(
        styles.dialog,
        titleActions && styles.hasActions,
        closeHint && styles.hasCloseHint,
        className,
      )}
      title={
        <div className={clsx(styles.title, titleActions && styles.withActions)}>
          <span role="heading" aria-level={2}>
            {title}
          </span>
          {titleHint}
          {titleActions && <div className={styles.actions}>{titleActions}</div>}
          {closeHint && <span className={styles.closeHint}>{closeHint}</span>}
        </div>
      }
    />
  );
}
