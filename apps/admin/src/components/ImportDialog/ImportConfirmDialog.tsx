import { formatNumbering } from '@/utils/episode';
import { GetImportSeasonQuery } from '@/generated/types';
import {
  calcEpisodeStatus,
  DownloadStatusTag,
} from '@/constants/download-status';
import {
  ArrowRightOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Button, Modal, Select, Tooltip } from 'antd';
import NumberStepGroup from '@/components/NumberStepGroup';
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
  const [manual, setManual] = useState<Set<string>>(new Set());
  const [attempted, setAttempted] = useState(false);
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
      const number = info.index + (info.type === 'episode' ? shift : 0);
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
    const shift = -(detection.offset ?? 0);
    setManual(new Set());
    setAttempted(false);
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
  const changeOffset = (value: number) => {
    setOffset(value);
    const updated = buildMapping(paths, value);
    // 始终从文件原编号计算，空映射仍可再次匹配；手动行不受偏移影响。
    setMapping((previous) => {
      const next = { ...previous };
      for (const path of paths) {
        const info = parsed.get(path)?.episodeInfo;
        if (
          !manual.has(path) &&
          info?.type === 'episode' &&
          typeof info.index === 'number'
        ) {
          if (updated[path]) next[path] = updated[path];
          else delete next[path];
        }
      }
      return next;
    });
  };
  const reset = () => {
    setOffset(0);
    setMapping(buildMapping(paths, 0));
    setManual(new Set());
    setAttempted(false);
  };
  const submit = async () => {
    if (submitting) return;
    setAttempted(true);
    if (!valid) return;
    setSubmitting(true);
    try {
      await onSubmit(
        paths.map((path) => ({ importPath: path, episodeId: mapping[path] })),
      );
    } catch (error) {
      handleError(error, '导入任务创建失败');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Modal
      visible={visible}
      title={`确认导入（${title}）`}
      width={1200}
      centered
      destroyOnClose
      className={styles.importModal}
      onCancel={() => {
        if (!submitting) onCancel();
      }}
      maskClosable={!submitting}
      closable={!submitting}
      footer={
        <div className={styles.importFooter}>
          <div className={styles.offsetControl}>
            <span className={styles.offsetLabel}>
              偏移{' '}
              <Tooltip title="目标剧集编号＝文件编号＋偏移量。例如文件第 13 集对应季度第 1 集，偏移为 −12；通常用于年番后半季、第二季等文件编号不从 1 开始的情况。只调整普通单集，特别篇保持自身编号，手动选择过的行不随偏移变化。">
                <InfoCircleOutlined tabIndex={0} aria-label="偏移说明" />
              </Tooltip>
            </span>
            <NumberStepGroup
              label="偏移"
              value={offset}
              onChange={changeOffset}
              disabled={submitting}
            />
          </div>
          <div className={styles.confirmActions}>
            <Button
              style={{ marginLeft: 0 }}
              disabled={submitting}
              onClick={reset}
            >
              重置
            </Button>
            <Button
              style={{ marginLeft: 0 }}
              disabled={submitting}
              onClick={onCancel}
            >
              取消
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: 0 }}
              loading={submitting}
              onClick={() => void submit()}
            >
              导入
            </Button>
          </div>
        </div>
      }
    >
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
                  onChange={(value) => {
                    setManual((previous) => new Set(previous).add(path));
                    setMapping((previous) => ({ ...previous, [path]: value }));
                  }}
                  options={options}
                  className={styles.importSelect}
                  dropdownMatchSelectWidth={true}
                  status={
                    (attempted && !mapping[path]) ||
                    (counts.get(mapping[path]) ?? 0) > 1
                      ? 'error'
                      : undefined
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
