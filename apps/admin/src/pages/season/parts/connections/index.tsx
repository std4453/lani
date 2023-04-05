import FormDependency from '@/components/FormDependency';
import { IconPath } from '@/constants/icon-path';
import {
  bangumiLink,
  bilibiliSeasonLink,
  jellyfinSeasonLink,
  tvdbLinkById,
} from '@/constants/link';
import { LinkOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Button, Form, Input, InputNumber, Space, Typography } from 'antd';
import Section from '../../components/section';
import { FormValues, useSeasonPageContext } from '../../help';
import styles from './index.module.less';

export default function Connections() {
  const { jellyfinId } = useSeasonPageContext();

  return (
    <Section title="关联设置" className={styles.root}>
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
            flexWrap: 'nowrap',
          }}
        >
          <ProFormText
            disabled
            name="jellyfinFolderDesc"
            formItemProps={{
              noStyle: true,
            }}
            width={160}
            placeholder="媒体库"
            fieldProps={{
              className: styles.jellyfinFolder,
            }}
          />
          <Input
            disabled
            placeholder="自动获取中"
            addonBefore="中的"
            style={{
              width: 360,
            }}
            className={styles.jellyfinInput}
            value={jellyfinId}
          />
          <Button
            icon={<LinkOutlined />}
            disabled={!jellyfinId}
            href={jellyfinSeasonLink(jellyfinId)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.button}
          />
        </Input.Group>
      </Form.Item>
      <ProForm.Group>
        <Form.Item
          label={
            <Space>
              <img src={IconPath.bangumiIcon} className={styles.icon} />
              <Typography.Text>bangumi.tv</Typography.Text>
            </Space>
          }
        >
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <ProFormText
              name="bangumiId"
              width="sm"
              formItemProps={{
                noStyle: true,
              }}
            />
            <FormDependency<FormValues> name={['bangumiId']}>
              {({ bangumiId }) => (
                <Button
                  icon={<LinkOutlined />}
                  disabled={!bangumiId}
                  href={bangumiLink(bangumiId)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </FormDependency>
          </Input.Group>
        </Form.Item>
        <Form.Item
          label={
            <Space>
              <img src={IconPath.bilibiliIcon} className={styles.icon} />
              <Typography.Text>B站港澳台</Typography.Text>
            </Space>
          }
        >
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <ProFormText
              name="bilibiliThmId"
              width="sm"
              formItemProps={{
                noStyle: true,
              }}
              fieldProps={{
                addonBefore: 'ss',
              }}
            />
            <FormDependency<FormValues> name={['bilibiliThmId']}>
              {({ bilibiliThmId }) => (
                <Button
                  icon={<LinkOutlined />}
                  disabled={!bilibiliThmId}
                  href={bilibiliSeasonLink(bilibiliThmId)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </FormDependency>
          </Input.Group>
        </Form.Item>
        <Form.Item
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
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <ProFormText
              name="bilibiliMainlandId"
              fieldProps={{
                addonBefore: 'ss',
              }}
              width="sm"
              formItemProps={{
                noStyle: true,
              }}
            />
            <FormDependency<FormValues> name={['bilibiliMainlandId']}>
              {({ bilibiliMainlandId }) => (
                <Button
                  icon={<LinkOutlined />}
                  disabled={!bilibiliMainlandId}
                  href={bilibiliSeasonLink(bilibiliMainlandId)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
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
            <FormDependency<FormValues> name={['tvdbId']} key={2}>
              {({ tvdbId }) => (
                <Button
                  icon={<LinkOutlined />}
                  disabled={!tvdbId}
                  href={tvdbLinkById(tvdbId)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              )}
            </FormDependency>
          </Input.Group>
        </Form.Item>
      </ProForm.Group>
    </Section>
  );
}
