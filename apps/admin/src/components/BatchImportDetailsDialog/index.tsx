import TaskDialog, {
  TaskDialogHeader,
  TaskDialogTabs,
} from '@/components/TaskDialog';
import ProDescriptions from '@ant-design/pro-descriptions';
import { GetTaskByIdDocument, TaskType } from '@/generated/types';
import { DialogProps } from '@/utils/useDialog';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { useTaskStates } from '@/utils/useTaskStates';
import { commonDirectory, taskImportEntries } from '@/utils/task-episodes';
import { formatNumbering } from '@/utils/episode';
import { useQuery } from '@apollo/client';
import { Alert, Skeleton, Table, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import TaskContent from '../TaskWorkflow/TaskContent';
import styles from './index.module.less';

export default function BatchImportDetailsDialog({
  visible,
  input,
  reject,
}: DialogProps<{ taskId: number }>) {
  const [tab, setTab] = useState('workflow');
  useEffect(() => setTab('workflow'), [input?.taskId, visible]);
  const query = useQuery(GetTaskByIdDocument, {
    variables: { id: input?.taskId ?? 0 },
    skip: !visible || !input?.taskId,
  });
  useApolloPoll({
    refetch: query.refetch,
    enabled: visible && !!input?.taskId,
    pollInterval: 30000,
  });
  const states = useTaskStates(input ? [input.taskId] : [], visible);
  const task =
    query.data?.taskById?.id === input?.taskId
      ? query.data?.taskById
      : undefined;
  const download = task?.type === TaskType.BatchDownload;
  const entriesLabel = download ? '文件列表' : '导入列表';
  const entries = taskImportEntries(task);
  const season = entries.find((e) => e.episodeByEpisodeId?.seasonBySeasonId)
    ?.episodeByEpisodeId?.seasonBySeasonId;
  const root = commonDirectory(
    entries.flatMap((e) => (e.sourcePath ? [e.sourcePath] : [])),
  );
  const running =
    task?.workflow && ['running', 'cancelling'].includes(task.workflow.status);
  return (
    <TaskDialog
      visible={visible}
      onCancel={reject}
      footer={false}
      width={900}
      destroyOnClose
      title={
        <Typography.Text
          copyable={input ? { text: String(input.taskId) } : false}
        >
          {download ? '整季下载' : '批量导入'} #{input?.taskId ?? ''}
        </Typography.Text>
      }
      running={!!running}
    >
      {query.loading && !task ? (
        <Skeleton active />
      ) : query.error ? (
        <Alert type="error" message="任务加载失败" />
      ) : !task ? (
        <Alert type="info" message="任务不存在" />
      ) : (
        <>
          <TaskDialogHeader>
            <ProDescriptions
              colon={false}
              column={1}
              className={styles.summary}
            >
              <ProDescriptions.Item label="季度">
                {season ? (
                  <Typography.Text copyable={{ text: season.title }}>
                    <Typography.Link
                      href={`/season/${season.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {season.title}
                    </Typography.Link>
                  </Typography.Text>
                ) : (
                  '关联季度不存在'
                )}
              </ProDescriptions.Item>
              {!download && (
                <ProDescriptions.Item label="导入目录">
                  <Typography.Text copyable>{root}</Typography.Text>
                </ProDescriptions.Item>
              )}
            </ProDescriptions>
          </TaskDialogHeader>
          <TaskDialogTabs activeKey={tab} onChange={setTab}>
            <Tabs.TabPane key="workflow" tab="任务流程">
              <TaskContent
                task={task}
                active={visible && tab === 'workflow'}
                refresh={states.refetch}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="entries" tab={entriesLabel}>
              <div
                className={styles.tableScroll}
                role="region"
                aria-label={entriesLabel}
                tabIndex={0}
              >
                <Table
                  size="small"
                  rowKey="id"
                  pagination={false}
                  tableLayout="fixed"
                  dataSource={entries}
                  columns={[
                    {
                      title: '源文件',
                      key: 'source',
                      width: '60%',
                      render: (_, entry) =>
                        entry.sourcePath ? (
                          <Typography.Text
                            title={entry.sourcePath}
                            copyable={{ text: entry.sourcePath }}
                          >
                            {entry.sourcePath.slice(
                              root === '/'
                                ? entry.sourcePath.startsWith('/')
                                  ? 1
                                  : 0
                                : root.length + 1,
                            )}
                          </Typography.Text>
                        ) : (
                          '-'
                        ),
                    },
                    {
                      title: '剧集',
                      key: 'episode',
                      width: '40%',
                      render: (_, entry) => {
                        const episode = entry.episodeByEpisodeId;
                        const label = episode
                          ? `#${formatNumbering(episode.numbering)} - ${
                              episode.title
                            }`
                          : '剧集已删除';
                        return (
                          <Typography.Text copyable>{label}</Typography.Text>
                        );
                      },
                    },
                  ]}
                />
              </div>
            </Tabs.TabPane>
          </TaskDialogTabs>
        </>
      )}
    </TaskDialog>
  );
}
