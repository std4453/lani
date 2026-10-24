import TaskDialog, {
  TaskDialogHeader,
  TaskDialogTabs,
} from '@/components/TaskDialog';
import TaskStatus from '@/components/TaskStatus';
import TaskContent from '@/components/TaskWorkflow/TaskContent';
import EpisodeHeader from './EpisodeHeader';
import styles from './index.module.less';
import { useTaskStates } from '@/utils/useTaskStates';
import { compareEpisodes, formatNumbering } from '@/utils/episode';
import {
  GetEpisodeByIdDocument,
  GetEpisodeNavigationDocument,
  GetTaskByIdDocument,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { extractNode } from '@/utils/graphql';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Alert, Button, Skeleton, Tabs, Tooltip, Typography } from 'antd';
import { useState, useEffect } from 'react';

export default function EpisodeDetailsDialog({
  reject,
  visible,
  input,
}: DialogProps<{ episodeId?: number; taskId?: number }>) {
  const [selection, setSelection] = useState<{
    input: typeof input;
    episodeId: number;
  }>();
  const episodeId =
    selection?.input === input ? selection?.episodeId : input?.episodeId;
  useEffect(() => {
    if (!visible) setSelection(undefined);
  }, [visible]);
  const episodeQuery = useQuery(GetEpisodeByIdDocument, {
    skip: !episodeId || !visible,
    variables: { episodeByIdId: episodeId ?? 0 },
  });
  const taskQuery = useQuery(GetTaskByIdDocument, {
    skip: !!episodeId || !input?.taskId || !visible,
    variables: { id: input?.taskId ?? 0 },
  });
  const query = episodeId ? episodeQuery : taskQuery;
  useApolloPoll({
    refetch: query.refetch,
    pollInterval: 30000,
    enabled: visible && !!(episodeId || input?.taskId),
  });
  const task =
    !episodeId && taskQuery.data?.taskById?.id === input?.taskId
      ? taskQuery.data?.taskById
      : undefined;
  const episode = episodeId
    ? episodeQuery.data?.episodeById?.id === episodeId
      ? episodeQuery.data.episodeById
      : undefined
    : task?.episodeByEpisodeId;
  const navigationQuery = useQuery(GetEpisodeNavigationDocument, {
    skip: !input?.episodeId || !visible,
    variables: { episodeId: input?.episodeId ?? 0 },
    fetchPolicy: 'cache-first',
    onError: (error) => handleError(error, '剧集列表获取失败'),
  });
  const episodes =
    navigationQuery.data?.episodeById?.id === input?.episodeId
      ? (
          extractNode(
            navigationQuery.data?.episodeById?.seasonBySeasonId
              ?.episodesBySeasonId,
          ) ?? []
        ).sort(compareEpisodes)
      : [];
  const position = episodes.findIndex((item) => item.id === episodeId);
  const previous = position > 0 ? episodes[position - 1] : undefined;
  const next = position >= 0 ? episodes[position + 1] : undefined;
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
    setActiveTask(
      episodeId === input?.episodeId && input?.taskId
        ? `${input.taskId}`
        : undefined,
    );
  }, [episodeId, input?.episodeId, input?.taskId, visible]);
  const selectedTask = activeTask ?? (tasks[0] ? `${tasks[0].id}` : undefined);

  return (
    <TaskDialog
      visible={visible}
      onCancel={reject}
      titleActions={
        input?.episodeId && (
          <>
            {[
              { target: previous, label: '上一集', icon: <LeftOutlined /> },
              { target: next, label: '下一集', icon: <RightOutlined /> },
            ].map(({ target, label, icon }) => (
              <Tooltip key={label} title={label}>
                <Button
                  type="text"
                  aria-label={label}
                  icon={icon}
                  disabled={!target}
                  onClick={() => {
                    if (target) setSelection({ input, episodeId: target.id });
                  }}
                />
              </Tooltip>
            ))}
          </>
        )
      }
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
          message={episodeId ? '剧集加载失败' : '任务加载失败'}
        />
      ) : !episode && !task ? (
        <Alert type="info" message={episodeId ? '剧集不存在' : '任务不存在'} />
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
            <TaskDialogTabs
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
            </TaskDialogTabs>
          ) : (
            <div className={styles.empty}>无任务</div>
          )}
        </>
      )}
    </TaskDialog>
  );
}
export const useEpisodeDetailsDialog = createUseDialog(EpisodeDetailsDialog);
