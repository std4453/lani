import DownloadWorkflowView, {
  WorkflowStatusTag,
} from '@/components/DownloadWorkflow';
import LegacyDownloadJob from '@/components/DownloadWorkflow/LegacyDownloadJob';
import EpisodeHeader from './EpisodeHeader';
import { useDownloadJobStates } from '@/utils/useDownloadJobStates';
import { formatNumbering } from '@/utils/episode';
import { DownloadStatus, GetEpisodeByIdDocument } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { Modal, Spin, Tabs, Typography } from 'antd';
import { useMemo, useState, useEffect } from 'react';

export default function EpisodeDetailsDialog({
  reject,
  visible,
  input,
}: DialogProps<{ episodeId: number }>) {
  const { data, loading, startPolling, stopPolling, refetch } = useQuery(
    GetEpisodeByIdDocument,
    {
      skip: !input?.episodeId || !visible,
      variables: {
        episodeByIdId: input?.episodeId ?? 0,
      },
    },
  );
  useApolloPoll({
    startPolling,
    stopPolling,
    refetch,
    pollInterval: 30000,
    enabled: visible && !!input?.episodeId,
  });
  const jobs = useMemo(
    () => extractNode(data?.episodeById?.downloadJobsByEpisodeId) ?? [],
    [data],
  );

  const states = useDownloadJobStates(
    jobs.map((job) => job.id),
    visible,
  );
  const [activeJob, setActiveJob] = useState<string>();
  useEffect(() => {
    setActiveJob(undefined);
  }, [input?.episodeId]);
  const selectedJob = activeJob ?? (jobs[0] ? `${jobs[0].id}` : undefined);

  return (
    <Modal
      visible={visible}
      onCancel={reject}
      footer={false}
      title={
        data?.episodeById
          ? `#${formatNumbering(data.episodeById.numbering)} - ${
              data.episodeById.title
            }`
          : '剧集详情'
      }
      destroyOnClose={true}
      width={800}
    >
      <Spin spinning={loading}>
        <EpisodeHeader episode={data?.episodeById ?? undefined} />
        {jobs.length > 0 ? (
          <Tabs
            activeKey={selectedJob}
            onChange={setActiveJob}
            tabBarExtraContent={{
              left: <div style={{ marginRight: 16 }}>下载任务</div>,
              right: (
                <Typography.Text type="secondary">自动刷新中</Typography.Text>
              ),
            }}
          >
            {jobs.map((job) => (
              <Tabs.TabPane
                key={job.id}
                tab={
                  <div
                    style={{
                      display: 'flex',
                    }}
                  >
                    #{job.id}
                    <WorkflowStatusTag job={job} />
                  </div>
                }
              >
                <div
                  style={{
                    overflow: 'auto',
                    maxHeight: 800,
                  }}
                >
                  {job.workflow ? (
                    <DownloadWorkflowView
                      job={job}
                      active={visible && selectedJob === `${job.id}`}
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
                </div>
              </Tabs.TabPane>
            ))}
          </Tabs>
        ) : (
          '无下载任务'
        )}
      </Spin>
    </Modal>
  );
}

export const useEpisodeDetailsDialog = createUseDialog(EpisodeDetailsDialog);
