import {
  DownloadJobStatus,
  DownloadStatus,
  TaskDetailsFieldsFragment,
  RetryJobStepDocument,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { useApolloClient } from '@apollo/client';
import { ReloadOutlined } from '@ant-design/icons';
import { Progress, Space, Steps, Typography } from 'antd';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { ReactNode } from 'react';
import styles from '../EpisodeDetailsDialog/index.module.less';
type Job = TaskDetailsFieldsFragment;

const jobStatusToStep: Partial<Record<DownloadStatus, number>> = {
  [DownloadStatus.DownloadSubmitting]: 1,
  [DownloadStatus.Downloading]: 2,
  [DownloadStatus.DownloadCompleted]: 3,
  [DownloadStatus.Importing]: 4,
  [DownloadStatus.WritingMetadata]: 5,
  [DownloadStatus.PlayerWaiting]: 6,
  [DownloadStatus.Available]: 7,
};

function secondsToDuration(seconds: number) {
  const parts = [
    // 天
    Math.floor(seconds / 86400),
    // 小时
    Math.floor((seconds % 86400) / 3600),
    // 分钟
    Math.floor((seconds % 3600) / 60),
    // 秒
    seconds % 60,
  ];
  function pad(n: number) {
    return `${n}`.padStart(2, '0');
  }
  if (parts[0] > 0) {
    return `${parts[0]}天${parts[1] > 0 ? `${parts[1]}小时` : ''}`;
  } else {
    return `${parts[1] > 0 ? `${pad(parts[1])}:` : ''}${pad(parts[2])}:${pad(
      parts[3],
    )}`;
  }
}

function DownloadingDescription({
  step,
  current,
  job,
  status,
}: {
  step: number;
  current: number;
  job: Job;
  status?: DownloadJobStatus;
}) {
  if (step !== current || !status || job.isFailed) {
    return null;
  }
  const downloaded = parseInt(status.downloaded as string);
  const total = parseInt(status.total as string);
  // qbt在完成下载之后，downloaded可能略微超过total，展示递减的下载速度，且剩余时间返回的是预计完成上传的时间
  const finished = downloaded >= total;
  const percentage = finished ? 100 : (downloaded / total) * 100;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        whiteSpace: 'nowrap',
      }}
    >
      <span>
        {prettyBytes(downloaded)} / {prettyBytes(total)} (
        {percentage.toFixed(1)}%)
      </span>
      <Progress
        percent={percentage}
        showInfo={false}
        status={!finished && status.peers === 0 ? 'exception' : 'active'}
      />
      <span>
        {prettyBytes(finished ? 0 : status.speed)}/s
        {typeof status.eta === 'number'
          ? ` (约${secondsToDuration(finished ? 0 : status.eta)})`
          : ''}
      </span>
    </div>
  );
}

function JobStepDescription({
  content,
  current,
  job,
  label,
  step,
  showErrors = true,
}: {
  step: number;
  current: number;
  job: Job;
  label: string;
  content: string | null | undefined;
  showErrors?: boolean;
}) {
  if (current > step) {
    return (
      <div className={styles.description}>
        {label}：
        <Typography.Text copyable={Boolean(content)}>
          {content || '-'}
        </Typography.Text>
      </div>
    );
  } else if (current === step && job.isFailed && showErrors) {
    return (
      <>
        <div>
          失败时间：
          <Typography.Text>
            {dayjs(job.failedAt).format('YYYY-MM-DD HH:mm:ss')}
          </Typography.Text>
        </div>
        <div>
          失败原因：<Typography.Text>{job.failedReason}</Typography.Text>
        </div>
      </>
    );
  } else {
    return null;
  }
}

function JobStepTitle({
  current,
  step,
  job,
  title,
}: {
  current: number;
  step: number;
  job: Job;
  title: ReactNode;
}) {
  const client = useApolloClient();
  return (
    <Space direction="horizontal">
      {title}
      {current === step && job.isFailed && (
        <Typography.Link
          onClick={async () => {
            try {
              await client.mutate({
                mutation: RetryJobStepDocument,
                variables: {
                  jobId: job.id,
                },
              });
            } catch (error) {
              handleError(error);
            }
          }}
          style={{
            fontSize: 14,
          }}
        >
          <ReloadOutlined /> 重试
        </Typography.Link>
      )}
    </Space>
  );
}

export default function LegacyDownloadJob({
  job,
  jobIdToStatusMap,
}: {
  job: Job;
  jobIdToStatusMap: Record<number, DownloadJobStatus>;
}) {
  const current = jobStatusToStep[job.status] ?? 0;
  return (
    <Steps
      direction="vertical"
      current={current}
      status={
        job.status === DownloadStatus.Available
          ? 'finish'
          : job.isFailed
          ? 'error'
          : 'process'
      }
    >
      <Steps.Step
        title="任务信息"
        description={
          <div>
            <div className={styles.description}>
              创建时间：
              <Typography.Text>
                {dayjs(job.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Typography.Text>
            </div>
            <div className={styles.description}>
              种子地址：
              <Typography.Text copyable>
                {job.torrentLink || '-'}
              </Typography.Text>
            </div>
          </div>
        }
      />
      <Steps.Step
        title={
          <JobStepTitle title="提交下载" step={1} current={current} job={job} />
        }
        description={
          <>
            <JobStepDescription
              step={1}
              current={current}
              job={job}
              label="种子Hash"
              content={job.qbtTorrentHash}
            />
            <JobStepDescription
              step={1}
              current={current}
              job={job}
              label="种子名称"
              content={job.torrentTitle}
              showErrors={false}
            />
          </>
        }
      />
      <Steps.Step
        title={
          <JobStepTitle title="下载中" step={2} current={current} job={job} />
        }
        description={
          <>
            <JobStepDescription
              step={2}
              current={current}
              job={job}
              label="下载文件根路径"
              content={job.downloadPath}
            />
            <DownloadingDescription
              step={2}
              current={current}
              job={job}
              status={jobIdToStatusMap[job.id]}
            />
          </>
        }
      />
      <Steps.Step
        title={
          <JobStepTitle
            title="寻找视频文件"
            step={3}
            current={current}
            job={job}
          />
        }
        description={
          <JobStepDescription
            step={3}
            current={current}
            job={job}
            label="视频文件路径"
            content={job.importPath}
          />
        }
      />
      <Steps.Step
        title={
          <JobStepTitle title="导入文件" step={4} current={current} job={job} />
        }
        description={
          <JobStepDescription
            step={4}
            current={current}
            job={job}
            label="导入文件路径"
            content={job.filePath}
          />
        }
      />
      <Steps.Step
        title={
          <JobStepTitle
            title="写入元数据"
            step={5}
            current={current}
            job={job}
          />
        }
        description={
          <JobStepDescription
            step={5}
            current={current}
            job={job}
            label="元数据路径"
            content={job.nfoPath}
          />
        }
      />
      <Steps.Step
        title={
          <JobStepTitle
            title="刷新Jellyfin"
            step={6}
            current={current}
            job={job}
          />
        }
        description={
          <JobStepDescription
            step={6}
            current={current}
            job={job}
            label="Jellyfin剧集ID"
            content={job.jellyfinEpisodeId}
          />
        }
      />
      <Steps.Step title="下载完成" />
    </Steps>
  );
}
