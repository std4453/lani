import { Fragment, useCallback, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { QuestionCircleOutlined, ThunderboltFilled } from '@ant-design/icons';
import { calcTaskStatus, DownloadStatusTag } from '@/constants/download-status';
import {
  Alert,
  Button,
  Empty,
  Form,
  InputNumber,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Tooltip,
} from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import type { SubtitleInfo } from '@lani/parse-torrent-title';
import {
  ExclusionReason,
  previewRows,
  SmartEpisode,
} from '@lani/smart-download';
import TorrentSubtitle from '@/components/TorrentSubtitle';
import FormDependency from '@/components/FormDependency';
import TaskDialog from '@/components/TaskDialog';
import { SmartDownloadPreviewDocument } from '@/generated/types';
import { formItemProps, useSeasonPageContext } from '../../help';
import {
  PreviewCache,
  PreviewPage,
  PreviewTorrent,
  relativePublishTime,
} from './preview';
import { useTimeline } from './useTimeline';
import { usePreviewState } from './usePreviewState';
import OffsetInput from './OffsetInput';
import {
  describeSettings,
  DownloadSettings,
  offsetHours,
  normalizeOffset,
  settingNames,
  subtitleLabels,
  toSettings,
} from './settings';
import styles from './index.module.less';

const FIRST_USE_KEY = 'lani.smart-download.confirmed';
const RULES_URL = 'https://std4453.github.io/lani/docs/usage/smart-download';
const PreservedValue = () => null;
const exclusionLabels: Record<ExclusionReason, string> = {
  episode: '集数无法唯一匹配本季度正篇单集',
  time: '发布时间不在对应剧集的下载窗口内',
  subtitle: '不符合字幕要求',
  title: '命中标题或片源屏蔽规则',
  baha: '已优先选择同集的 Baha 资源',
  'before-first': '早于首集开始下载时间',
  pending: '种子解析或详情抓取尚未完成',
};

export default function SmartDownload() {
  const { formRef, updateTouched } = useSeasonPageContext();
  const [draft, setDraft] = useState<DownloadSettings>();
  const [visible, setVisible] = useState(false);
  const close = () => setVisible(false);
  const open = () => {
    const values = formRef.current?.getFieldsValue(
      settingNames,
    ) as DownloadSettings;
    if (!values) return;
    const settings = () => {
      setDraft({ ...values });
      setVisible(true);
    };
    let confirmed = false;
    try {
      confirmed = localStorage.getItem(FIRST_USE_KEY) === 'true';
    } catch {
      /* 浏览器禁用存储时仍允许配置。 */
    }
    if (!values.smartDownloadEnabled && !confirmed) {
      Modal.confirm({
        title: '开启智能下载',
        content: (
          <>
            <p>智能下载会根据库中的种子，自动匹配季度并下载。</p>
            <p>
              智能下载可能会出错，如果你发现匹配错误，可以通过{' '}
              <a href={RULES_URL} target="_blank" rel="noreferrer">
                规则集
              </a>{' '}
              配置屏蔽规则，或者去{' '}
              <a
                href="https://github.com/std4453/lani/issues"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>{' '}
              告诉我们。
            </p>
          </>
        ),
        okText: '确定',
        cancelText: '取消',
        onOk: settings,
      });
    } else settings();
  };
  return (
    <>
      {settingNames
        .filter((name) => name.startsWith('smartDownload'))
        .map((name) => (
          <Form.Item key={name} name={name} hidden>
            <PreservedValue />
          </Form.Item>
        ))}
      <div className={styles.band}>
        <FormDependency<DownloadSettings> name={settingNames}>
          {(values) => (
            <Form.Item
              label={
                <span className={styles.label}>
                  智能下载
                  <ThunderboltFilled className={styles.icon} aria-hidden />
                </span>
              }
              {...formItemProps}
            >
              <Button type="primary" className={styles.button} onClick={open}>
                {values.smartDownloadEnabled ? '设置…' : '开启智能下载'}
              </Button>
              {values.smartDownloadEnabled && (
                <div className={styles.summary}>{describeSettings(values)}</div>
              )}
            </Form.Item>
          )}
        </FormDependency>
      </div>
      {draft && (
        <SettingsDialog
          initial={draft}
          visible={visible}
          onCancel={close}
          afterClose={() => setDraft(undefined)}
          onSave={(value) => {
            formRef.current?.setFieldsValue(value);
            updateTouched();
            close();
          }}
        />
      )}
    </>
  );
}

export function SettingsDialog({
  initial,
  visible,
  onCancel,
  onSave,
  afterClose,
}: {
  initial: DownloadSettings;
  visible: boolean;
  onCancel(): void;
  onSave(value: DownloadSettings): void;
  afterClose(): void;
}) {
  const { id, episodes } = useSeasonPageContext();
  const client = useApolloClient();
  const [form] = Form.useForm<DownloadSettings>();
  const [draft, setDraft] = useState(initial);
  const [now] = useState(() => Date.now());
  const live = usePreviewState(id, visible);
  const cache = useMemo(
    () =>
      new PreviewCache(async (request, signal) => {
        const result = await client.query({
          query: SmartDownloadPreviewDocument,
          variables: {
            seasonId: id,
            ...request,
            snapshot: request.snapshot ?? new Date(now).toISOString(),
          },
          fetchPolicy: 'no-cache',
          context: { fetchOptions: { signal }, queryDeduplication: false },
        });
        return result.data.smartDownloadPreview as PreviewPage;
      }),
    [client, id, now],
  );
  const directoryFor = useCallback(
    (offset: number): SmartEpisode[] =>
      episodes.map((episode) => ({
        id: episode.id,
        type: episode.numbering?.type ?? 'episode',
        number:
          (episode.numbering?.number ?? null) === null
            ? episode.index ?? null
            : Number(episode.numbering.number),
        sort:
          (episode.bangumiSort ?? null) === null
            ? null
            : Number(episode.bangumiSort),
        airTime: episode.rawAirTime
          ? new Date(
              Date.parse(episode.rawAirTime) - offset * 3600000,
            ).toISOString()
          : episode.airTime ?? null,
      })),
    [episodes],
  );
  const offset = offsetHours(draft);
  const directory = useMemo(() => directoryFor(offset), [directoryFor, offset]);
  const timeline = useTimeline(cache, directory, now, visible);
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
  const save = async () => {
    const value = await form.validateFields();
    try {
      localStorage.setItem(FIRST_USE_KEY, 'true');
    } catch {
      /* 存储不可用不阻止保存草稿。 */
    }
    onSave({ ...value, smartDownloadEnabled: true });
  };
  return (
    <TaskDialog
      visible={visible}
      afterClose={afterClose}
      title="智能下载设置"
      closeHint="自动刷新中"
      width={1100}
      onCancel={onCancel}
      footer={
        <div className={styles.footer}>
          <Space>
            {initial.smartDownloadEnabled && (
              <Button
                danger
                ghost
                onClick={() =>
                  onSave({ ...initial, smartDownloadEnabled: false })
                }
              >
                关闭智能下载
              </Button>
            )}
            <Button onClick={onCancel}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                void save().catch(() => undefined);
              }}
            >
              {initial.smartDownloadEnabled ? '确定' : '开启智能下载'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        initialValues={initial}
        layout="horizontal"
        colon={false}
        requiredMark={false}
        className={styles.settings}
        onValuesChange={(_, values) => {
          const next = normalizeOffset({ ...initial, ...values });
          if (offsetHours(next) !== offset)
            timeline.beforeOffsetChange(directoryFor(offsetHours(next)));
          form.setFieldsValue(next);
          setDraft(next);
        }}
      >
        {live.mode === 'lexical' && (
          // TODO：补充用户侧文档，说明词法匹配模式的准确率与智能下载建议。
          <Alert
            className={styles.matcherWarning}
            type="warning"
            showIcon
            message="使用词法模式时的识别准确率可能较低，不建议开启智能下载"
          />
        )}
        <div className={styles.grid}>
          <Form.Item
            label="字幕要求"
            name="smartDownloadSubtitle"
            rules={[{ required: true, message: '请选择字幕要求' }]}
          >
            <Select
              options={Object.entries(subtitleLabels).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="Baha 优先"
            name="smartDownloadPreferBaha"
            valuePropName="checked"
            tooltip="自动取消其他下载中任务，下载 Baha 源的种子，已完成下载的不替换"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            label="下载窗口"
            name="smartDownloadWindowHours"
            tooltip="为避免晚发布的剧集被误下载，超出剧集发布后一定时间的种子将被忽略"
            rules={[
              {
                required: true,
                type: 'integer',
                min: 1,
                max: 168,
                message: '请输入 1 至 168 小时',
              },
            ]}
          >
            <InputNumber min={1} max={168} precision={0} addonAfter="小时" />
          </Form.Item>
          <Form.Item
            label="下载超时"
            name="smartDownloadTimeoutMinutes"
            tooltip="超时后会自动取消原任务，可继续智能下载"
            rules={[
              { type: 'integer', min: 0, message: '请输入非负整数或留空' },
            ]}
          >
            <InputNumber
              min={0}
              precision={0}
              placeholder="不限制"
              addonAfter="分钟"
            />
          </Form.Item>
          <Form.Item label="下载时间" className={styles.downloadTime}>
            <Space wrap className={styles.timeOffset}>
              基于剧集放送时间，
              <Form.Item name="downloadOffsetType" noStyle>
                <Select
                  style={{ width: 84 }}
                  options={[
                    { value: 'advance', label: '提前' },
                    { value: 'postpone', label: '延后' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name="downloadOffsetDays"
                noStyle
                rules={[{ required: true, type: 'integer', min: 0, max: 14 }]}
              >
                <OffsetInput label="下载偏移天数" />
              </Form.Item>
              天
              <Form.Item
                name="downloadOffsetHours"
                noStyle
                rules={[{ required: true, type: 'integer', min: 0, max: 24 }]}
              >
                <OffsetInput label="下载偏移小时数" />
              </Form.Item>
              小时开始下载
            </Space>
          </Form.Item>
        </div>
      </Form>
      <div className={styles.previewContainer}>
        <div
          ref={timeline.viewport}
          className={clsx(styles.preview, { [styles.frozen]: frozen })}
          aria-busy={loading}
          onScroll={more || frozen ? timeline.onScroll : undefined}
        >
          <table className={styles.table} aria-label="智能下载种子预览">
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
                  const task =
                    torrent && live.tasks.get(torrent.hash.toLowerCase());
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
    </TaskDialog>
  );
}
