import TorrentsList from '@/components/TorrentsList';
import { TorrentFieldsFragment } from '@/generated/types';
import { getSeasonKeyword } from '@/utils/season';
import {
  createUseDialogWithOnResolve,
  DialogPropsWithOnResolve,
} from '@/utils/useDialog';
import { Input, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchTorrentData } from './data';
import styles from './index.module.less';

function SearchTorrentDialog({
  reject,
  resolve,
  visible,
  submitting,
  input,
}: DialogPropsWithOnResolve<
  {
    seasonFullName?: string;
    seasonId?: number;
    title?: string;
  } | void,
  TorrentFieldsFragment
>) {
  const [selected, setSelected] = useState<TorrentFieldsFragment | undefined>(
    undefined,
  );

  useEffect(() => {
    if (visible) {
      setSelected(undefined);
    }
  }, [visible]);

  return (
    <SearchTorrentModal
      visible={visible}
      active={visible}
      selected={selected}
      setSelected={setSelected}
      seasonFullName={input?.seasonFullName}
      seasonId={input?.seasonId}
      title={input?.title}
      submitting={submitting}
      onCancel={reject}
      onSubmit={resolve}
    />
  );
}

export function SearchTorrentModal({
  visible,
  active,
  selected,
  setSelected,
  seasonFullName,
  seasonId,
  title,
  submitting,
  onCancel,
  onSubmit,
  okText,
}: {
  visible: boolean;
  active: boolean;
  selected?: TorrentFieldsFragment;
  setSelected(value?: TorrentFieldsFragment): void;
  seasonFullName?: string;
  seasonId?: number;
  title?: string;
  submitting: boolean;
  onCancel(): void;
  onSubmit(torrent: TorrentFieldsFragment): Promise<void>;
  okText?: string;
}) {
  const {
    keywords,
    setKeywords,
    error,
    hasNext,
    loading,
    torrents,
    loadMore,
    lastQueryKeyword,
  } = useSearchTorrentData({
    visible: active,
    initialKeyword: seasonFullName ? getSeasonKeyword(seasonFullName) : '',
    seasonId,
  });

  return (
    <Modal
      visible={visible}
      destroyOnClose={true}
      title={
        title ?? `搜索种子${seasonFullName ? `（${seasonFullName}）` : ''}`
      }
      okText={okText}
      maskClosable={false}
      width={900}
      onCancel={() => {
        onCancel();
      }}
      okButtonProps={{
        disabled: !selected,
        loading: submitting,
      }}
      onOk={async () => {
        if (selected) {
          await onSubmit(selected);
        }
      }}
      centered
    >
      <div className={styles.inputWrap}>
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="输入关键词"
          allowClear
        />
        {seasonFullName ? (
          <Typography.Link
            onClick={() => {
              if (seasonFullName) {
                setKeywords(seasonFullName);
              }
            }}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            使用季度全名
          </Typography.Link>
        ) : null}
      </div>
      <div className={styles.list}>
        <TorrentsList
          selected={selected}
          setSelected={setSelected}
          error={error}
          hasNext={hasNext}
          loading={loading}
          keyword={lastQueryKeyword}
          torrents={torrents}
          onScrollToBottom={loadMore}
        />
      </div>
    </Modal>
  );
}

export const useSearchTorrentDialog =
  createUseDialogWithOnResolve(SearchTorrentDialog);
