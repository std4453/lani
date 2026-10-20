import dayjs from 'dayjs';
import { TaskDetailsFieldsFragment } from '@/generated/types';
import { TASK_TYPE_LABELS } from '@/utils/task-episodes';
import Field from './Field';

export default function TaskInfo({
  task,
}: {
  task: Pick<TaskDetailsFieldsFragment, 'createdAt' | 'type' | 'torrentLink'>;
}) {
  return (
    <>
      <Field label="创建时间">
        {task.createdAt
          ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss')
          : '-'}
      </Field>
      <Field label="类型">{TASK_TYPE_LABELS[task.type]}</Field>
      {['DOWNLOAD', 'BATCH_DOWNLOAD', 'BATCH_IMPORT'].includes(task.type) && (
        <Field label="种子地址">{task.torrentLink}</Field>
      )}
    </>
  );
}
