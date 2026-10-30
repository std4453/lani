import { Fragment, useMemo } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Alert, Button, Empty, Spin, Tooltip } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import type { SubtitleInfo } from '@lani/parse-torrent-title';
import type { ExclusionReason } from '@lani/smart-download';
import { calcTaskStatus, DownloadStatusTag } from '@/constants/download-status';
import TorrentSubtitle from '@/components/TorrentSubtitle';
import { previewRows } from './preview-rows';
import { PreviewTorrent } from './preview-cache';
import { relativePublishTime } from './preview-utils';
import { PreviewTask } from './usePreviewState';
import { useTimeline } from './useTimeline';
import { DownloadSettings, toSettings } from './settings';
import styles from './index.module.less';

const exclusionLabels: Record<ExclusionReason, string> = {
  episode: '集数无法唯一匹配本季度正篇单集',
  time: '发布时间不在对应剧集的下载窗口内',
  subtitle: '不符合字幕要求',
  title: '命中标题或片源屏蔽规则',
  baha: '已优先选择同集的 Baha 资源',
  'before-first': '早于首集开始下载时间',
  pending: '种子解析或详情抓取尚未完成',
};

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
  const visibleRows = rows.slice(0, count);
  const groups: typeof visibleRows[] = [];
  visibleRows.forEach((row) => {
    if (row.release || !groups.length) groups.push([]);
    groups[groups.length - 1].push(row);
  });
  const more = rows.length > count || view?.preview.hasMore;
  return (
    <div className={styles.previewContainer}>
      <div
        ref={timeline.viewport}
        className={clsx(styles.preview, { [styles.frozen]: frozen })}
        aria-busy={loading}
        onScroll={more || frozen ? timeline.onScroll : undefined}
      >
        <table className={styles.table} aria-label="智能下载种子预览">
          <colgroup>
            <col style={{ width: 65 }} />
            <col style={{ width: 175 }} />
            <col />
            <col style={{ width: 100 }} />
            <col style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr>
              {['集数', '发布时间', '种子标题', '字幕', '种子大小'].map(
                (title) => (
                  <th key={title}>
                    {title}
                    {title === '种子标题' && (
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
                    )}
                  </th>
                ),
              )}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group[0].key}>
              {group.map((row) => {
                const torrent = row.torrent as PreviewTorrent | undefined;
                const task = torrent && tasks.get(torrent.hash.toLowerCase());
                const reasons = row.decision?.reasons ?? [];
                const exclusion =
                  torrent &&
                  Date.parse(torrent.publishDate) >=
                    view!.preview.coverage.completeUntil
                    ? '发布区间的种子尚未加载完整'
                    : reasons
                        .map((reason) => exclusionLabels[reason])
                        .join('；');
                const release = row.release
                  ? `${row.release.label} ${dayjs(row.release.at).format(
                      'YYYY-MM-DD HH:mm:ss',
                    )}`
                  : undefined;
                const reasonId = `smart-download-exclusion-${row.key}`;
                return (
                  <Fragment key={row.key}>
                    {release && (
                      <tr
                        className={styles.release}
                        data-release-ids={row.release?.episodeIds.join(',')}
                      >
                        <td colSpan={5}>
                          <div className={styles.releaseMarker}>
                            <span className={styles.releaseLabel}>
                              {release}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr
                      data-preview-key={row.key}
                      tabIndex={exclusion ? 0 : undefined}
                      aria-describedby={exclusion ? reasonId : undefined}
                      className={clsx(styles.torrentRow, {
                        [styles.excluded]: !!exclusion || !torrent,
                      })}
                    >
                      {torrent ? (
                        <>
                          <td>
                            <span
                              className={clsx(
                                styles.cellContent,
                                task && styles.taskCell,
                              )}
                            >
                              {task ? (
                                <span className={styles.taskTag}>
                                  <DownloadStatusTag
                                    {...calcTaskStatus(task.summary)}
                                  />
                                </span>
                              ) : typeof torrent.episodeInfo?.index ===
                                  'number' ||
                                typeof torrent.episodeInfo?.index ===
                                  'string' ? (
                                String(torrent.episodeInfo.index)
                              ) : (
                                '-'
                              )}
                            </span>
                          </td>
                          <td>
                            <Tooltip
                              title={
                                row.precedingReleaseAt === undefined
                                  ? undefined
                                  : dayjs(torrent.publishDate).format(
                                      'YYYY-MM-DD HH:mm:ss',
                                    )
                              }
                            >
                              <span className={styles.cellContent}>
                                {row.precedingReleaseAt === undefined
                                  ? dayjs(torrent.publishDate).format(
                                      'YYYY-MM-DD HH:mm:ss',
                                    )
                                  : relativePublishTime(
                                      torrent.publishDate,
                                      row.precedingReleaseAt,
                                    )}
                              </span>
                            </Tooltip>
                          </td>
                          <td className={styles.titleCell}>
                            <span className={styles.cellContent}>
                              {torrent.title}
                            </span>
                            {exclusion && (
                              <span
                                id={reasonId}
                                className={styles.exclusionReason}
                              >
                                <span>无法下载原因：{exclusion}</span>
                              </span>
                            )}
                          </td>
                          <td>
                            <span className={styles.cellContent}>
                              <TorrentSubtitle
                                info={torrent.subtitleInfo as SubtitleInfo}
                              />
                            </span>
                          </td>
                          <td>
                            <span className={styles.cellContent}>
                              {prettyBytes(Number(torrent.size))}
                            </span>
                          </td>
                        </>
                      ) : (
                        <td colSpan={5} className={styles.emptyRow}>
                          无匹配种子
                        </td>
                      )}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          ))}
        </table>
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
        {!loading && !error && !rows.length && (
          <Empty
            className={styles.empty}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="还未开播，之后再来看看吧"
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
