import { Episode } from '@/pages/season/help';
import { createUseDialogWithOnResolve, DialogProps } from '@/utils/useDialog';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Modal, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.scoped.less';
import parseTorrentTitle from '@lani/parse-torrent-title';

function ImportConfirmDialog({
  resolve,
  reject,
  visible,
  input,
}: DialogProps<
  {
    episodes: Episode[];
    importPaths: string[];
  },
  Array<{
    importPath: string;
    episodeId: number;
  }>
>) {
  const [episodeMapping, setEpisodeMapping] = useState<Record<string, number>>(
    {},
  );

  useEffect(() => {
    if (visible) {
      if (input?.importPaths) {
        const initialEpisodeMapping: Record<string, number> = {};

        // 尝试识别
        for (const path of input.importPaths) {
          const pathLastPart = path.substring(path.lastIndexOf('/') + 1);
          const pathWithoutExtName = pathLastPart.substring(
            0,
            pathLastPart.lastIndexOf('.'),
          );

          const result = parseTorrentTitle(pathWithoutExtName);

          if (!result?.index || typeof result.index !== 'number') {
            continue;
          }

          initialEpisodeMapping[path] = result.index;
        }

        setEpisodeMapping(initialEpisodeMapping);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const allSelected = useMemo(() => {
    return (input?.importPaths ?? []).every((path) => episodeMapping[path]);
  }, [input?.importPaths, episodeMapping]);

  const selectedEpisodes = useMemo(() => {
    const map = new Map<number, number>();
    for (const episode of Object.values(episodeMapping)) {
      map.set(episode, (map.get(episode) ?? 0) + 1);
    }
    return map;
  }, [episodeMapping]);

  const noConflict = useMemo(() => {
    const selected = Object.values(episodeMapping);
    return selected.length === new Set(selected).size;
  }, [episodeMapping]);

  const episodeSelectData = useMemo(() => {
    return (input?.episodes ?? []).map((episode) => ({
      label: `#${episode.index} - ${episode.title}`,
      value: episode.index,
    }));
  }, [input?.episodes]);

  return (
    <Modal
      visible={visible}
      title="确认导入"
      width={740}
      destroyOnClose={true}
      onCancel={reject}
      okButtonProps={{
        disabled: !(allSelected && noConflict),
      }}
      onOk={() => {
        void resolve(
          (input?.importPaths ?? []).map((path) => ({
            importPath: path,
            episodeId:
              (input?.episodes ?? []).find(
                (episode) => episode.index === episodeMapping[path],
              )?.id ?? 0,
          })),
        );
      }}
      centered
      className={styles.importModal}
    >
      <Alert
        message="自动识别的剧集编号可能有误，请仔细检查后继续导入"
        type="info"
        showIcon
        className={styles.importAlert}
      />
      <div className={styles.importList}>
        {(input?.importPaths ?? []).map((path) => (
          <div className={styles.import} key={path}>
            <div>{path.substring(path.lastIndexOf('/') + 1)}</div>
            <ArrowRightOutlined />
            <Select
              value={episodeMapping[path]}
              onChange={(value) => {
                setEpisodeMapping((prev) => ({
                  ...prev,
                  [path]: value,
                }));
              }}
              options={episodeSelectData}
              className={styles.importSelect}
              dropdownMatchSelectWidth={false}
              status={
                (selectedEpisodes.get(episodeMapping[path]) ?? 0) > 1
                  ? 'error'
                  : undefined
              }
            />
          </div>
        ))}
      </div>
    </Modal>
  );
}

export const useImportConfirmDialog =
  createUseDialogWithOnResolve(ImportConfirmDialog);
