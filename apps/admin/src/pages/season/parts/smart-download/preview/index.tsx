import { useMemo } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Spin, Table, TableProps, Tooltip } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import type { SubtitleInfo } from '@lani/parse-torrent-title';
import type { ExclusionReason } from '@lani/smart-download';
import { calcTaskStatus, DownloadStatusTag } from '@/constants/download-status';
import TorrentSubtitle from '@/components/TorrentSubtitle';
import { previewRows, PreviewRow } from './rows';
import { PreviewTorrent } from './cache';
import { relativePublishTime } from './utils';
import { PreviewTask } from './usePreviewState';
import { useTimeline } from './useTimeline';
import { DownloadSettings, toSettings } from '../settings';
import ReleaseGroups, { ReleaseGroupsContext } from './ReleaseGroups';
import styles from './index.module.less';

const exclusionLabels: Record<ExclusionReason, string> = {
  episode: '集数无法唯一匹配本季度正篇单集',
  time: '发布时间不在对应剧集的下载窗口内',
  subtitle: '不符合字幕要求',
  title: '命中标题屏蔽规则',
  baha: '已优先选择同集的 Baha 资源',
  'before-first': '早于首集开始下载时间',
  pending: '种子解析或详情抓取尚未完成',
};
type TableRow = PreviewRow & {
  marker?: boolean;
  torrent?: PreviewTorrent;
  task?: PreviewTask;
  exclusion?: string;
};
const components = { body: { wrapper: ReleaseGroups } };

