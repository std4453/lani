import { FileExplorer } from '@/components/ImportDialog/FileExplorer';
import { useImportConfirmDialog } from '@/components/ImportDialog/ImportConfirmDialog';
import {
  ImportMultipleDocument,
  ImportSingleDocument,
} from '@/generated/types';
import { Episode } from '@/pages/season/help';
import { handleError } from '@/utils/error';
import { createUseDialogWithOnResolve, DialogProps } from '@/utils/useDialog';
import { useApolloClient } from '@apollo/client';
import { message, Modal } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.scoped.less';

const defaultPath = '/';

function ImportSingleDialog({
  resolve,
  reject,
  visible,
  input,
}: DialogProps<{ episode: Episode }>) {
  const [path, setPath] = useState(defaultPath);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    if (visible) {
      setPath(defaultPath);
      setSelected('');
    }
  }, [visible]);

  const [submitting, setSubmitting] = useState(false);

  const client = useApolloClient();

  return (
    <Modal
      visible={visible}
      onCancel={reject}
      title={
        '手动导入' +
        (input ? `（#${input.episode.index} - ${input.episode.title}）` : '')
      }
      destroyOnClose={true}
      width={850}
      className={styles.modal}
      okButtonProps={{
        disabled: !selected,
        loading: submitting,
      }}
      onOk={async () => {
        if (!selected || submitting || !input?.episode?.id) {
          return;
        }
        const hide = message.loading('导入中……', 0);
        try {
          setSubmitting(true);
          await client.mutate({
            mutation: ImportSingleDocument,
            variables: {
              episodeId: input.episode.id,
              path: selected,
            },
          });
          void message.success('导入成功');
          void resolve();
        } catch (error) {
          handleError(error, '导入失败');
        } finally {
          setSubmitting(false);
          hide();
        }
      }}
    >
      <FileExplorer
        {...{
          path,
          setPath,
          type: 'single',
          selected,
          setSelected,
        }}
      />
    </Modal>
  );
}

function ImportMultipleDialog({
  resolve,
  reject,
  visible,
  input,
}: DialogProps<{ seasonId: number; episodes: Episode[] }>) {
  const [path, setPath] = useState(defaultPath);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setPath(defaultPath);
      setSelected([]);
    }
  }, [visible]);

  const [importConfirmDialog, , openImportConfirmDialog] =
    useImportConfirmDialog();

  const [submitting, setSubmitting] = useState(false);

  const client = useApolloClient();

  return (
    <>
      <Modal
        visible={visible}
        onCancel={reject}
        title="批量导入"
        destroyOnClose={true}
        width={850}
        className={styles.modal}
        okButtonProps={{
          disabled: !selected,
          loading: submitting,
        }}
        onOk={async () => {
          if (!selected || submitting || !input?.seasonId || !input?.episodes) {
            return;
          }
          void openImportConfirmDialog({
            episodes: input.episodes,
            importPaths: [...selected].sort(),
            // eslint-disable-next-line @typescript-eslint/typedef
            async onResolve(output) {
              const hide = message.loading('导入中……', 0);
              try {
                setSubmitting(true);
                await client.mutate({
                  mutation: ImportMultipleDocument,
                  variables: {
                    entries: output,
                  },
                });
                void message.success('导入成功');
                void resolve();
              } catch (error) {
                handleError(error, '导入失败');
              } finally {
                setSubmitting(false);
                hide();
              }
            },
          });
        }}
      >
        <FileExplorer
          {...{
            path,
            setPath,
            type: 'multiple',
            selected,
            setSelected,
          }}
        />
      </Modal>
      {importConfirmDialog}
    </>
  );
}

export const useImportSingleDialog =
  createUseDialogWithOnResolve(ImportSingleDialog);

export const useImportMultipleDialog =
  createUseDialogWithOnResolve(ImportMultipleDialog);
