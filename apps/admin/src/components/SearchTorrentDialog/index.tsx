import Highlight from '@/components/Highlight';
import {
  SearchTorrentDocument,
  TorrentFieldsFragment,
} from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import {
  createUseDialogWithOnResolve,
  DialogPropsWithOnResolve,
} from '@/utils/useDialog';
import { useQuery } from '@apollo/client';
import { useDebounce } from 'ahooks';
import { Input, List, Modal, Spin, Typography } from 'antd';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';

export default function SearchTorrentDialog({
  reject,
  resolve,
  visible,
  submitting,
}: DialogPropsWithOnResolve<void, TorrentFieldsFragment>) {
  const [keywords, setKeywords] = useState('');
  const [selected, setSelected] = useState<TorrentFieldsFragment | undefined>(
    undefined,
  );

  const keywordsDebounced = useDebounce(keywords, {
    wait: 500,
  });
  const { data, loading } = useQuery(SearchTorrentDocument, {
    variables: {
      keyword: keywordsDebounced,
      first: 50,
    },
    skip: !visible,
  });
  const torrents = useMemo(() => extractNode(data?.allTorrents) ?? [], [data]);

  useEffect(() => {
    if (visible) {
      setKeywords('');
      setSelected(undefined);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      destroyOnClose={true}
      title="搜索种子"
      width={800}
      onCancel={reject}
      okButtonProps={{
        disabled: !selected,
        loading: submitting,
      }}
      onOk={() => {
        if (selected) {
          void resolve(selected);
        }
      }}
    >
      <Input
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="输入关键词"
      />
      <Spin spinning={loading}>
        <div className={styles.list}>
          <List
            dataSource={torrents}
            rowKey="id"
            renderItem={(item) => (
              <div
                className={clsx(styles.row, {
                  [styles.selected]: item.id === selected?.id,
                })}
                onClick={() => {
                  setSelected(item);
                }}
              >
                <Typography.Text className={styles.title}>
                  <Highlight content={item.title} keyword={keywords} />
                </Typography.Text>
              </div>
            )}
          />
        </div>
      </Spin>
    </Modal>
  );
}

export const useSearchTorrentDialog =
  createUseDialogWithOnResolve(SearchTorrentDialog);
