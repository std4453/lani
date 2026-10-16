import TaskDialog, { TaskDialogHeader } from '@/components/TaskDialog';
import TaskStatus from '@/components/TaskStatus';
import TaskContent from '@/components/TaskWorkflow/TaskContent';
import EpisodeHeader from './EpisodeHeader';
import styles from './index.module.less';
import { useTaskStates } from '@/utils/useTaskStates';
import { formatNumbering } from '@/utils/episode';
import { GetEpisodeByIdDocument, GetTaskByIdDocument } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { Alert, Skeleton, Tabs, Typography } from 'antd';
import { useState, useEffect } from 'react';

export default function EpisodeDetailsDialog({
  reject,
  visible,
  input,
}: DialogProps<{ episodeId?: number; taskId?: number }>) {
  const available = useForegroundOnline();
  const episodeQuery = useQuery(GetEpisodeByIdDocument, {
    skip: !input?.episodeId || !visible || !available,
    variables: { episodeByIdId: input?.episodeId ?? 0 },
  });
  const taskQuery = useQuery(GetTaskByIdDocument, {
    skip: !!input?.episodeId || !input?.taskId || !visible || !available,
    variables: { id: input?.taskId ?? 0 },
  });
  const query = input?.episodeId ? episodeQuery : taskQuery;
  useApolloPoll({
    refetch: query.refetch,
    pollInterval: 30000,
    enabled: visible && !!(input?.episodeId || input?.taskId),
  });
  const task =
    taskQuery.data?.taskById?.id === input?.taskId
      ? taskQuery.data?.taskById
      : undefined;
  const episode = input?.episodeId
    ? episodeQuery.data?.episodeById?.id === input.episodeId
      ? episodeQuery.data.episodeById
      : undefined
    : task?.episodeByEpisodeId;
  const tasks = episode
    ? extractNode(episode.tasksByEpisodeId) ?? []
    : task
    ? [task]
    : [];
  const states = useTaskStates(
    tasks.map((task) => task.id),
    visible,
    2000,
  );
  const [activeTask, setActiveTask] = useState<string>();
  useEffect(() => {
    setActiveTask(input?.taskId ? `${input.taskId}` : undefined);
  }, [input?.episodeId, input?.taskId]);
  const selectedTask = activeTask ?? (tasks[0] ? `${tasks[0].id}` : undefined);

  return (
    <TaskDialog
      visible={visible}
      onCancel={reject}
      footer={false}
      running={tasks.some((task) =>
        ['running', 'cancelling'].includes(task.workflow?.status ?? ''),
      )}
      title={
        episode
          ? `#${formatNumbering(episode.numbering)} - ${episode.title}`
          : '剧集详情'
      }
      destroyOnClose
      width={800}
    >
      {!episode && !task && query.loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : query.error ? (
        <Alert
          type="error"
          message={input?.taskId ? '任务加载失败' : '剧集加载失败'}
        />
      ) : !episode && !task ? (
        <Alert
          type="info"
          message={input?.taskId ? '任务不存在' : '剧集不存在'}
        />
      ) : (
        <>
          <TaskDialogHeader>
            {episode ? (
              <EpisodeHeader episode={episode} />
            ) : (
              <Alert type="info" message="关联剧集不存在" />
            )}
          </TaskDialogHeader>
          {tasks.length > 0 ? (
            <Tabs
              className={styles.taskTabs}
              tabBarGutter={16}
              activeKey={selectedTask}
              onChange={setActiveTask}
              tabBarExtraContent={{
                left: <div style={{ marginRight: 16 }}>任务</div>,
                right: (
                  <Typography.Text type="secondary">自动刷新中</Typography.Text>
                ),
              }}
            >
              {tasks.map((task) => (
                <Tabs.TabPane
                  key={task.id}
                  tab={
                    <div style={{ display: 'flex', gap: 8 }}>
                      #{task.id}
                      <TaskStatus task={task} />
                    </div>
                  }
                >
                  <TaskContent
                    task={task}
                    active={visible && selectedTask === `${task.id}`}
                    refresh={states.refetch}
                  />
                </Tabs.TabPane>
              ))}
            </Tabs>
          ) : (
            <div className={styles.empty}>无任务</div>
          )}
        </>
      )}
    </TaskDialog>
  );
}
export const useEpisodeDetailsDialog = createUseDialog(EpisodeDetailsDialog);
