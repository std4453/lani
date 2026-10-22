import {
  CancelTorrentSeasonMatchDocument,
  TorrentMatchStatus,
  TorrentParseFieldsFragment,
} from '@/generated/types';
import { DeleteOutlined } from '@ant-design/icons';
import { useApolloClient } from '@apollo/client';
import { Button, message, Tooltip, Typography } from 'antd';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Link } from 'umi';
import styles from './index.module.less';

export default function TorrentSeason({
  torrent,
  children,
}: {
  torrent: TorrentParseFieldsFragment & { id: number };
  children: ReactNode;
}) {
  const client = useApolloClient();
  const [cancelled, setCancelled] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  useEffect(
    () => setCancelled(false),
    [torrent.matchStatus, torrent.matchedAt],
  );

  const dismiss = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    try {
      const result = await client.mutate({
        mutation: CancelTorrentSeasonMatchDocument,
        variables: { torrentId: torrent.id },
      });
      if (!result.data?.cancelTorrentSeasonMatch)
        throw new Error('Cancellation failed');
      client.cache.modify({
        id: client.cache.identify({ __typename: 'Torrent', id: torrent.id }),
        fields: {
          matchStatus: () => TorrentMatchStatus.Dismissed,
          matchedSeasonId: () => null,
          seasonByMatchedSeasonId: () => null,
        },
      });
      // MainTable 的请求结果不是订阅查询，只更新当前单元格，不重载表格。
      setCancelled(true);
      void message.success('取消关联成功');
    } catch {
      void message.error('取消关联失败');
    } finally {
      // eslint-disable-next-line require-atomic-updates -- 同步标记在首次 await 前设置，只有本次请求会清除。
      submitting.current = false;
      setLoading(false);
    }
  };

  const dismissed =
    cancelled || torrent.matchStatus === TorrentMatchStatus.Dismissed;
  const season =
    !dismissed && torrent.matchStatus === TorrentMatchStatus.Matched
      ? torrent.seasonByMatchedSeasonId
      : null;
  if (!season)
    return (
      <div className={styles.seasonCell}>
        {children}
        {dismissed && (
          <Typography.Text type="secondary" className={styles.dismissed}>
            用户主动取消关联
          </Typography.Text>
        )}
      </div>
    );

  return (
    <span className={styles.seasonCell}>
      <Link to={`/season/${season.id}`}>{season.title}</Link>
      <Tooltip title="取消关联">
        <Button
          className={styles.cancelAssociation}
          data-loading={loading}
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          loading={loading}
          aria-label="取消关联"
          onClick={dismiss}
        />
      </Tooltip>
    </span>
  );
}
