import DownloadWorkflowView from '@/components/DownloadWorkflow';
import LegacyDownloadJob from '@/components/DownloadWorkflow/LegacyDownloadJob';
import EpisodeHeader from '@/components/EpisodeDetailsDialog/EpisodeHeader';
import {
  DownloadStatus,
  GetTaskByIdDocument,
  GetTaskEpisodeDocument,
  TaskDetailsFieldsFragment,
  TaskType,
} from '@/generated/types';
import { formatNumbering } from '@/utils/episode';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { useDownloadJobStates } from '@/utils/useDownloadJobStates';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { Alert, Modal, Space, Spin, Tag } from 'antd';
import { ComponentType, ReactNode } from 'react';

export const taskTypeLabels: Record<TaskType, string> = {
  [TaskType.Download]: '下载',
};
export function TaskTypeTag({ type }: { type: TaskType }) {
  return <Tag color="geekblue">{taskTypeLabels[type]}</Tag>;
}
interface PresentationProps {
  job: TaskDetailsFieldsFragment;
  active: boolean;
  children(presentation: { title: ReactNode; header: ReactNode }): ReactNode;
}
function DownloadPresentation({ job, active, children }: PresentationProps) {
  const available = useForegroundOnline();
  const { data, loading, error, refetch } = useQuery(GetTaskEpisodeDocument, {
    variables: { id: job.episodeId ?? 0 },
    skip: !active || !available || !job.episodeId,
    fetchPolicy: 'cache-and-network',
  });
  useApolloPoll({
    refetch,
    pollInterval: 30000,
    enabled: active && !!job.episodeId,
  });
  const episode =
    data?.episodeById?.id === job.episodeId ? data?.episodeById : undefined;
  return (
    <>
      {children({
        title: `下载任务 #${job.id}${
          episode
            ? ` · #${formatNumbering(episode.numbering)} - ${episode.title}`
            : ''
        }`,
        header: (
          <Spin spinning={loading}>
            {error ? (
              <Alert type="error" message="剧集信息加载失败" />
            ) : episode ? (
              <EpisodeHeader episode={episode} />
            ) : (
              !loading && <Alert type="info" message="关联剧集不存在" />
            )}
          </Spin>
        ),
      })}
    </>
  );
}
const presentations: Record<TaskType, ComponentType<PresentationProps>> = {
  [TaskType.Download]: DownloadPresentation,
};

/** 调用方只提供任务 ID；类型和展示信息由弹窗自行读取。 */
export default function TaskDetailsDialog({
  input,
  visible,
  reject,
}: DialogProps<{ jobId: number }>) {
  const available = useForegroundOnline();
  const { data, loading, error, refetch } = useQuery(GetTaskByIdDocument, {
    variables: { id: input?.jobId ?? 0 },
    skip: !visible || !available || !input?.jobId,
    fetchPolicy: 'cache-and-network',
  });
  useApolloPoll({
    refetch,
    pollInterval: 30000,
    enabled: visible && !!input?.jobId,
  });
  const states = useDownloadJobStates(
    input?.jobId ? [input.jobId] : [],
    visible,
  );
  const job =
    data?.downloadJobById?.id === input?.jobId
      ? data?.downloadJobById
      : undefined;
  if (!job)
    return (
      <Modal
        visible={visible}
        onCancel={reject}
        footer={false}
        title="任务详情"
        width={800}
        destroyOnClose
      >
        <Spin spinning={loading}>
          {error ? (
            <Alert type="error" message="任务加载失败" />
          ) : (
            !loading && <Alert type="info" message="任务不存在" />
          )}
        </Spin>
      </Modal>
    );
  const Presentation = presentations[job.type];
  return (
    <Presentation job={job} active={visible}>
      {({ title, header }) => (
        <Modal
          visible={visible}
          onCancel={reject}
          footer={false}
          title={title}
          width={800}
          destroyOnClose
        >
          {header}
          <Space style={{ marginBottom: 16 }}>
            <span>任务类型</span>
            <TaskTypeTag type={job.type} />
          </Space>
          {job.workflow ? (
            <DownloadWorkflowView
              job={job}
              active={visible}
              refresh={states.refetch}
            />
          ) : (
            <LegacyDownloadJob
              job={{
                ...job,
                isFailed:
                  job.isFailed ||
                  (!job.isCancelled && job.status !== DownloadStatus.Available),
              }}
              jobIdToStatusMap={{}}
            />
          )}
        </Modal>
      )}
    </Presentation>
  );
}
export const useTaskDetailsDialog = createUseDialog(TaskDetailsDialog);
