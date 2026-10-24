import { useEpisodeDetailsDialog } from '@/components/EpisodeDetailsDialog';
import { ListSeasonCardsDocument } from '@/generated/types';
import { extractNode } from '@/utils/graphql';
import { useEpisodeStatusPolling } from '@/utils/useEpisodeStatusPolling';
import useMobile from '@/utils/useMobile';
import { ListToolBar } from '@ant-design/pro-table';
import { ReloadOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import { useQuery } from '@apollo/client';
import { Alert, Button, Empty, Pagination, Space, Spin, Tooltip } from 'antd';
import { ReactNode, useEffect, useRef } from 'react';
import {
  CARD_PAGE_SIZE,
  cardQueryVariables,
  selectEpisodeWindow,
} from './card-layout';
import SeasonCard from './SeasonCard';
import styles from './SeasonCards.module.less';

export default function SeasonCards({
  title,
  actions,
  modeButton,
  page,
  keyword,
  searchText,
  setSearchText,
  onSearch,
  setPage,
}: {
  title: ReactNode;
  actions: ReactNode[];
  modeButton: ReactNode;
  page: number;
  keyword: string;
  searchText: string;
  setSearchText: (value: string) => void;
  onSearch: (value: string) => void;
  setPage: (page: number) => void;
}) {
  const mobile = useMobile();
  const { run: search, cancel: cancelSearch } = useDebounceFn(onSearch, {
    wait: 300,
  });
  useEffect(() => cancelSearch, [cancelSearch]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dialog, , openEpisode] = useEpisodeDetailsDialog();
  const {
    data,
    loading,
    error,
    refetch: refresh,
  } = useQuery(ListSeasonCardsDocument, {
    variables: cardQueryVariables(page, keyword),
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const seasons = extractNode(data?.allSeasons) ?? [];
  const total = data?.allSeasons?.totalCount;
  const { refetch } = useEpisodeStatusPolling({
    episodes: seasons.flatMap((season) =>
      selectEpisodeWindow(extractNode(season.mainEpisodes) ?? []),
    ),
    refresh,
    loading,
  });
  useEffect(() => {
    if (
      !loading &&
      !error &&
      total !== undefined &&
      page > Math.max(1, Math.ceil(total / CARD_PAGE_SIZE))
    ) {
      setPage(Math.max(1, Math.ceil(total / CARD_PAGE_SIZE)));
    }
  }, [total, page, loading, error, setPage]);

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <ListToolBar
          title={title}
          search={{
            'aria-label': '搜索季度标题',
            value: searchText,
            onChange: (event) => {
              setSearchText(event.target.value);
              search(event.target.value);
            },
            onSearch: (value) => {
              cancelSearch();
              onSearch(value);
            },
          }}
          actions={mobile ? [modeButton, ...actions] : actions}
          settings={
            mobile
              ? []
              : [
                  <Space key="view-actions">
                    {modeButton}
                    <Tooltip title="刷新">
                      <Button
                        type="text"
                        aria-label="刷新"
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={() => void refetch().catch(() => undefined)}
                      />
                    </Tooltip>
                  </Space>,
                ]
          }
        />
      </div>
      <div className={styles.content} ref={scrollRef}>
        {error && (
          <Alert
            type="error"
            showIcon
            message="季度列表获取失败"
            action={
              <Button
                size="small"
                onClick={() => void refetch().catch(() => undefined)}
              >
                重试
              </Button>
            }
          />
        )}
        <Spin spinning={loading && !data}>
          <div className={styles.grid}>
            {seasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                openEpisode={(episodeId) => void openEpisode({ episodeId })}
              />
            ))}
          </div>
          {!loading && !error && !seasons.length && (
            <Empty description="暂无季度" />
          )}
        </Spin>
      </div>
      <div className={styles.pagination}>
        <Pagination
          current={page}
          pageSize={CARD_PAGE_SIZE}
          total={total ?? 0}
          showSizeChanger={false}
          hideOnSinglePage={false}
          showTotal={mobile ? undefined : (count) => `共 ${count} 个季度`}
          onChange={(next) => {
            setPage(next);
            if (mobile)
              document
                .querySelector('.ant-pro-basicLayout-content')
                ?.scrollTo(0, 0);
            else scrollRef.current?.scrollTo(0, 0);
          }}
        />
      </div>
      {dialog}
    </div>
  );
}
