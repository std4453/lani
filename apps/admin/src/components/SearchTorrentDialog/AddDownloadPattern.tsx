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

function AddDownloadPatternDialog({
  reject,
  resolve,
  visible,
  submitting,
  input,
}: DialogPropsWithOnResolve<
  {
    seasonFullName?: string;
    seasonId?: number;
  } | void,
  TorrentFieldsFragment[]
>) {
  const [selected, setSelected] = useState<TorrentFieldsFragment[]>([]);

  useEffect(() => {
    if (visible) {
      setSelected([]);
    }
  }, [visible]);

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
    visible,
    initialKeyword: input?.seasonFullName
      ? getSeasonKeyword(input.seasonFullName)
      : '',
    seasonId: input?.seasonId,
  });

  return (
    <Modal
      visible={visible}
      destroyOnClose={true}
      title="从已有种子新建规则"
      width={900}
      onCancel={() => {
        reject();
      }}
      okButtonProps={{
        disabled: !selected.length,
        loading: submitting,
      }}
      onOk={async () => {
        if (selected) {
          await resolve(selected);
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
        {input?.seasonFullName ? (
          <Typography.Link
            onClick={() => {
              if (input.seasonFullName) {
                setKeywords(input.seasonFullName);
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
          mode='multi'
          selectedMulti={selected}
          setSelectedMulti={setSelected}
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

export const useAddDownloadPatternDialog = createUseDialogWithOnResolve(
  AddDownloadPatternDialog,
);
