import { formatNumbering } from '@/utils/episode';
import { FileExplorer } from './FileExplorer';
import ImportConfirmDialog, { ImportEpisode } from './ImportConfirmDialog';
import {
  ImportMultipleDocument,
  ImportSingleDocument,
  GetImportSeasonDocument,
  TaskType,
} from '@/generated/types';
import { Episode } from '@/pages/season/help';
import { handleError } from '@/utils/error';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useTaskDetailsDialog } from '@/components/TaskDetailsDialog';
import { useApolloClient } from '@apollo/client';
import { Alert, Modal } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.scoped.less';

function ImportSingleDialog({
  resolve,
  reject,
  visible,
  input,
}: DialogProps<{ episode: Episode; onResolve?: () => void | Promise<void> }>) {
  const [path, setPath] = useState('/');
  const [selected, setSelected] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [details, , openDetails] = useTaskDetailsDialog();
  const client = useApolloClient();
  useEffect(() => {
    if (visible) {
      setPath('/');
      setSelected('');
    }
  }, [visible]);
  return (
    <>
      <Modal
        visible={visible}
        onCancel={() => {
          if (!submitting) reject();
        }}
        closable={!submitting}
        maskClosable={!submitting}
        title={`手动导入${
          input
            ? `（#${formatNumbering(input.episode.numbering)} - ${
                input.episode.title
              }）`
            : ''
        }`}
        destroyOnClose
        width={850}
        className={styles.modal}
        okText="导入"
        cancelButtonProps={{ disabled: submitting }}
        okButtonProps={{ disabled: !selected, loading: submitting }}
        onOk={async () => {
          if (!selected || submitting || !input?.episode.id) return;
          setSubmitting(true);
          try {
            const { data } = await client.mutate({
              mutation: ImportSingleDocument,
              variables: { episodeId: input.episode.id, path: selected },
            });
            if (!data) throw new Error('任务创建响应为空');
            await resolve();
            void Promise.resolve()
              .then(() => input?.onResolve?.())
              .catch((error) => handleError(error, '剧集状态刷新失败'));
            void openDetails({
              taskId: data.importSingle,
              taskType: TaskType.Import,
            });
          } catch (error) {
            handleError(error, '导入任务创建失败');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <FileExplorer
          {...{ path, setPath, type: 'single', selected, setSelected }}
        />
      </Modal>
      {details}
    </>
  );
}

function ImportMultipleDialog({
  resolve,
  reject,
  visible,
  input,
}: DialogProps<{
  seasonId: number;
  episodes: Episode[];
  onResolve?: () => void | Promise<void>;
}>) {
  const [path, setPath] = useState('/');
  const [selected, setSelected] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [snapshot, setSnapshot] =
    useState<{ title: string; episodes: ImportEpisode[] }>();
  const [error, setError] = useState(false);
  const client = useApolloClient();
  const [details, , openDetails] = useTaskDetailsDialog();
  useEffect(() => {
    if (!visible || !input) return;
    setPath('/');
    setSelected([]);
    setConfirming(false);
    setSnapshot(undefined);
    setError(false);
    let disposed = false;
    void (async () => {
      const episodes: ImportEpisode[] = [];
      for (;;) {
        const { data } = await client.query({
          query: GetImportSeasonDocument,
          variables: { id: input.seasonId, offset: episodes.length },
          fetchPolicy: 'network-only',
        });
        if (disposed) return;
        const season = data.seasonById;
        if (!season) throw new Error('季度不存在');
        const page = season.episodesBySeasonId.nodes.filter(
          (e): e is ImportEpisode => !!e,
        );
        episodes.push(...page);
        if (episodes.length >= season.episodesBySeasonId.totalCount) {
          setSnapshot({ title: season.title, episodes });
          return;
        }
        if (!page.length) throw new Error('季度剧集读取不完整');
      }
    })().catch((error) => {
      if (!disposed) {
        setError(true);
        handleError(error, '季度剧集读取失败');
      }
    });
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, input?.seasonId]);
  return (
    <>
      <Modal
        maskClosable={false}
        visible={visible && !confirming}
        onCancel={reject}
        title={`批量导入（${snapshot?.title ?? '加载中…'}）`}
        destroyOnClose
        width={850}
        className={styles.modal}
        okText="下一步"
        okButtonProps={{ disabled: !selected.length || !snapshot }}
        onOk={() => {
          if (selected.length && snapshot) setConfirming(true);
        }}
      >
        {error && (
          <Alert type="error" message="季度剧集读取失败，请关闭后重试" />
        )}
        <FileExplorer
          {...{ path, setPath, type: 'multiple', selected, setSelected }}
        />
      </Modal>
      <ImportConfirmDialog
        visible={visible && confirming}
        title={snapshot?.title ?? ''}
        episodes={snapshot?.episodes ?? []}
        importPaths={selected}
        onCancel={() => setConfirming(false)}
        onClose={reject}
        onSubmit={async (entries) => {
          const { data } = await client.mutate({
            mutation: ImportMultipleDocument,
            variables: { entries },
          });
          if (!data) throw new Error('任务创建响应为空');
          setConfirming(false);
          await resolve();
          void Promise.resolve()
            .then(() => input?.onResolve?.())
            .catch((error) => handleError(error, '剧集状态刷新失败'));
          void openDetails({
            taskId: data.importMultiple,
            taskType: TaskType.BatchImport,
          });
        }}
      />
      {details}
    </>
  );
}
export const useImportSingleDialog = createUseDialog(ImportSingleDialog);
export const useImportMultipleDialog = createUseDialog(ImportMultipleDialog);