export default function PreviewTable({
  timeline,
  draft,
  tasks,
}: {
  timeline: ReturnType<typeof useTimeline>;
  draft: DownloadSettings;
  tasks: Map<string, PreviewTask>;
}) {
  const { view, count, loading, frozen, error } = timeline;
  const rows = useMemo(
    () =>
      view
        ? previewRows(
            view.directory,
            view.preview.nodes,
            toSettings(draft),
            view.now,
            view.preview.excludes,
            view.preview.coverage,
          )
        : [],
    [view, draft],
  );
  const data: TableRow[] = rows.slice(0, count).flatMap((row) => {
    const torrent = row.torrent as PreviewTorrent | undefined;
    const exclusion =
      torrent &&
      Date.parse(torrent.publishDate) >= view!.preview.coverage.completeUntil
        ? '发布区间的种子尚未加载完整'
        : (row.decision?.reasons ?? [])
            .map((reason) => exclusionLabels[reason])
            .join('；');
    return [
      ...(row.release
        ? [{ release: row.release, key: `marker-${row.key}`, marker: true }]
        : []),
      {
        ...row,
        torrent,
        exclusion,
        task: torrent && tasks.get(torrent.hash.toLowerCase()),
      },
    ];
  });
  const groups: { key: string; size: number }[] = [];
  for (const row of data) {
    if (row.marker || !groups.length) groups.push({ key: row.key, size: 0 });
    groups[groups.length - 1].size++;
  }
  const reasonId = (row: TableRow) => `smart-download-exclusion-${row.key}`;
  const mergedCell = (row: TableRow) => ({
    colSpan: row.marker || !row.torrent ? 0 : 1,
  });
  const columns: TableProps<TableRow>['columns'] = [
    {
      title: '集数',
      key: 'episode',
      width: 65,
      align: 'center',
      onCell: (row) => ({
        colSpan: row.marker || !row.torrent ? 5 : undefined,
        className: !row.marker && !row.torrent ? styles.emptyRow : undefined,
      }),
      render: (_, row) => {
        if (row.marker)
          return (
            <div className={styles.releaseMarker}>
              <span className={styles.releaseLabel}>
                {row.release!.label}{' '}
                {dayjs(row.release!.at).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
          );
        if (!row.torrent) return '无匹配种子';
        const index = row.torrent.episodeInfo?.index;
        return (
          <span
            className={clsx(styles.cellContent, row.task && styles.taskCell)}
          >
            {row.task ? (
              <span className={styles.taskTag}>
                <DownloadStatusTag {...calcTaskStatus(row.task.summary)} />
              </span>
            ) : typeof index === 'number' || typeof index === 'string' ? (
              String(index)
            ) : (
              '-'
            )}
          </span>
        );
      },
    },
    {
      title: '发布时间',
      key: 'published',
      width: 175,
      onCell: mergedCell,
      render: (_, row) =>
        row.torrent && (
          <Tooltip
            title={
              row.precedingReleaseAt === undefined
                ? undefined
                : dayjs(row.torrent.publishDate).format('YYYY-MM-DD HH:mm:ss')
            }
          >
            <span className={styles.cellContent}>
              {row.precedingReleaseAt === undefined
                ? dayjs(row.torrent.publishDate).format('YYYY-MM-DD HH:mm:ss')
                : relativePublishTime(
                    row.torrent.publishDate,
                    row.precedingReleaseAt,
                  )}
            </span>
          </Tooltip>
        ),
    },
    {
      title: (
        <>
          种子标题
          <Tooltip
            title={
              <>
                仅展示成功匹配到本季度的种子，
                <a
                  href="/torrents"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  查看全部
                </a>
              </>
            }
          >
            <QuestionCircleOutlined
              className={styles.titleHint}
              aria-label="种子展示范围"
            />
          </Tooltip>
        </>
      ),
      key: 'title',
      className: styles.titleCell,
      onCell: mergedCell,
      render: (_, row) =>
        row.torrent && (
          <>
            <span className={styles.cellContent}>{row.torrent.title}</span>
            {row.exclusion && (
              <span id={reasonId(row)} className={styles.exclusionReason}>
                <span>无法下载原因：{row.exclusion}</span>
              </span>
            )}
          </>
        ),
    },
    {
      title: '字幕',
      key: 'subtitle',
      width: 100,
      onCell: mergedCell,
      render: (_, row) =>
        row.torrent && (
          <span className={styles.cellContent}>
            <TorrentSubtitle info={row.torrent.subtitleInfo as SubtitleInfo} />
          </span>
        ),
    },
    {
      title: '种子大小',
      key: 'size',
      width: 100,
      onCell: mergedCell,
      render: (_, row) =>
        row.torrent && (
          <span className={styles.cellContent}>
            {prettyBytes(Number(row.torrent.size))}
          </span>
        ),
    },
  ];
  const more = rows.length > count || view?.preview.hasMore;
  return (
    <div className={styles.previewContainer}>
      <div
        ref={timeline.viewport}
        className={clsx(styles.preview, { [styles.frozen]: frozen })}
        role="region"
        aria-label="智能下载种子预览"
        aria-busy={loading}
        onScroll={more || frozen ? timeline.onScroll : undefined}
      >
        <ReleaseGroupsContext.Provider value={groups}>
          <Table<TableRow>
            className={styles.table}
            size="middle"
            pagination={false}
            tableLayout="fixed"
            rowKey="key"
            columns={columns}
            dataSource={data}
            components={components}
            locale={{
              emptyText:
                loading || error ? (
                  <span />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="还未开播，之后再来看看吧"
                  />
                ),
            }}
            rowClassName={(row) =>
              row.marker
                ? styles.release
                : clsx(
                    styles.torrentRow,
                    (!row.torrent || row.exclusion) && styles.excluded,
                  )
            }
            onRow={(row) =>
              row.marker
                ? { 'data-release-ids': row.release!.episodeIds.join(',') }
                : {
                    'data-preview-key': row.key,
                    tabIndex: row.exclusion ? 0 : undefined,
                    'aria-describedby': row.exclusion
                      ? reasonId(row)
                      : undefined,
                  }
            }
          />
        </ReleaseGroupsContext.Provider>
        {loading && !frozen && (
          <div className={styles.status}>
            <Spin />
          </div>
        )}
        {error && !frozen && (
          <Alert
            type="error"
            message="加载种子失败"
            action={
              <Button size="small" onClick={timeline.retry}>
                重试
              </Button>
            }
          />
        )}
        {!loading && !error && more && (
          <div className={styles.status}>
            <Button type="link" onClick={timeline.loadMore}>
              加载更多
            </Button>
          </div>
        )}
        {more && !!rows.length && (
          <div aria-hidden style={{ height: timeline.tailSpace }} />
        )}
      </div>
      {frozen && (
        <div className={styles.loadingOverlay} role="status">
          {error ? (
            <Alert
              type="error"
              message="加载种子失败"
              action={<Button onClick={timeline.retry}>重试</Button>}
            />
          ) : (
            <Spin tip="正在补齐种子列表" />
          )}
        </div>
      )}
    </div>
  );
}
