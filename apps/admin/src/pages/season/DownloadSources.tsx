import { formItemProps } from '@/pages/season/help';
import { MinusOutlined } from '@ant-design/icons';
import {
  ProFormList,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Divider, Form, Typography } from 'antd';
import styles from './DownloadSources.module.less';

export default function DownloadSources() {
  return (
    <div className={styles.root}>
      <Typography.Text>下载配置</Typography.Text>
      <Divider className={styles.divider} />
      <ProFormText
        label="下载根目录"
        name="seasonRoot"
        formItemProps={formItemProps}
        width="lg"
      />
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
          creatorRecord={{
            id: 0,
            pattern: '',
          }}
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
                  {
                    validator: async (_, value: string) => {
                      try {
                        RegExp(`^(${value})$`);
                      } catch (error) {
                        console.log('shit', value);
                        throw new Error('正则表达式错误');
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
      </Form.Item>
    </div>
  );
}
