import {
  CreateSeasonDocument,
  MetadataSource,
  SearchBangumiDocument,
  SearchBangumiQuery,
  SyncEpisodeDataDocument,
  SyncMetadataDocument,
} from '@/generated/types';
import { useJellyfinFolders } from '@/pages/seasons/useJellyfinFolders';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import useMobile from '@/utils/useMobile';
import { useApolloClient, useQuery } from '@apollo/client';
import { useDebounce } from 'ahooks';
import {
  Button,
  Image,
  Input,
  List,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import styles from './AddFromBangumiDialog.module.less';

export default function AddFromBangumiDialog({
  visible,
  resolve,
  reject,
}: DialogProps<void, { id: number }>) {
  const client = useApolloClient();
  const [keywords, setKeywords] = useState('');
  const keywordsDebounced = useDebounce(keywords, {
    wait: 500,
  });
  const { data, loading } = useQuery(SearchBangumiDocument, {
    variables: {
      keywords: keywordsDebounced,
    },
    skip: !keywordsDebounced,
  });
  const [selected, setSelected] = useState<
    SearchBangumiQuery['searchBangumi'][0] | undefined
  >(undefined);
  useEffect(() => {
    setSelected(undefined);
  }, [keywords]);
  useEffect(() => {
    if (visible) {
      setKeywords('');
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
                    void message.success('同步元数据成功');
                    void resolve({ id });
                  } catch (e) {
                    console.error(e);
                    void message.error('同步元数据失败');
                  } finally {
                    hide();
                  }
                } catch (e) {
                  console.error(e);
                  void message.error('新建失败');
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
        <Input
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="输入关键词"
        />
        <Spin spinning={loading}>
          <div
            style={{
              height: mobile ? 400 : 600,
              overflow: 'auto',
              marginLeft: -8,
              marginRight: -8,
            }}
          >
            <List
              dataSource={data?.searchBangumi ?? []}
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
          </div>
        </Spin>
      </Space>
    </Modal>
  );
}

export const useAddFromBangumiDialog = createUseDialog(AddFromBangumiDialog);
