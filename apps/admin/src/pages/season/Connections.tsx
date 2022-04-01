import { IconPath } from '@/constants/icon-path';
import ProForm, { ProFormDependency, ProFormText } from '@ant-design/pro-form';
import {
  Alert,
  Divider,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
} from 'antd';
import styles from './Connections.module.less';

export default function Connections() {
  return (
    <div className={styles.root}>
      <Typography.Text>关联设置</Typography.Text>
      <Divider className={styles.divider} />
      <ProFormDependency name={['jellyfinId']}>
        {({ jellyfinId }) =>
          !jellyfinId ? (
            <Alert
              message="Jellyfin季度ID未设置，下载流程中无法获取Jellyfin剧集ID，无法进行推送，点击“写入元数据”写入并获取季度ID"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </ProFormDependency>
      <ProForm.Group>
        <ProFormText
          name="bangumiId"
          label={
            <Space>
              <img src={IconPath.bangumiIcon} className={styles.icon} />
              <Typography.Text>bangumi.tv</Typography.Text>
            </Space>
          }
          width="sm"
        />
        <Form.Item
          name="bilibiliThmId"
          label={
            <Space>
              <img src={IconPath.bilibiliIcon} className={styles.icon} />
              <Typography.Text>B站港澳台</Typography.Text>
            </Space>
          }
        >
          <Input
            addonBefore="ss"
            placeholder="请输入"
            style={{
              width: 216,
            }}
          />
        </Form.Item>
        <Form.Item
          name="bilibiliMainlandId"
          label={
            <Space>
              <img
                src={IconPath.bilibiliMainlandIcon}
                className={styles.icon}
              />
              <Typography.Text>B站大陆</Typography.Text>
            </Space>
          }
        >
          <Input
            addonBefore="ss"
            placeholder="请输入"
            style={{
              width: 216,
            }}
          />
        </Form.Item>
        <ProFormText
          name="mikanAnimeId"
          label={
            <Space>
              <img src={IconPath.mikanAnimeIcon} className={styles.icon} />
              <Typography.Text>Mikan Anime</Typography.Text>
            </Space>
          }
          width="sm"
        />
        <ProFormText
          name="jellyfinId"
          label={
            <Space>
              <img src={IconPath.jellyfinIcon} className={styles.icon} />
              <Typography.Text>Jellyfin</Typography.Text>
            </Space>
          }
          width="md"
        />
        <Form.Item
          label={
            <Space>
              <img src={IconPath.thetvdbIcon} className={styles.icon} />
              <Typography.Text>theTVDB</Typography.Text>
            </Space>
          }
        >
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <Form.Item name="tvdbId" noStyle>
              <Input
                placeholder="请输入"
                addonAfter="S"
                style={{
                  width: 216,
                }}
              />
            </Form.Item>
            <Form.Item name="tvdbSeason" noStyle>
              <InputNumber min={1} placeholder="季度" />
            </Form.Item>
          </Input.Group>
        </Form.Item>
      </ProForm.Group>
    </div>
  );
}
