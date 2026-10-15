import { Badge, Tag, Typography } from 'antd';
import {
  taskStatus,
  jobState,
  jobStates,
  taskStatusLabels,
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
  job,
  variant = 'tag',
}: {
  job: Parameters<typeof taskStatus>[0];
  variant?: 'tag' | 'badge';
}) {
  const status = taskStatus(job);
  const state = jobState(job);
  return variant === 'tag' ? (
    <Tag color={colors[status]}>{taskStatusLabels[status]}</Tag>
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
          {jobStates[state].text}
        </Typography.Text>
      }
    />
  );
}
