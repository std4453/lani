import {
  GetActiveDownloadJobStatusDocument,
  DownloadJobStatus,
} from '@/generated/types';
import { useApolloPoll, useForegroundOnline } from '@/utils/useApolloPoll';
import { useQuery } from '@apollo/client';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { Form, Progress } from 'antd';
import styles from './DownloadProgress.module.less';

export function formatBytes(value: number, digits: number = 1) {
  const bytes = Number.isFinite(value) ? Math.max(0, value) : 0;
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const unit =
    bytes > 0
      ? Math.min(
          Math.max(0, Math.floor(Math.log10(bytes) / 3)),
          units.length - 1,
        )
      : 0;
  return `${(bytes / 1000 ** unit).toFixed(digits)}${units[unit]}`;
}
export function formatEta(speed: number, eta?: number | null) {
  if (
    speed <= 0 ||
    typeof eta !== 'number' ||
    !Number.isFinite(eta) ||
    eta < 0 ||
    eta >= 8640000
  )
    return '--:--:--';
  const seconds = Math.floor(eta);
  return [
    Math.floor(seconds / 3600),
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
const countLabel = (value?: number | null) =>
  typeof value === 'number' && value >= 0 ? String(value) : '--';

export function DownloadProgressDetails({
  progress,
}: {
  progress?: DownloadJobStatus;
}) {
  const total = Number(progress?.total ?? 0);
  const downloaded = Number(progress?.downloaded ?? 0);
  const percent =
    total > 0 ? Math.min(100, Math.max(0, (downloaded / total) * 100)) : 0;
  const speed = progress ? `${formatBytes(progress.speed, 2)}/s` : '--';
  const size = progress
    ? `${formatBytes(downloaded)} / ${formatBytes(total)}`
    : '-- / --';
  const eta = formatEta(progress?.speed ?? 0, progress?.eta);
  const seeds = countLabel(progress?.seeds);
  const peers = countLabel(progress?.peers);
  return (
    <Form.Item label="下载进度" className={styles.progressItem}>
      <div className={styles.progressLine}>
        <Progress
          percent={percent}
          showInfo={false}
          status={percent < 100 ? 'active' : 'normal'}
        />
        <span className={styles.percent}>
          {progress ? `${Number(percent.toFixed(1))}%` : '--'}
        </span>
      </div>
      <div className={styles.statusLine}>
        <span title={speed}>{speed}</span>
        <span title={size}>{size}</span>
        <span title={`剩余预计时间 ${eta}`}>
          <FieldTimeOutlined /> {eta}
        </span>
        <span className={styles.counts}>
          <span title={`做种者 ${seeds}`}>
            <ArrowUpOutlined />
            {seeds}
          </span>
          <span title={`下载者 ${peers}`}>
            <ArrowDownOutlined />
            {peers}
          </span>
        </span>
      </div>
    </Form.Item>
  );
}

export default function DownloadProgress({
  id,
  enabled,
}: {
  id: number;
  enabled: boolean;
}) {
  const available = useForegroundOnline();
  const query = useQuery(GetActiveDownloadJobStatusDocument, {
    variables: { jobIds: [id] },
    skip: !enabled || !available,
    fetchPolicy: 'network-only',
  });
  useApolloPoll({ refetch: query.refetch, pollInterval: 2000, enabled });
  return enabled ? (
    <DownloadProgressDetails
      progress={query.data?.getActiveDownloadJobStatus[0]}
    />
  ) : null;
}
