import dayjs from 'dayjs';
import {
  CancelTaskDocument,
  TaskDetailsFieldsFragment,
  RetryTaskDocument,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { useApolloClient } from '@apollo/client';
import { Button, Steps, Popconfirm, Space } from 'antd';
import {
  DownOutlined,
  LoadingOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ReactNode, useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import Field from './Field';
import TaskInfo from './TaskInfo';
import { atomViews } from './atoms';
import { parseWorkflow } from '@lani/workflow';
import { legacyWorkflow } from './legacy-compat';

type Task = TaskDetailsFieldsFragment;
const formatTime = (value?: string) =>
  value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
const cancellationSuffix: Partial<
  Record<import('@lani/workflow').StepStatus, string>
> = {
  cancelling: '（取消中）',
  failed: '（取消失败）',
  cancelled: '（已取消）',
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

function FailureDetails({
  error,
}: {
  error?: { at?: string; message?: string };
}) {
  return (
    <div className={styles.failure}>
      <Field label="失败时间">{formatTime(error?.at)}</Field>
      <Field label="失败原因">{error?.message}</Field>
    </div>
  );
}

export default function TaskWorkflowView({
  task,
  active,
  refresh,
}: {
  task: Task;
  active: boolean;
  refresh(): Promise<unknown>;
}) {
  const savedWorkflow = task.workflow
    ? parseWorkflow(task.workflow)
    : undefined;
  const workflow = savedWorkflow ?? legacyWorkflow(task);
  const hasStarted =
    !savedWorkflow ||
    savedWorkflow.steps.some(
      (step) =>
        step.attempt > 0 ||
        !!step.startedAt ||
        !['pending', 'cancelled'].includes(step.status),
    );
  const defaultExpanded = hasStarted
    ? `step:${workflow.currentStepId}`
    : 'task-info';
  const [expanded, setExpanded] = useState<string[]>([defaultExpanded]);
  const previous = useRef({ taskId: task.id, defaultExpanded });
  const [busy, setBusy] = useState(false);
  const client = useApolloClient();
  useEffect(() => {
    const last = previous.current;
    previous.current = { taskId: task.id, defaultExpanded };
    if (last.taskId !== task.id) {
      setExpanded([defaultExpanded]);
    } else if (last.defaultExpanded !== defaultExpanded) {
      setExpanded((ids) => [
        ...ids.filter(
          (id) => id !== last.defaultExpanded && id !== defaultExpanded,
        ),
        defaultExpanded,
      ]);
    }
  }, [task.id, defaultExpanded]);
  const act = async (cancel: boolean) => {
    setBusy(true);
    try {
      await client.mutate({
        mutation: cancel ? CancelTaskDocument : RetryTaskDocument,
        variables: { taskId: task.id },
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
        aria-controls={`task-${task.id}-step-${id}`}
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
        title={title('task-info', '任务信息')}
        description={
          <StepDetails
            id={`task-${task.id}-step-task-info`}
            open={expanded.includes('task-info')}
          >
            <TaskInfo task={task} />
          </StepDetails>
        }
      />
      {workflow.steps.map((item) => {
        const atomView = item.atom ? atomViews[item.atom] : undefined;
        const cancelledHere = workflow.cancellation?.stepId === item.id;
        const failed =
          workflow.status === 'failed' && workflow.currentStepId === item.id;
        const cancelling = item.status === 'cancelling';
        const cancelled = item.status === 'cancelled';
        const collapsible = item.status === 'succeeded' && !!atomView?.fields;
        const hasDetails =
          failed || (cancelling ? !!atomView?.cancelling : !!atomView?.fields);
        const open = collapsible
          ? expanded.includes(`step:${item.id}`)
          : item.status !== 'pending';
        const suffix = cancelledHere
          ? cancellationSuffix[item.status] ?? ''
          : '';
        return (
          <Steps.Step
            key={item.id}
            data-current-step={workflow.currentStepId === item.id}
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
                  !!task.workflow &&
                  !workflow.cancellation ? (
                  <Popconfirm
                    placement="rightBottom"
                    arrowPointAtCenter
                    // 当前 AntD 箭头高 22px、底部距 12px；中心偏移为 23px。
                    align={{ offset: [4, 23] }}
                    title={
                      <>
                        <div>确认取消任务？</div>
                        <div>取消后需重新发起任务，媒体文件会保留</div>
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
              ) : item.status !== 'pending' && hasDetails ? (
                <StepDetails
                  id={`task-${task.id}-step-step:${item.id}`}
                  open={open}
                >
                  {failed ? (
                    <FailureDetails error={workflow.error} />
                  ) : cancelling ? (
                    atomView?.cancelling?.(task) ?? null
                  ) : (
                    <>
                      {atomView?.fields?.(
                        task,
                        active && open && item.status === 'running',
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
