import AsyncButton from '@/components/AsyncButton';
import FormDependency from '@/components/FormDependency';
import { IconPath } from '@/constants/icon-path';
import {
  AllJellyfinFoldersDocument,
  SyncJellyfinSeriesIdDocument,
} from '@/generated/types';
import { FormValues } from '@/pages/season/help';
import Section from '@/pages/season/Section';
import { extractNode } from '@/utils/graphql';
import { SearchOutlined } from '@ant-design/icons';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import {
  Alert,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Typography,
} from 'antd';
import styles from './Connections.module.less';

export default function Connections({
  id,
  reloadConfig,
}: {
  id: number;
  reloadConfig: () => Promise<void>;
}) {
  const client = useApolloClient();
  return (
    <Section title="关联设置">
      <FormDependency<FormValues> name={['jellyfinFolderId']}>
        {({ jellyfinFolderId }) =>
          !jellyfinFolderId ? (
            <Alert
              message="Jellyfin媒体库未设置，同步元数据、剧集信息、下载将不可用"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <FormDependency<FormValues> name={['jellyfinFolderId', 'jellyfinId']}>
        {({ jellyfinFolderId, jellyfinId }) =>
          jellyfinFolderId && !jellyfinId ? (
            <Alert
              message="Jellyfin季度ID未设置，下载流程中无法获取Jellyfin剧集ID，无法进行推送"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
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
        <Form.Item
          label={
            <Space>
              <img src={IconPath.jellyfinIcon} className={styles.icon} />
              <Typography.Text>Jellyfin</Typography.Text>
            </Space>
          }
        >
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <ProFormSelect
              name="jellyfinFolderId"
              formItemProps={{
                noStyle: true,
              }}
              request={async () => {
                const { data } = await client.query({
                  query: AllJellyfinFoldersDocument,
                });
                return (extractNode(data.allJellyfinFolders) ?? []).map(
                  (folder) => ({
                    value: folder.id,
                    label: `${folder.name} (${folder.location})`,
                  }),
                );
              }}
              width={160}
              placeholder="媒体库"
            />
            <FormDependency<FormValues> name={['jellyfinFolderId']}>
              {({ jellyfinFolderId }) => [
                <Form.Item name="jellyfinId" noStyle key={0}>
                  <Input
                    placeholder="32位季度ID"
                    addonBefore="中的"
                    style={{
                      width: 360,
                    }}
                    disabled={!jellyfinFolderId}
                  />
                </Form.Item>,
                <AsyncButton
                  key={1}
                  icon={<SearchOutlined />}
                  disabled={!jellyfinFolderId}
                  onClick={async () => {
                    try {
                      const { data } = await client.mutate({
                        mutation: SyncJellyfinSeriesIdDocument,
                        variables: {
                          seasonId: id,
                        },
                      });
                      if (!data?.syncJellyfinSeriesId) {
                        void message.error('获取Jellyfin季度ID失败');
                        return;
                      }
                      void message.success('获取Jellyfin季度ID成功');
                      void reloadConfig();
                    } catch (error) {
                      console.error(error);
                      void message.error('获取Jellyfin季度ID失败');
                    }
                  }}
                />,
              ]}
            </FormDependency>
          </Input.Group>
        </Form.Item>
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
    </Section>
  );
}
