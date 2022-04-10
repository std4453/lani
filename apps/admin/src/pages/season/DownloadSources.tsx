import { useSearchTorrentDialog } from '@/components/SearchTorrentDialog';
import { formItemProps } from '@/pages/season/help';
import Section from '@/pages/season/Section';
import { episodeRegex } from '@/utils/matchTorrentTitle';
import { MinusOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  ProFormList,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Button, Form } from 'antd';
import { FormListOperation } from 'antd/lib/form/FormList';
import { useRef } from 'react';
import styles from './DownloadSources.module.less';

export default function DownloadSources() {
  const ref = useRef<FormListOperation>();
  const [searchTorrentDialog, , openSearchTorrent] = useSearchTorrentDialog();
  return (
    <Section title="下载配置">
      <ProFormSwitch
        label="追番中"
        name="isMonitoring"
        formItemProps={formItemProps}
      />
      <Form.Item
        label="种子标题匹配"
        {...formItemProps}
        className={styles.form}
      >
        <ProFormList
          name="downloadSources"
          copyIconProps={false}
          deleteIconProps={false}
          creatorButtonProps={false}
          actionRef={ref}
        >
          {(meta, index, action) => (
            <div className={styles.row} key={meta.key}>
              <MinusOutlined
                onClick={() => {
                  action.remove(index);
                }}
                className={styles.button}
              />
              <ProFormTextArea
                name="pattern"
                rules={[
                  {
                    required: true,
                    message: '请输入匹配表达式',
                  },
                  {
                    validator: async (_, value: string) => {
                      if (value.includes('\n')) {
                        throw new Error('不能包含换行符');
                      }
                    },
                  },
                ]}
                fieldProps={{
                  autoSize: true,
                }}
                formItemProps={{
                  className: styles.item,
                }}
              />
            </div>
          )}
        </ProFormList>
        <div className={styles.row}>
          <PlusOutlined className={styles.button} />
          <Button
            type="dashed"
            className={styles.create}
            onClick={() => {
              ref.current?.add({
                id: 0,
                pattern: '',
              });
            }}
          >
            新建匹配规则
          </Button>
        </div>
        <div className={styles.row}>
          <SearchOutlined className={styles.button} />
          <Button
            type="primary"
            ghost
            className={styles.create}
            onClick={async () => {
              const result = await openSearchTorrent({});
              if (result.type !== 'success') {
                return;
              }
              const title = result.output.title;
              const match = title.match(episodeRegex);
              const index = match?.index;
              const length = match?.[0]?.length;
              if (typeof index === 'number' && index >= 0 && length) {
                ref.current?.add({
                  id: 0,
                  // 匹配到剧集的部分使用\d+代替，其余部分保持不变
                  pattern: `${title.substring(0, index)}%${title.substring(
                    index + length,
                  )}`,
                });
              } else {
                ref.current?.add({
                  id: 0,
                  pattern: title,
                });
              }
            }}
          >
            从已有种子新建规则……
          </Button>
        </div>
      </Form.Item>
      {searchTorrentDialog}
    </Section>
  );
}
