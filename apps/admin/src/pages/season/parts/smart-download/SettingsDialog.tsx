import { useCallback, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { Button, Form, Space } from 'antd';
import type { SmartEpisode } from '@lani/smart-download';
import EnhancedDialog from '@/components/EnhancedDialog';
import { useSeasonPageContext } from '../../help';
import { PreviewCache } from './preview/cache';
import { fetchPreviewPage } from './preview/query';
import { useTimeline } from './preview/useTimeline';
import { usePreviewState } from './preview/usePreviewState';
import { DownloadSettings, offsetHours, normalizeOffset } from './settings';
import { FIRST_USE_KEY } from './constants';
import SettingsForm from './SettingsForm';
import PreviewTable from './preview';
import styles from './index.module.less';

export default function SettingsDialog({
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
      new PreviewCache((request, signal) =>
        fetchPreviewPage(
          client,
          id,
          {
            ...request,
            snapshot: request.snapshot ?? new Date(now).toISOString(),
          },
          signal,
        ),
      ),
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
    <EnhancedDialog
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
      <SettingsForm
        form={form}
        initial={initial}
        mode={live.mode}
        onValuesChange={(values) => {
          const next = normalizeOffset({ ...initial, ...values });
          if (offsetHours(next) !== offset)
            timeline.beforeOffsetChange(directoryFor(offsetHours(next)));
          form.setFieldsValue(next);
          setDraft(next);
        }}
      />
      <PreviewTable timeline={timeline} draft={draft} tasks={live.tasks} />
    </EnhancedDialog>
  );
}
