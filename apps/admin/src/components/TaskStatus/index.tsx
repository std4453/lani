import { Badge, Tag, Typography } from 'antd';
import {
  taskStatus,
  taskState,
  TASK_STATES,
  TASK_STATUS_LABELS,
} from '@/constants/task-status';
import styles from './index.module.less';
const colors = {
  failed: 'red',
  succeeded: 'green',
  cancelled: undefined,
  running: 'blue',
  cancelling: 'blue',
};
export default function TaskStatus({
  task,
  variant = 'tag',
}: {
  task: Parameters<typeof taskStatus>[0];
  variant?: 'tag' | 'badge';
}) {
  const status = taskStatus(task);
  const state = taskState(task);
  return variant === 'tag' ? (
    <Tag color={colors[status]}>{TASK_STATUS_LABELS[status]}</Tag>
  ) : (
    <Badge
      className={styles.status}
      status={
        state === 'running'
          ? 'processing'
          : state === 'failed'
          ? 'error'
          : 'default'
      }
      text={
        <Typography.Text type={state === 'cancelled' ? 'secondary' : undefined}>
          {TASK_STATES[state].text}
        </Typography.Text>
      }
    />
  );
}
