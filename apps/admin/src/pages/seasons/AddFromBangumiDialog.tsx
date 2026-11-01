import {
  CreateSeasonDocument,
  MetadataSource,
  SearchBangumiQuery,
  SyncEpisodeDataDocument,
  SyncMetadataDocument,
} from '@/generated/types';
import { useJellyfinFolders } from '@/pages/seasons/useJellyfinFolders';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import useMobile from '@/utils/useMobile';
import { useApolloClient } from '@apollo/client';
import { useDebounce } from 'ahooks';
import {
  Badge,
  Button,
  Empty,
  Checkbox,
  Input,
  List,
  message,
  Modal,
  Popover,
  Select,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './AddFromBangumiDialog.module.less';
import { handleError } from '@/utils/error';
import { SettingOutlined } from '@ant-design/icons';
import { useBangumiSearch } from './useBangumiSearch';
import BangumiSearchCard from './BangumiSearchCard';
import { isBangumiResultVisible } from './bangumi-search-display';

export default function AddFromBangumiDialog({
  visible,
  resolve,
  reject,
}: DialogProps<void, { id: number }>) {
  const client = useApolloClient();
  const [keywords, setKeywords] = useState('');
  const [useNewBangumiSearchApi, setUseNewBangumiSearchApi] = useState(true);
  const [hideDoujin, setHideDoujin] = useState(true);
  const [hideUnknown, setHideUnknown] = useState(true);
  const keywordsDebounced = useDebounce(keywords, {
    wait: 500,
  });
  const searchReady =
    visible && !!keywords.trim() && keywords === keywordsDebounced;
  const { items, loading, hasMore, error, loadMore, hasLoaded } =
    useBangumiSearch(keywords, useNewBangumiSearchApi, searchReady);
  const displayedItems = useMemo(
    () =>
      items.filter((item) =>
        isBangumiResultVisible(item, {
          hideDoujin,
          hideUnknown,
          useNewApi: useNewBangumiSearchApi,
        }),
      ),
    [items, hideDoujin, hideUnknown, useNewBangumiSearchApi],
  );
  const initialLoading =
    !!keywords.trim() &&
    (!searchReady ||
      !hasLoaded ||
      (displayedItems.length === 0 && !error && (loading || hasMore)));
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!visible || !scroll) return;
    const update = () => {
      // 将滚动条占用的宽度补回内容区，保持卡片宽度及弹窗两侧留白。
      scroll.style.setProperty(
        '--scrollbar-width',
        `${scroll.offsetWidth - scroll.clientWidth}px`,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    update();
    return () => observer.disconnect();
  }, [visible]);
  useEffect(() => {
    if (!searchReady || loading || error || !hasMore || !bottomRef.current)
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: scrollRef.current },
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [searchReady, loading, error, hasMore, loadMore, displayedItems.length]);
  const [selected, setSelected] = useState<
    SearchBangumiQuery['searchBangumi'][0] | undefined
  >(undefined);
  useEffect(() => {
    setSelected(undefined);
    scrollRef.current?.scrollTo(0, 0);
  }, [keywords, useNewBangumiSearchApi, visible, hideDoujin, hideUnknown]);
  useEffect(() => {
    if (visible) {
      setKeywords('');
      setUseNewBangumiSearchApi(true);
      setHideDoujin(true);
      setHideUnknown(true);
    }
  }, [visible]);

  const { folderId, foldersSelectProps } = useJellyfinFolders(visible);

  const [submitting, setSubmitting] = useState(false);

  const disabled = !selected || selected.added || !folderId;

  const mobile = useMobile();

  return (
    <Modal
      title="从Bangumi添加季度"
      visible={visible}
      onCancel={reject}
      footer={[
        <Space direction="horizontal" size={8} key="actions" wrap>
          <Select
            {...foldersSelectProps}
            style={{
              width: 200,
              textAlign: 'left',
            }}
          />
          <Space direction="horizontal" size={8}>
            <Button onClick={reject}>取消</Button>
            <Button
              disabled={disabled}
              loading={submitting}
              type="primary"
              onClick={async () => {
                if (disabled) {
                  return;
                }
                try {
                  setSubmitting(true);
                  const { data } = await client.mutate({
                    mutation: CreateSeasonDocument,
                    variables: {
                      season: {
                        title: selected.name,
                        bangumiId: selected.id,
                        infoSource: MetadataSource.BgmCn,
                        episodesSource: MetadataSource.BgmCn,
                        jellyfinFolderId: folderId,
                        tags: [],
                      },
                    },
                  });
                  const id = data?.createSeason?.season?.id;
                  if (!id) {
                    throw new Error('no id');
                  }
                  const hide = message.loading('新建成功，同步元数据中……', 0);
                  try {
                    await client.mutate({
                      mutation: SyncMetadataDocument,
                      variables: {
                        seasonId: id,
                      },
                    });
                    await client.mutate({
                      mutation: SyncEpisodeDataDocument,
                      variables: {
                        seasonId: id,
                      },
                    });
                    // syncMetadata会写入元数据，这里不用手动触发写入
                    void message.success('同步元数据成功');
                    void resolve({ id });
                  } catch (error) {
                    handleError(error, '同步元数据失败');
                  } finally {
                    hide();
                  }
                } catch (error) {
                  handleError(error, '新建失败');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              添加
            </Button>
          </Space>
        </Space>,
      ]}
      width={900}
      bodyStyle={{ padding: 0 }}
    >
      <div>
        <div className={styles.searchBar}>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={'输入关键词，或「bgmid: 100000」精确查找'}
            allowClear
          />
          <Popover
            placement="bottomRight"
            trigger="click"
            content={
              <Space direction="vertical">
                <Tooltip title="找不到结果时可尝试旧版搜索；旧版通常不含标签和分类">
                  <Checkbox
                    checked={!useNewBangumiSearchApi}
                    onChange={(e) =>
                      setUseNewBangumiSearchApi(!e.target.checked)
                    }
                  >
                    使用旧版搜索
                  </Checkbox>
                </Tooltip>
                <Checkbox
                  checked={hideDoujin}
                  onChange={(e) => setHideDoujin(e.target.checked)}
                >
                  隐藏同人
                </Checkbox>
                <Tooltip title="仅显示 TV、WEB、剧场版和 OVA；旧版搜索不应用此筛选">
                  <Checkbox
                    checked={useNewBangumiSearchApi && hideUnknown}
                    disabled={!useNewBangumiSearchApi}
                    onChange={(e) => setHideUnknown(e.target.checked)}
                  >
                    隐藏未知分类
                  </Checkbox>
                </Tooltip>
              </Space>
            }
          >
            <Badge
              count={
                Number(!useNewBangumiSearchApi) +
                Number(hideDoujin) +
                Number(useNewBangumiSearchApi && hideUnknown)
              }
              color="var(--lani-primary)"
              size="small"
            >
              <Button aria-label="搜索设置" icon={<SettingOutlined />} />
            </Badge>
          </Popover>
        </div>
        <Spin spinning={initialLoading} delay={0}>
          <div
            ref={scrollRef}
            className={styles.searchScroll}
            style={{ height: mobile ? 424 : 624 }}
          >
            <div className={styles.searchContent}>
              <List
                dataSource={searchReady ? displayedItems : []}
                locale={{
                  emptyText:
                    initialLoading || error ? (
                      <div className={styles.loadingPlaceholder} />
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          items.length
                            ? '没有符合筛选条件的结果，可调整搜索设置'
                            : '暂无数据'
                        }
                      />
                    ),
                }}
                rowKey="id"
                grid={{
                  column: 2,
                  xs: 1,
                  sm: 1,
                }}
                renderItem={(item) => (
                  <BangumiSearchCard
                    key={item.id}
                    item={item}
                    selected={item.id === selected?.id}
                    keywords={keywordsDebounced}
                    onSelect={setSelected}
                  />
                )}
              />
              <div
                ref={bottomRef}
                className={styles.searchFooter}
                role="status"
              >
                {searchReady &&
                  !initialLoading &&
                  (loading ? (
                    <Space>
                      <Spin size="small" />
                      加载中
                    </Space>
                  ) : error ? (
                    <Space>
                      加载失败
                      <Button type="link" size="small" onClick={loadMore}>
                        重试
                      </Button>
                    </Space>
                  ) : !hasMore && displayedItems.length > 0 ? (
                    '到底了'
                  ) : null)}
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </Modal>
  );
}

export const useAddFromBangumiDialog = createUseDialog(AddFromBangumiDialog);
