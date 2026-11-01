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
  Button,
  Checkbox,
  Image,
  Input,
  List,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import styles from './AddFromBangumiDialog.module.less';
import { handleError } from '@/utils/error';
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useBangumiSearch } from './useBangumiSearch';
import BangumiTags from './BangumiTags';

export default function AddFromBangumiDialog({
  visible,
  resolve,
  reject,
}: DialogProps<void, { id: number }>) {
  const client = useApolloClient();
  const [keywords, setKeywords] = useState('');
  const [useNewBangumiSearchApi, setUseNewBangumiSearchApi] = useState(true);
  const keywordsDebounced = useDebounce(keywords, {
    wait: 500,
  });
  const searchReady =
    visible && !!keywords.trim() && keywords === keywordsDebounced;
  const { items, loading, hasMore, error, loadMore } = useBangumiSearch(
    keywords,
    useNewBangumiSearchApi,
    searchReady,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
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
  }, [searchReady, loading, error, hasMore, loadMore]);
  const [selected, setSelected] = useState<
    SearchBangumiQuery['searchBangumi'][0] | undefined
  >(undefined);
  useEffect(() => {
    setSelected(undefined);
    scrollRef.current?.scrollTo(0, 0);
  }, [keywords, useNewBangumiSearchApi, visible]);
  useEffect(() => {
    if (visible) {
      setKeywords('');
      setUseNewBangumiSearchApi(true);
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
    >
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginRight: -8,
          }}
        >
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder={'输入关键词，或「bgmid: 100000」精确查找'}
            allowClear
          />
          <Checkbox
            checked={!useNewBangumiSearchApi}
            onChange={(e) => {
              setUseNewBangumiSearchApi(!e.target.checked);
            }}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            使用旧版搜索&nbsp;
            <Tooltip title="默认使用新版搜索；找不到结果时可尝试旧版搜索，旧版通常不含标签">
              <QuestionCircleOutlined />
            </Tooltip>
          </Checkbox>
        </div>
        <Spin spinning={loading && items.length === 0}>
          <div
            ref={scrollRef}
            style={{
              height: mobile ? 400 : 600,
              overflow: 'auto',
              marginLeft: -8,
              marginRight: -8,
            }}
          >
            <List
              dataSource={items}
              rowKey="id"
              grid={{
                column: 2,
                xs: 1,
                sm: 1,
              }}
              renderItem={(item) => (
                <div key={item.id} className={styles.itemContainer}>
                  <div
                    onClick={() => {
                      setSelected(item);
                    }}
                    className={clsx(styles.item, {
                      [styles.selected]: item.id === selected?.id,
                    })}
                  >
                    <div className={styles.content}>
                      <Space>
                        {item.name}
                        {item.added && <Tag color="green">已添加</Tag>}
                      </Space>
                      {item.airDate ? (
                        <Typography.Paragraph type="secondary">
                          放送日期：{item.airDate}
                        </Typography.Paragraph>
                      ) : null}
                      <BangumiTags tags={item.tags} />
                    </div>
                    <Image
                      src={item.image ?? undefined}
                      width={75}
                      height={106}
                      preview={false}
                      className={styles.image}
                      wrapperClassName={styles.imageWrapper}
                    />
                  </div>
                </div>
              )}
            />
            <div ref={bottomRef} className={styles.searchFooter} role="status">
              {searchReady &&
                (loading ? (
                  <Space>
                    <LoadingOutlined spin />
                    加载中
                  </Space>
                ) : error ? (
                  <Space>
                    加载失败
                    <Button type="link" size="small" onClick={loadMore}>
                      重试
                    </Button>
                  </Space>
                ) : !hasMore ? (
                  '到底了'
                ) : null)}
            </div>
          </div>
        </Spin>
      </Space>
    </Modal>
  );
}

export const useAddFromBangumiDialog = createUseDialog(AddFromBangumiDialog);
