import dayjs from 'dayjs';
import {
  CancelDownloadJobDocument,
  TaskDetailsFieldsFragment,
  RetryJobStepDocument,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { useApolloClient } from '@apollo/client';
import { AtomType, currentStep, parseWorkflow } from '@lani/download-workflow';
import { Button, Steps, Popconfirm, Space, Tag, Typography } from 'antd';
import {
  DownOutlined,
  LoadingOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ReactNode, useEffect, useState } from 'react';
import styles from './index.module.less';
import DownloadProgress from './DownloadProgress';

type Job = TaskDetailsFieldsFragment;
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
const atomViews: Record<
  AtomType,
  {
    fields(job: Job): ReactNode;
    cancelling?(job: Job): ReactNode;
  }
> = {
  submitDownload: {
    fields: (job) => (
      <>
        <Field label="种子 Hash">{job.qbtTorrentHash}</Field>
        <Field label="种子名称">{job.torrentTitle}</Field>
      </>
    ),
  },
  download: {
    fields: (job) => <Field label="下载文件根路径">{job.downloadPath}</Field>,
  },
  findVideoFile: {
    fields: (job) => <Field label="视频文件路径">{job.importPath}</Field>,
  },
  importFile: {
    fields: (job) => <Field label="导入文件路径">{job.filePath}</Field>,
  },
  writeMetadata: {
    fields: (job) => <Field label="元数据路径">{job.nfoPath}</Field>,
  },
  refreshPlayer: {
    fields: (job) => (
      <Field label="Jellyfin 剧集 ID">{job.jellyfinEpisodeId}</Field>
    ),
  },
};
const stepStatuses = {
  pending: 'wait',
  running: 'process',
  cancelling: 'process',
  failed: 'error',
  succeeded: 'finish',
  cancelled: 'wait',
} as const;
function StepDetails({
  id,
  open,
  children,
}: {
  id: string;
  open: boolean;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={`${styles.details} ${open ? styles.open : ''}`}
      aria-hidden={!open}
    >
      <div className={styles.detailsContent}>{children}</div>
    </div>
  );
}

function FailureDetails({ job }: { job: Job }) {
  const workflow = parseWorkflow(job.workflow);
  return (
    <div className={styles.failure}>
      <Field label="失败时间">{formatTime(workflow.error?.at)}</Field>
      <Field label="失败原因">{workflow.error?.message}</Field>
    </div>
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
  const hasStarted = workflow.steps.some(
    (item) =>
      item.attempt > 0 ||
      !!item.startedAt ||
      !['pending', 'cancelled'].includes(item.status),
  );
  const defaultExpanded = hasStarted ? `step:${step.id}` : 'job-info';
  const [expanded, setExpanded] = useState<string[]>([defaultExpanded]);
  const [busy, setBusy] = useState(false);
  const client = useApolloClient();
  useEffect(() => {
    setExpanded([defaultExpanded]);
  }, [job.id, defaultExpanded]);
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
  const title = (id: string, label: string, collapsible = true) =>
    collapsible ? (
      <button
        type="button"
        className={styles.stepTitle}
        aria-expanded={expanded.includes(id)}
        aria-controls={`job-${job.id}-step-${id}`}
        onClick={() =>
          setExpanded((ids) =>
            ids.includes(id)
              ? ids.filter((value) => value !== id)
              : [...ids, id],
          )
        }
      >
        {label}
        <DownOutlined
          rotate={expanded.includes(id) ? 180 : 0}
          className={styles.chevron}
        />
      </button>
    ) : (
      label
    );
  return (
    <Steps direction="vertical" className={styles.steps}>
      <Steps.Step
        status="finish"
        title={title('job-info', '任务信息')}
        description={
          <StepDetails
            id={`job-${job.id}-step-job-info`}
            open={expanded.includes('job-info')}
          >
            <Field label="创建时间">{formatTime(job.createdAt)}</Field>
            <Field label="种子地址">{job.torrentLink}</Field>
          </StepDetails>
        }
      />
      {workflow.steps.map((item) => {
        const cancelledHere = workflow.cancellation?.stepId === item.id;
        const failed = workflow.status === 'failed' && step.id === item.id;
        const cancelling = item.status === 'cancelling';
        const cancelled = item.status === 'cancelled';
        const collapsible = item.status === 'succeeded';
        const open = collapsible
          ? expanded.includes(`step:${item.id}`)
          : item.status !== 'pending';
        const suffix = cancelledHere
          ? cancelling
            ? '（取消中）'
            : failed
            ? '（取消失败）'
            : cancelled
            ? '（已取消）'
            : ''
          : '';
        return (
          <Steps.Step
            key={item.id}
            data-current-step={step.id === item.id}
            data-step-id={item.id}
            data-step-status={item.status}
            status={stepStatuses[item.status]}
            className={cancelled ? styles.cancelled : undefined}
            icon={
              item.status === 'running' || cancelling ? (
                <LoadingOutlined className={styles.running} />
              ) : cancelled ? (
                <span className={styles.cancelledIcon} aria-label="已取消" />
              ) : undefined
            }
            title={
              <Space size={8}>
                {title(`step:${item.id}`, item.title + suffix, collapsible)}
                {failed ? (
                  <Button
                    type="link"
                    className={styles.action}
                    icon={<ReloadOutlined />}
                    disabled={busy}
                    onClick={() => void act(false)}
                  >
                    重试
                  </Button>
                ) : item.status === 'running' &&
                  workflow.status === 'running' &&
                  !workflow.cancellation ? (
                  <Popconfirm
                    placement="rightBottom"
                    arrowPointAtCenter
                    // 当前 AntD 箭头高 22px、底部距 12px；中心偏移为 23px。
                    align={{ offset: [4, 23] }}
                    title={
                      <>
                        <div>确认取消任务？</div>
                        <div>取消后需重新发起下载，已下载的文件会保留</div>
                      </>
                    }
                    okText="取消任务"
                    cancelText="返回"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => act(true)}
                  >
                    <Button
                      type="link"
                      icon={<StopOutlined />}
                      danger
                      className={styles.action}
                      disabled={busy}
                    >
                      取消任务
                    </Button>
                  </Popconfirm>
                ) : null}
              </Space>
            }
            description={
              cancelled ? (
                cancelledHere && (
                  <Field label="取消时间">
                    {formatTime(workflow.finishedAt)}
                  </Field>
                )
              ) : item.status !== 'pending' ? (
                <StepDetails
                  id={`job-${job.id}-step-step:${item.id}`}
                  open={open}
                >
                  {failed ? (
                    <FailureDetails job={job} />
                  ) : cancelling ? (
                    atomViews[item.atom].cancelling?.(job) ?? null
                  ) : (
                    <>
                      {atomViews[item.atom].fields(job)}
                      {item.atom === 'download' && (
                        <DownloadProgress
                          id={job.id}
                          enabled={active && open && item.status === 'running'}
                        />
                      )}
                    </>
                  )}
                </StepDetails>
              ) : undefined
            }
          />
        );
      })}
    </Steps>
  );
}
