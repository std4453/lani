import { FileExplorer } from '@/components/ImportDialog/FileExplorer';
import ImportConfirmDialog, {
  ImportEpisode,
} from '@/components/ImportDialog/ImportConfirmDialog';
import { SearchTorrentModal } from '@/components/SearchTorrentDialog/SearchTorrent';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import {
  DownloadTorrentForSeasonDocument,
  GetImportSeasonDocument,
  PreviewTorrentDocument,
  PreviewTorrentMutation,
  TaskType,
  TorrentFieldsFragment,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useApolloClient } from '@apollo/client';
import { Button, Modal, message } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from '../ImportDialog/index.scoped.less';

export function BatchDownloadDialog({
  visible,
  input,
  resolve,
  reject,
}: DialogProps<{
  seasonId: number;
  title: string;
  onResolve?: () => void | Promise<void>;
}>) {
  const client = useApolloClient();
  const [step, setStep] = useState<'search' | 'files' | 'confirm'>('search');
  const [torrent, setTorrent] = useState<TorrentFieldsFragment>();
  const [preview, setPreview] =
    useState<PreviewTorrentMutation['previewTorrent']>();
  const [episodes, setEpisodes] = useState<ImportEpisode[]>();
  const [path, setPath] = useState('/');
  const [selected, setSelected] = useState<string[]>([]);
  const [reading, setReading] = useState(false);
  const generation = useRef(0);
  const hideLoading = useRef<(() => void) | undefined>();
  const [details, , openDetails] = useTaskDetailsDialog();
  useEffect(() => {
    ++generation.current;
    setStep('search');
    setTorrent(undefined);
    setPreview(undefined);
    setEpisodes(undefined);
    setPath('/');
    setSelected([]);
    setReading(false);
    return () => {
      ++generation.current;
      hideLoading.current?.();
    };
  }, [visible, input?.seasonId]);
  const close = () => {
    ++generation.current;
    hideLoading.current?.();
    reject();
  };
  const read = async (chosen: TorrentFieldsFragment) => {
    if (reading || !input) return;
    const revision = generation.current;
    setReading(true);
    const hide = message.loading('读取中，请稍后……', 0);
    hideLoading.current = hide;
    try {
      const [{ data }, seasonEpisodes] = await Promise.all([
        client.mutate({
          mutation: PreviewTorrentDocument,
          variables: { torrentId: chosen.id },
        }),
        (async () => {
          const items: ImportEpisode[] = [];
          for (;;) {
            const { data } = await client.query({
              query: GetImportSeasonDocument,
              variables: { id: input.seasonId, offset: items.length },
              fetchPolicy: 'network-only',
            });
            const season = data.seasonById;
            if (!season) throw new Error('季度不存在');
            const page = season.episodesBySeasonId.nodes.filter(
              (e): e is ImportEpisode => !!e,
            );
            items.push(...page);
            if (items.length >= season.episodesBySeasonId.totalCount)
              return items;
            if (!page.length) throw new Error('季度剧集读取不完整');
          }
        })(),
      ]);
      if (revision !== generation.current) return;
      if (!data) throw new Error('种子预览响应为空');
      setPreview(data.previewTorrent);
      setEpisodes(seasonEpisodes);
      setPath('/');
      setSelected([]);
      setStep('files');
    } catch (error) {
      if (revision === generation.current) handleError(error, '读取种子失败');
    } finally {
      hide();
      if (revision === generation.current) setReading(false);
    }
  };
  return (
    <>
      <SearchTorrentModal
        visible={visible && step === 'search'}
        active={visible}
        selected={torrent}
        setSelected={setTorrent}
        seasonId={input?.seasonId}
        seasonFullName={input?.title}
        submitting={reading}
        onCancel={close}
        onSubmit={read}
        okText="下一步"
      />
      <Modal
        visible={visible && step === 'files'}
        title="选择文件"
        width={850}
        className={styles.modal}
        maskClosable={false}
        onCancel={close}
        footer={[
          <Button key="back" onClick={() => setStep('search')}>
            上一步
          </Button>,
          <Button
            key="next"
            type="primary"
            disabled={!selected.length || !episodes}
            onClick={() => setStep('confirm')}
          >
            下一步
          </Button>,
        ]}
      >
        <FileExplorer
          key={preview?.token}
          path={path}
          setPath={setPath}
          type="multiple"
          selected={selected}
          setSelected={setSelected}
          files={preview?.files ?? []}
        />
      </Modal>
      <ImportConfirmDialog
        visible={visible && step === 'confirm'}
        title={input?.title ?? ''}
        download
        episodes={episodes ?? []}
        importPaths={selected}
        onCancel={() => setStep('files')}
        onClose={close}
        onSubmit={async (entries) => {
          if (!preview || !input) throw new Error('种子预览已失效');
          const { data } = await client.mutate({
            mutation: DownloadTorrentForSeasonDocument,
            variables: {
              seasonId: input.seasonId,
              previewToken: preview.token,
              entries: entries.map(({ episodeId, importPath }) => ({
                episodeId,
                path: importPath.slice(1),
              })),
            },
          });
          if (!data) throw new Error('任务创建响应为空');
          await resolve();
          void Promise.resolve()
            .then(() => input.onResolve?.())
            .catch((error) => handleError(error, '剧集状态刷新失败'));
          void openDetails({
            taskId: data.downloadTorrentForSeason,
            taskType: TaskType.BatchDownload,
          });
        }}
      />
      {details}
    </>
  );
}

export const useBatchDownloadDialog = createUseDialog(BatchDownloadDialog);
