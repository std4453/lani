import {
  DownloadStatus,
  GetEpisodeByIdDocument,
  GetEpisodeByIdQuery,
  RetryJobStepDocument,
} from '@/generated/types';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import useMobile from '@/utils/useMobile';
import { ReloadOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import { useApolloClient, useQuery } from '@apollo/client';
import { Modal, Space, Spin, Steps, Tabs, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { ReactNode, useMemo } from 'react';
import styles from './index.module.less';

type Episode = NonNullable<GetEpisodeByIdQuery['episodeById']>;
type Job = NonNullable<ExtractNode<Episode['downloadJobsByEpisodeId']>>;

const jobStatusToStep: Partial<Record<DownloadStatus, number>> = {
  [DownloadStatus.DownloadSubmitting]: 1,
  [DownloadStatus.Downloading]: 2,
  [DownloadStatus.DownloadCompleted]: 3,
  [DownloadStatus.Importing]: 4,
  [DownloadStatus.WritingMetadata]: 5,
  [DownloadStatus.PlayerWaiting]: 6,
  [DownloadStatus.Available]: 7,
};

function JobStepDescription({
  content,
  current,
  job,
  label,
  step,
}: {
  step: number;
  current: number;
  job: Job;
  label: string;
  content: string | null | undefined;
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
  } else if (current === step && job.isFailed) {
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
            await client.mutate({
              mutation: RetryJobStepDocument,
              variables: {
                jobId: job.id,
              },
            });
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

function EpisodeJob({ job }: { job: Job }) {
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
          <JobStepDescription
            step={1}
            current={current}
            job={job}
            label="种子Hash"
            content={job.qbtTorrentHash}
          />
        }
      />
      <Steps.Step
        title={
          <JobStepTitle title="下载中" step={2} current={current} job={job} />
        }
        description={
          <JobStepDescription
            step={2}
            current={current}
            job={job}
            label="下载文件根路径"
            content={job.downloadPath}
          />
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

export default function EpisodeDetailsDialog({
  reject,
  visible,
  input,
}: DialogProps<{ episodeId: number; jobId?: number }>) {
  const { data, loading } = useQuery(GetEpisodeByIdDocument, {
    skip: !input?.episodeId || !visible,
    variables: {
      episodeByIdId: input?.episodeId ?? 0,
    },
    pollInterval: 1000,
  });
  const jobs = useMemo(
    () => extractNode(data?.episodeById?.downloadJobsByEpisodeId) ?? [],
    [data],
  );
  const mobile = useMobile();

  return (
    <Modal
      visible={visible}
      onCancel={reject}
      footer={false}
      title={
        data?.episodeById
          ? `#${data.episodeById.index} - ${data.episodeById.title}`
          : '剧集详情'
      }
      destroyOnClose={true}
      width={800}
    >
      <Spin spinning={loading}>
        <ProDescriptions<Episode>
          dataSource={data?.episodeById ?? undefined}
          colon={false}
          column={mobile ? 1 : 2}
        >
          <ProDescriptions.Item dataIndex={['id']} label="全局ID" copyable />
          <ProDescriptions.Item
            label="季度"
            dataIndex={['seasonBySeasonId']}
            render={(_, e) => {
              const episode = e as Episode;
              return episode.seasonBySeasonId ? (
                <Typography.Link
                  href={`/season/${episode.seasonBySeasonId?.id}`}
                  target="_blank"
                >
                  {episode.seasonBySeasonId.title} (#
                  {episode.seasonBySeasonId.id})
                </Typography.Link>
              ) : (
                '-'
              );
            }}
          />
          <ProDescriptions.Item
            dataIndex={['airTime']}
            label="放送时间"
            valueType="dateTime"
          />
          <ProDescriptions.Item
            dataIndex={['createdAt']}
            label="创建时间"
            valueType="dateTime"
          />
          <ProDescriptions.Item
            span={2}
            dataIndex={['description']}
            label="描述"
          />
        </ProDescriptions>
        {jobs.length > 0 ? (
          <Tabs
            defaultActiveKey={input?.jobId ? `${input.jobId}` : undefined}
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
                    <Tag
                      color={
                        job.status === DownloadStatus.Available
                          ? 'green'
                          : job.isFailed
                          ? 'red'
                          : 'blue'
                      }
                      style={{
                        marginLeft: 8,
                      }}
                    >
                      {job.status === DownloadStatus.Available
                        ? '成功'
                        : job.isFailed
                        ? '错误'
                        : '进行中'}
                    </Tag>
                  </div>
                }
              >
                <div
                  style={{
                    overflow: 'auto',
                    maxHeight: 800,
                  }}
                >
                  <EpisodeJob job={job} />
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
