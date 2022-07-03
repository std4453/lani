import FormDependency from '@/components/FormDependency';
import { useSearchTorrentDialog } from '@/components/SearchTorrentDialog';
import {
  formItemProps,
  FormValues,
  useSeasonPageContext,
} from '@/pages/season/help';
import Section from '@/pages/season/Section';
import { matchTorrentEpisode } from '@/utils/matchTorrentTitle';
import { getSeasonKeyword } from '@/utils/season';
import {
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  ProFormDigit,
  ProFormList,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Alert, Button, Form, Tooltip, Typography } from 'antd';
import { FormListOperation } from 'antd/lib/form/FormList';
import clsx from 'clsx';
import { useRef } from 'react';
import styles from './DownloadSources.module.less';

export default function DownloadSources() {
  const ref = useRef<FormListOperation>();
  const { formRef } = useSeasonPageContext();
  const [searchTorrentDialog, , openSearchTorrent] = useSearchTorrentDialog();

  return (
    <Section title="下载配置">
      <FormDependency<FormValues> name={['needDownloadCc', 'bilibiliThmId']}>
        {({ needDownloadCc, bilibiliThmId }) =>
          needDownloadCc && !bilibiliThmId ? (
            <Alert
              message="未设置Bilibili港澳台ID，无法自动下载字幕"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
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
              <div className={styles.offset}>
                <Typography.Text className={styles.offsetText}>
                  偏移&nbsp;
                  <Tooltip
                    title={
                      <>
                        偏移3集表示该标题匹配到的第3集
                        <br />
                        对应系统中第1集
                      </>
                    }
                  >
                    <QuestionCircleOutlined />
                  </Tooltip>
                </Typography.Text>
                <ProFormDigit
                  name="offset"
                  min={0}
                  max={100}
                  width="xs"
                  formItemProps={{
                    noStyle: true,
                  }}
                />
                <Typography.Text
                  className={clsx(styles.offsetText, styles.after)}
                >
                  集
                </Typography.Text>
              </div>
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
                offset: 0,
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
              if (!formRef.current) {
                return;
              }
              const result = await openSearchTorrent({
                keyword: getSeasonKeyword(
                  formRef.current.getFieldValue('title'),
                ),
              });
              if (result.type !== 'success') {
                return;
              }
              const title = result.output.title;
              const match = matchTorrentEpisode(title);
              if (match) {
                const { index, length } = match;
                ref.current?.add({
                  id: 0,
                  // 匹配到剧集的部分使用\d+代替，其余部分保持不变
                  pattern: `${title.substring(0, index)}%${title.substring(
                    index + length,
                  )}`,
                  offset: 0,
                });
              } else {
                ref.current?.add({
                  id: 0,
                  pattern: title,
                  offset: 0,
                });
              }
            }}
          >
            从已有种子新建规则……
          </Button>
        </div>
      </Form.Item>
      <ProFormSwitch
        label="需要下载字幕"
        name="needDownloadCc"
        formItemProps={formItemProps}
      />
      {searchTorrentDialog}
    </Section>
  );
}
