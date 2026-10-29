import dayjs from 'dayjs';
import { TaskDetailsFieldsFragment } from '@/generated/types';
import { TASK_TYPE_LABELS } from '@/utils/task-episodes';
import Field from './Field';

export default function TaskInfo({
  task,
}: {
  task: Pick<
    TaskDetailsFieldsFragment,
    'createdAt' | 'type' | 'torrentLink'
  > & {
    isSmartDownload?: boolean;
    isCancelled?: boolean;
    workflow?: TaskDetailsFieldsFragment['workflow'];
  };
}) {
  return (
    <>
      <Field label="创建时间">
        {task.createdAt
          ? dayjs(task.createdAt).format('YYYY-MM-DD HH:mm:ss')
          : '-'}
      </Field>
      <Field label="类型">
        {TASK_TYPE_LABELS[task.type]}
        {task.type === 'DOWNLOAD' && task.isSmartDownload ? '（智能下载）' : ''}
      </Field>
      {(task.isCancelled || task.workflow?.cancellation) && (
        <Field label="取消原因">
          {task.workflow?.cancellation?.reason ?? '用户手动取消'}
        </Field>
      )}
      {['DOWNLOAD', 'BATCH_DOWNLOAD'].includes(task.type) && (
        <Field label="种子地址">{task.torrentLink}</Field>
      )}
    </>
  );
}
