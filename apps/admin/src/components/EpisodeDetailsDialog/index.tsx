import { TaskDialogHeader, TaskDialogTabs } from '@/components/TaskDialog';
import EnhancedDialog from '@/components/EnhancedDialog';
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
import { useApolloClient, useQuery } from '@apollo/client';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Alert, Skeleton, Tabs, Typography } from 'antd';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';

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
  const client = useApolloClient();
  const previousId = previous?.id;
  const nextId = next?.id;
  const previousButton = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const navigate = (id: number) => {
    // 边界按钮即将禁用时，把焦点留在弹窗内，继续响应方向键和 Esc。
    if (
      (id === episodes[0]?.id &&
        document.activeElement === previousButton.current) ||
      (id === episodes[episodes.length - 1]?.id &&
        document.activeElement === nextButton.current)
    ) {
      (document.activeElement as HTMLElement)
        .closest<HTMLElement>('.ant-modal-wrap')
        ?.focus();
    }
    setSelection({ input, episodeId: id });
  };
  useEffect(() => {
    if (!visible || !input?.episodeId) return;
    for (const id of [previousId, nextId]) {
      if (id === undefined) continue;
      void client
        .query({
          query: GetEpisodeByIdDocument,
          variables: { episodeByIdId: id },
          fetchPolicy: 'cache-first',
        })
        // 预加载失败由切换后的详情查询重试并展示错误。
        .catch(() => undefined);
    }
  }, [client, visible, input?.episodeId, previousId, nextId]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !visible ||
      !input?.episodeId ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !(event.target instanceof HTMLElement) ||
      event.target.closest(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="tablist"], [role="slider"], [role="combobox"]',
      ) ||
      event.target.closest('.ant-modal-wrap') !== event.currentTarget
    )
      return;
    const target =
      event.key === 'ArrowLeft'
        ? previous
        : event.key === 'ArrowRight'
        ? next
        : undefined;
    if (target) {
      event.preventDefault();
      navigate(target.id);
    }
  };
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
    <EnhancedDialog
      visible={visible}
      onCancel={reject}
      wrapProps={{ onKeyDownCapture: onKeyDown }}
      titleActions={
        input?.episodeId && (
          <>
            {[
              {
                target: previous,
                label: '上一集',
                icon: <LeftOutlined />,
                ref: previousButton,
              },
              {
                target: next,
                label: '下一集',
                icon: <RightOutlined />,
                ref: nextButton,
              },
            ].map(({ target, label, icon, ref }) => (
              <button
                key={label}
                ref={ref}
                type="button"
                aria-label={label}
                disabled={!target}
                onClick={() => {
                  if (target) navigate(target.id);
                }}
              >
                {icon}
              </button>
            ))}
          </>
        )
      }
      footer={false}
      titleHint={
        tasks.some((task) =>
          ['running', 'cancelling'].includes(task.workflow?.status ?? ''),
        ) && '后台执行中，可关闭弹窗'
      }
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
    </EnhancedDialog>
  );
}
export const useEpisodeDetailsDialog = createUseDialog(EpisodeDetailsDialog);
