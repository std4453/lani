import { GetTaskByIdDocument } from '@/generated/types';
import { DialogProps } from '@/utils/useDialog';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { useTaskStates } from '@/utils/useTaskStates';
import { commonDirectory } from '@/utils/task-episodes';
import { formatNumbering } from '@/utils/episode';
import { useQuery } from '@apollo/client';
import { Alert, Modal, Skeleton, Typography } from 'antd';
import TaskContent from '../TaskWorkflow/TaskContent';
import Field from '../TaskWorkflow/Field';
import styles from './index.module.less';

export default function BatchImportDetailsDialog({
  visible,
  input,
  reject,
}: DialogProps<{ taskId: number }>) {
  const available = useForegroundOnline();
  const query = useQuery(GetTaskByIdDocument, {
    variables: { id: input?.taskId ?? 0 },
    skip: !visible || !available || !input?.taskId,
  });
  useApolloPoll({
    refetch: query.refetch,
    enabled: visible && !!input?.taskId,
    pollInterval: 30000,
  });
  const states = useTaskStates(input ? [input.taskId] : [], visible);
  const task = query.data?.taskById;
  const entries =
    task?.taskEpisodesByTaskId?.nodes.filter(
      (e): e is NonNullable<typeof e> => !!e,
    ) ?? [];
  const season = entries.find((e) => e.episodeByEpisodeId?.seasonBySeasonId)
    ?.episodeByEpisodeId?.seasonBySeasonId;
  const root = commonDirectory(
    entries.flatMap((e) => (e.sourcePath ? [e.sourcePath] : [])),
  );
  const running =
    task?.workflow && ['running', 'cancelling'].includes(task.workflow.status);
  return (
    <Modal
      visible={visible}
      onCancel={reject}
      footer={false}
      width={900}
      destroyOnClose
      className={styles.dialog}
      title={`批量导入 #${input?.taskId ?? ''}`}
      closeIcon={
        <>
          <span className={styles.hint}>
            {running ? '后台执行中，可关闭弹窗' : ''}
          </span>
          ×
        </>
      }
    >
      {query.loading && !task ? (
        <Skeleton active />
      ) : query.error ? (
        <Alert type="error" message="任务加载失败" />
      ) : !task ? (
        <Alert type="info" message="任务不存在" />
      ) : (
        <>
          <div className={styles.header}>
            <Field label="季度">
              {season ? (
                <Typography.Link
                  href={`/season/${season.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {season.title}
                </Typography.Link>
              ) : (
                '关联季度不存在'
              )}
            </Field>
            <Field label="导入目录">{root}</Field>
            <div className={styles.entries}>
              {entries.map((entry) => (
                <div key={entry.id} className={styles.entry}>
                  <span>
                    {entry.sourcePath?.slice(
                      root === '/' ? 1 : root.length + 1,
                    ) ?? '-'}
                  </span>
                  <span>
                    → #{formatNumbering(entry.episodeByEpisodeId?.numbering)} -{' '}
                    {entry.episodeByEpisodeId?.title ?? '剧集已删除'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <TaskContent task={task} active={visible} refresh={states.refetch} />
        </>
      )}
    </Modal>
  );
}
