import DownloadWorkflowView from '@/components/DownloadWorkflow';
import LegacyDownloadJob from '@/components/DownloadWorkflow/LegacyDownloadJob';
import EpisodeDetailsDialog from '@/components/EpisodeDetailsDialog';
import { DownloadStatus, GetTaskByIdDocument } from '@/generated/types';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { useDownloadJobStates } from '@/utils/useDownloadJobStates';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { Alert, Modal, Spin } from 'antd';

/** 调用方只提供任务 ID，内部定位剧集并选中对应下载任务。 */
export default function TaskDetailsDialog(
  props: DialogProps<{ jobId: number }>,
) {
  const { input, visible, reject, resolve } = props;
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
  const job =
    data?.downloadJobById?.id === input?.jobId
      ? data?.downloadJobById
      : undefined;
  const states = useDownloadJobStates(
    job && !job.episodeId ? [job.id] : [],
    visible,
    2000,
  );
  if (job?.episodeId)
    return (
      <EpisodeDetailsDialog
        input={{ episodeId: job.episodeId, jobId: job.id }}
        visible={visible}
        reject={reject}
        resolve={resolve}
      />
    );
  return (
    <Modal
      visible={visible}
      onCancel={reject}
      footer={false}
      title="下载任务详情"
      width={800}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {error ? (
          <Alert type="error" message="任务加载失败" />
        ) : job ? (
          <>
            <Alert
              type="info"
              message="关联剧集不存在"
              style={{ marginBottom: 16 }}
            />
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
                    (!job.isCancelled &&
                      job.status !== DownloadStatus.Available),
                }}
                jobIdToStatusMap={{}}
              />
            )}
          </>
        ) : (
          !loading && <Alert type="info" message="任务不存在" />
        )}
      </Spin>
    </Modal>
  );
}
export const useTaskDetailsDialog = createUseDialog(TaskDetailsDialog);
