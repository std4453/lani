import { ImagePath } from '@/constants/icon-path';
import {
  CreateSeasonDocument,
  MetadataSource,
  SearchBangumiDocument,
  SearchBangumiQuery,
} from '@/generated/types';
import { createUseDialog, DialogProps } from '@/utils/useDialog';
import { useApolloClient, useQuery } from '@apollo/client';
import { useDebounce } from 'ahooks';
import {
  Image,
  Input,
  List,
  message,
  Modal,
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

  return (
    <Modal
      title="从Bangumi添加季度"
      visible={visible}
      onCancel={reject}
      okText="添加"
      okButtonProps={{
        disabled: !selected || selected.added,
      }}
      onOk={async () => {
        if (!selected) {
          return;
        }
        try {
          const { data } = await client.mutate({
            mutation: CreateSeasonDocument,
            variables: {
              season: {
                title: selected.name,
                bangumiId: selected.id,
                infoSource: MetadataSource.BgmCn,
                episodesSource: MetadataSource.BgmCn,
              },
            },
          });
          const id = data?.createSeason?.season?.id;
          if (!id) {
            throw new Error('no id');
          }
          void message.success('新建成功');
          resolve({ id });
        } catch (e) {
          console.error(e);
          void message.error('新建失败');
        }
      }}
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
              height: 600,
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