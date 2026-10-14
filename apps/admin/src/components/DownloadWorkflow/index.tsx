import dayjs from 'dayjs';
import {
  CancelDownloadJobDocument,
  GetActiveDownloadJobStatusDocument,
  GetEpisodeByIdQuery,
  RetryJobStepDocument,
} from '@/generated/types';
import { ExtractNode } from '@/utils/graphql';
import { handleError } from '@/utils/error';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { useApolloClient, useQuery } from '@apollo/client';
import {
  AtomType,
  currentStep,
  parseWorkflow,
  WorkflowStep,
} from '@lani/download-workflow';
import {
  Button,
  Collapse,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
} from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ReactNode, useEffect, useState } from 'react';
import styles from './index.module.less';

type Job = NonNullable<
  ExtractNode<
    NonNullable<GetEpisodeByIdQuery['episodeById']>['downloadJobsByEpisodeId']
  >
>;
const formatTime = (value?: string) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
const stateLabels = {
  pending: '待执行',
  running: '进行中',
  cancelling: '取消中',
  failed: '失败',
  succeeded: '成功',
  cancelled: '已取消',
};
export function WorkflowStatusTag({
  job,
}: {
  job: {
    workflow?: unknown;
    isFailed: boolean;
    isCancelled: boolean;
    status: string;
  };
}) {
  const status = job.workflow
    ? parseWorkflow(job.workflow).status
    : job.isCancelled
    ? 'cancelled'
    : job.isFailed
    ? 'failed'
    : job.status === 'AVAILABLE'
    ? 'succeeded'
    : 'failed';
  return (
    <Tag
      color={
        status === 'failed'
          ? 'red'
          : status === 'succeeded'
          ? 'green'
          : status === 'cancelled'
          ? undefined
          : 'blue'
      }
    >
      {stateLabels[status]}
    </Tag>
  );
}
function Field({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className={styles.field}>
      <Typography.Text type="secondary">{label}：</Typography.Text>
      <Typography.Text copyable={typeof children === 'string' && !!children}>
        {children || '-'}
      </Typography.Text>
    </div>
  );
}
const fields: Record<AtomType, (job: Job) => ReactNode> = {
  submitDownload: (job) => (
    <>
      <Field label="种子 Hash">{job.qbtTorrentHash}</Field>
      <Field label="种子名称">{job.torrentTitle}</Field>
    </>
  ),
  download: (job) => <Field label="下载文件根路径">{job.downloadPath}</Field>,
  findVideoFile: (job) => <Field label="视频文件路径">{job.importPath}</Field>,
  importFile: (job) => <Field label="导入文件路径">{job.filePath}</Field>,
  writeMetadata: (job) => <Field label="元数据路径">{job.nfoPath}</Field>,
  refreshPlayer: (job) => (
    <Field label="Jellyfin 剧集 ID">{job.jellyfinEpisodeId}</Field>
  ),
};
function DownloadProgress({ id, enabled }: { id: number; enabled: boolean }) {
  const available = useForegroundOnline();
  const query = useQuery(GetActiveDownloadJobStatusDocument, {
    variables: { jobIds: [id] },
    skip: !enabled || !available,
    fetchPolicy: 'network-only',
  });
  useApolloPoll({ refetch: query.refetch, pollInterval: 2000, enabled });
  const progress = query.data?.getActiveDownloadJobStatus[0];
  if (!progress || !enabled) return null;
  const total = Number(progress.total),
    downloaded = Number(progress.downloaded);
  return (
    <div>
      <Progress
        percent={
          total > 0
            ? Math.min(100, Math.round((downloaded / total) * 1000) / 10)
            : 0
        }
        status="active"
      />
      <Typography.Text type="secondary">
        {(progress.speed / 1024 / 1024).toFixed(2)} MB/s
      </Typography.Text>
    </div>
  );
}
function StepTitle({ step }: { step: WorkflowStep }) {
  return (
    <Space>
      <span>{step.title}</span>
      <Tag
        color={
          step.status === 'failed'
            ? 'red'
            : step.status === 'succeeded'
            ? 'green'
            : undefined
        }
      >
        {stateLabels[step.status]}
      </Tag>
      {(step.status === 'running' || step.status === 'cancelling') && (
        <LoadingOutlined className={styles.running} />
      )}
    </Space>
  );
}
export default function DownloadWorkflowView({
  job,
  active,
  refresh,
}: {
  job: Job;
  active: boolean;
  refresh(): Promise<unknown>;
}) {
  const workflow = parseWorkflow(job.workflow);
  const step = currentStep(workflow);
  const [expanded, setExpanded] = useState<string[]>([step.id]);
  const [busy, setBusy] = useState(false);
  const client = useApolloClient();
  useEffect(() => {
    setExpanded([step.id]);
  }, [job.id, step.id]);
  const act = async (cancel: boolean) => {
    setBusy(true);
    try {
      await client.mutate({
        mutation: cancel ? CancelDownloadJobDocument : RetryJobStepDocument,
        variables: { jobId: job.id },
      });
      await refresh();
    } catch (error) {
      handleError(error);
    } finally {
      setBusy(false);
    }
  };
  const cancel = () =>
    Modal.confirm({
      title: '取消此任务？',
      content: '取消不可撤回。将移除下载器条目，保留已下载数据和已落地文件。',
      okText: '取消任务',
      cancelText: '返回',
      onOk: () => act(true),
    });
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <Field label="创建时间">{formatTime(job.createdAt)}</Field>
        <Field label="种子地址">{job.torrentLink}</Field>
      </div>
      <Space>
        {workflow.status === 'failed' && (
          <Button loading={busy} onClick={() => void act(false)}>
            重试
          </Button>
        )}
        {!workflow.cancellation &&
          workflow.status !== 'succeeded' &&
          workflow.status !== 'cancelled' && (
            <Button danger disabled={busy} onClick={cancel}>
              取消任务
            </Button>
          )}
      </Space>
      <Collapse
        activeKey={expanded}
        onChange={(keys) =>
          setExpanded(typeof keys === 'string' ? [keys] : keys)
        }
        style={{ width: '100%' }}
      >
        {workflow.steps.map((item) => (
          <Collapse.Panel key={item.id} header={<StepTitle step={item} />}>
            <div>
              {fields[item.atom](job)}
              <Field label="开始时间">{formatTime(item.startedAt)}</Field>
              <Field label="结束时间">{formatTime(item.finishedAt)}</Field>
            </div>
            {workflow.error?.stepId === item.id && (
              <Typography.Paragraph type="danger">
                {workflow.error.operation === 'cancel' ? '取消操作失败：' : ''}
                {workflow.error.message}
              </Typography.Paragraph>
            )}
            {workflow.cancellation?.stepId === item.id && (
              <Typography.Paragraph type="secondary">
                在此步骤取消 · {formatTime(workflow.cancellation.requestedAt)}
              </Typography.Paragraph>
            )}
            {item.atom === 'download' && (
              <DownloadProgress
                id={job.id}
                enabled={
                  active &&
                  expanded.includes(item.id) &&
                  item.status === 'running' &&
                  workflow.status === 'running'
                }
              />
            )}
          </Collapse.Panel>
        ))}
      </Collapse>
    </Space>
  );
}
