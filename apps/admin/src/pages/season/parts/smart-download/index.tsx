import { useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
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
import { PreviewCache, PreviewPage, PreviewTorrent } from './preview';
import {
  describeSettings,
  DownloadSettings,
  offsetHours,
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
  const open = () => {
    const values = formRef.current?.getFieldsValue(
      settingNames,
    ) as DownloadSettings;
    if (!values) return;
    const settings = () => setDraft({ ...values });
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
            <Form.Item label="智能下载" {...formItemProps}>
              <Button
                type="primary"
                ghost
                className={styles.button}
                onClick={open}
              >
                {values.smartDownloadEnabled ? '设置……' : '开启智能下载'}
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
          onCancel={() => setDraft(undefined)}
          onSave={(value) => {
            formRef.current?.setFieldsValue(value);
            updateTouched();
            setDraft(undefined);
          }}
        />
      )}
    </>
  );
}

export function SettingsDialog({
  initial,
  onCancel,
  onSave,
}: {
  initial: DownloadSettings;
  onCancel(): void;
  onSave(value: DownloadSettings): void;
}) {
  const { id, episodes } = useSeasonPageContext();
  const client = useApolloClient();
  const [form] = Form.useForm<DownloadSettings>();
  const [draft, setDraft] = useState(initial);
  const [now] = useState(() => Date.now());
  const [count, setCount] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [preview, setPreview] = useState<{
    nodes: PreviewTorrent[];
    completeSince: number;
    excludes: string[];
    hasMore: boolean;
  }>({ nodes: [], completeSince: Infinity, excludes: [], hasMore: true });
  const cache = useMemo(
    () =>
      new PreviewCache(async (first, after) => {
        const result = await client.query({
          query: SmartDownloadPreviewDocument,
          variables: {
            seasonId: id,
            first,
            after,
            snapshot: new Date(now).toISOString(),
          },
          fetchPolicy: 'no-cache',
        });
        return result.data.smartDownloadPreview as PreviewPage;
      }),
    [client, id, now],
  );
  const offset = offsetHours(draft);
  const directory = useMemo<SmartEpisode[]>(
    () =>
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
    [episodes, offset],
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);
    void cache
      .ensure(count, directory, now)
      .then((completeSince) => {
        if (active)
          setPreview({
            nodes: [...cache.nodes],
            completeSince,
            excludes: cache.excludes,
            hasMore: cache.hasMore,
          });
      })
      .catch((reason) => {
        if (active)
          setError(reason instanceof Error ? reason.message : '加载种子失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cache, count, directory, now, retry]);
  const rows = useMemo(
    () =>
      previewRows(
        directory,
        preview.nodes,
        toSettings(draft),
        now,
        preview.excludes,
        preview.completeSince,
      ),
    [directory, preview, draft, now],
  );
  const visible = rows.slice(0, count);
  const more = rows.length > count || preview.hasMore;
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
      visible
      title="智能下载设置"
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
              确定
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
        onValuesChange={(_, values) => setDraft({ ...initial, ...values })}
      >
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
            <Space wrap>
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
                <InputNumber
                  aria-label="下载偏移天数"
                  min={0}
                  max={14}
                  precision={0}
                  style={{ width: 64 }}
                />
              </Form.Item>
              天
              <Form.Item
                name="downloadOffsetHours"
                noStyle
                rules={[{ required: true, type: 'integer', min: 0, max: 24 }]}
              >
                <InputNumber
                  aria-label="下载偏移小时数"
                  min={0}
                  max={24}
                  precision={0}
                  style={{ width: 64 }}
                />
              </Form.Item>
              小时开始下载
            </Space>
          </Form.Item>
        </div>
      </Form>
      <div
        className={styles.preview}
        onScroll={(event) => {
          const target = event.currentTarget;
          if (
            more &&
            !loading &&
            !error &&
            target.scrollHeight - target.scrollTop - target.clientHeight < 80
          )
            setCount((value) => value + 30);
        }}
      >
        <table className={styles.table} aria-label="智能下载种子预览">
          <thead>
            <tr>
              {['集数', '种子标题', '字幕', '发布时间', '种子大小'].map(
                (title) => (
                  <th key={title}>{title}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => {
              const torrent = row.torrent as PreviewTorrent | undefined;
              const reasons = row.decision?.reasons ?? [];
              const exclusion =
                torrent &&
                Date.parse(torrent.publishDate) < preview.completeSince
                  ? '发布区间的种子尚未加载完整'
                  : reasons.map((reason) => exclusionLabels[reason]).join('；');
              const reasonId = `smart-download-exclusion-${row.key}`;
              return (
                <tr
                  key={row.key}
                  tabIndex={exclusion ? 0 : undefined}
                  aria-describedby={exclusion ? reasonId : undefined}
                  className={clsx({
                    [styles.excluded]: !!exclusion || !torrent,
                    [styles.release]: !!row.release,
                  })}
                >
                  {torrent ? (
                    <>
                      <td data-release={row.release}>
                        <span className={styles.cellContent}>
                          {typeof torrent.episodeInfo?.index === 'number' ||
                          typeof torrent.episodeInfo?.index === 'string'
                            ? String(torrent.episodeInfo.index)
                            : '-'}
                        </span>
                      </td>
                      <td>
                        <span className={styles.cellContent}>
                          {torrent.title}
                        </span>
                        {exclusion && (
                          <span
                            id={reasonId}
                            className={styles.exclusionReason}
                          >
                            {exclusion}
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
                          {dayjs(torrent.publishDate).format(
                            'YYYY-MM-DD HH:mm:ss',
                          )}
                        </span>
                      </td>
                      <td>
                        <span className={styles.cellContent}>
                          {prettyBytes(Number(torrent.size))}
                        </span>
                      </td>
                    </>
                  ) : (
                    <td
                      colSpan={5}
                      data-release={row.release}
                      className={styles.emptyRow}
                    >
                      无匹配种子
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && (
          <div className={styles.status}>
            <Spin />
          </div>
        )}
        {error && (
          <Alert
            type="error"
            message="加载种子失败"
            action={
              <Button
                size="small"
                onClick={() => setRetry((value) => value + 1)}
              >
                重试
              </Button>
            }
          />
        )}
        {!loading && !error && !rows.length && (
          <Empty
            className={styles.empty}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="无匹配种子"
          />
        )}
        {!loading && !error && more && (
          <div className={styles.status}>
            <Button type="link" onClick={() => setCount((value) => value + 30)}>
              加载更多
            </Button>
          </div>
        )}
      </div>
    </TaskDialog>
  );
}
