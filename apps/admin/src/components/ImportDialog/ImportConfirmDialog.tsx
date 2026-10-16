import { formatNumbering } from '@/utils/episode';
import { GetImportSeasonQuery } from '@/generated/types';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons';
import { Alert, Button, Modal, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import {
  detectImportOffset,
  parseVideoFilename,
} from '@lani/parse-torrent-title';
import { handleError } from '@/utils/error';
import styles from './index.scoped.less';

export type ImportEpisode = NonNullable<
  NonNullable<
    NonNullable<GetImportSeasonQuery['seasonById']>['episodesBySeasonId']
  >['nodes'][number]
>;
export interface ImportEntry {
  importPath: string;
  episodeId: number;
}

export default function ImportConfirmDialog({
  visible,
  title,
  episodes,
  importPaths,
  onCancel,
  onSubmit,
}: {
  visible: boolean;
  title: string;
  episodes: ImportEpisode[];
  importPaths: string[];
  onCancel(): void;
  onSubmit(entries: ImportEntry[]): Promise<void>;
}) {
  const [paths, setPaths] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [offset, setOffset] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const parsed = useMemo(
    () => new Map(importPaths.map((path) => [path, parseVideoFilename(path)])),
    [importPaths],
  );
  const buildMapping = (selected: string[], shift: number) => {
    const result: Record<string, number> = {};
    for (const path of selected) {
      const info = parsed.get(path)?.episodeInfo;
      if (!info || typeof info.index !== 'number') continue;
      const number = info.index - (info.type === 'episode' ? shift : 0);
      const matches = episodes.filter(
        (e) =>
          (e.numbering?.type ?? 'episode') === info.type &&
          (e.numbering?.number !== null && e.numbering?.number !== undefined
            ? Number(e.numbering.number)
            : e.index) === number,
      );
      if (matches.length === 1) result[path] = matches[0].id;
    }
    return result;
  };
  useEffect(() => {
    if (!visible) return;
    const sorted = [...importPaths].sort();
    const detection = detectImportOffset(
      sorted.map((path) => parsed.get(path)?.episodeInfo),
      episodes.map((episode) => {
        const tasks =
          episode.matchingTasks?.nodes.filter(
            (t): t is NonNullable<typeof t> => !!t,
          ) ?? [];
        return {
          type: episode.numbering?.type ?? 'episode',
          number:
            episode.numbering?.number !== null &&
            episode.numbering?.number !== undefined
              ? Number(episode.numbering.number)
              : episode.index ?? NaN,
          available:
            !!episode.jellyfinEpisodeId ||
            tasks.some(
              (t) =>
                t.workflow?.status === 'succeeded' ||
                (!t.workflow && t.legacyStage === 'AVAILABLE'),
            ),
          active: tasks.some((t) =>
            t.workflow
              ? ['running', 'cancelling'].includes(t.workflow.status)
              : !t.isFailed && !t.isCancelled && t.legacyStage !== 'AVAILABLE',
          ),
        };
      }),
    );
    const shift = detection.offset ?? 0;
    setPaths(sorted);
    setOffset(shift);
    setMapping(buildMapping(sorted, shift));
    // 只在打开确认页时推断；删除和手工修改不能触发重新映射。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);
  const counts = new Map<number, number>();
  for (const path of paths)
    if (mapping[path])
      counts.set(mapping[path], (counts.get(mapping[path]) ?? 0) + 1);
  const valid =
    paths.length > 0 &&
    paths.every((path) => mapping[path] && counts.get(mapping[path]) === 1);
  const options = episodes.map((episode) => ({
    value: episode.id,
    label: (
      <span className={styles.option}>
        <span>
          #{formatNumbering(episode.numbering)} - {episode.title}
        </span>
        <span>
          <DownloadStatusTag status={calcEpisodeStatus(episode).status} />
        </span>
      </span>
    ),
  }));
  return (
    <Modal
      visible={visible}
      title={`确认导入（${title}）`}
      width={1000}
      centered
      destroyOnClose
      className={styles.importModal}
      onCancel={() => {
        if (!submitting) onCancel();
      }}
      maskClosable={!submitting}
      closable={!submitting}
      okText="导入"
      confirmLoading={submitting}
      okButtonProps={{ disabled: !valid }}
      cancelButtonProps={{ disabled: submitting }}
      onOk={async () => {
        if (!valid || submitting) return;
        setSubmitting(true);
        try {
          await onSubmit(
            paths.map((path) => ({
              importPath: path,
              episodeId: mapping[path],
            })),
          );
        } catch (error) {
          handleError(error, '导入任务创建失败');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Alert
        className={styles.importAlert}
        type="info"
        showIcon
        message={
          offset ? (
            <>
              已按文件编号{offset > 0 ? '减' : '加'} {Math.abs(offset)}{' '}
              匹配，请核对后导入。
              <Button
                type="link"
                disabled={submitting}
                onClick={() => {
                  setOffset(0);
                  setMapping(buildMapping(paths, 0));
                }}
              >
                恢复原编号
              </Button>
            </>
          ) : (
            '自动识别的剧集编号可能有误，请仔细检查后继续导入'
          )
        }
      />
      <div className={styles.importList}>
        {paths.map((path) => {
          const position = parsed.get(path)?.position;
          const basenameStart = path.lastIndexOf('/') + 1;
          const basename = path.slice(basenameStart);
          const index = position ? position.index - basenameStart : -1;
          return (
            <div className={styles.import} key={path}>
              <div className={styles.importPath} title={path}>
                <span>
                  {index >= 0 && position ? (
                    <>
                      {basename.slice(0, index)}
                      <span className={styles.highlight}>
                        {basename.slice(index, index + position.length)}
                      </span>
                      {basename.slice(index + position.length)}
                    </>
                  ) : (
                    basename
                  )}
                </span>
                <Button
                  type="text"
                  danger
                  size="small"
                  aria-label={`删除 ${basename}`}
                  className={styles.deleteImport}
                  icon={<DeleteOutlined />}
                  disabled={submitting}
                  onClick={() =>
                    setPaths((previous) =>
                      previous.filter((item) => item !== path),
                    )
                  }
                />
              </div>
              <div className={styles.importTarget}>
                <ArrowRightOutlined />
                <Select
                  value={mapping[path]}
                  disabled={submitting}
                  onChange={(value) =>
                    setMapping((previous) => ({ ...previous, [path]: value }))
                  }
                  options={options}
                  className={styles.importSelect}
                  dropdownMatchSelectWidth={true}
                  status={
                    (counts.get(mapping[path]) ?? 0) > 1 ? 'error' : undefined
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
