import FormDependency from '@/components/FormDependency';
import { weekdayToText, weekdayToValueEnum } from '@/constants';
import { MetadataSource } from '@/generated/types';
import {
  ProFormDependency,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { Alert, Form, FormInstance, Input, Space, Tag, Typography } from 'antd';
import clsx from 'clsx';
import Section from '../../components/section';
import { formItemProps, FormValues } from '../../help';
import styles from './index.module.less';

function ImageDisplay({
  src,
  className,
}: {
  src: string | undefined | null;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        styles.imageContainer,
        {
          [styles.withImage]: Boolean(src),
        },
        className,
      )}
    >
      {src ? <img className={styles.image} src={src} /> : null}
    </div>
  );
}

export default function Metadata() {
  return (
    <Section title="元数据">
      <FormDependency<FormValues> name={['infoSource']}>
        {({ infoSource }) =>
          infoSource === MetadataSource.Manual ? (
            <Alert
              message="元数据来源为手动，无法自动同步。目前部分元数据字段无法前端修改，这部分字段将缺失"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <FormDependency<FormValues> name={['infoSource', 'bangumiId']}>
        {({ infoSource, bangumiId }) =>
          infoSource === MetadataSource.BgmCn && !bangumiId ? (
            <Alert
              message="Bangumi关联信息未设置，无法从Bangumi同步元数据"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <FormDependency<FormValues> name={['infoSource', 'tvdbId', 'tvdbSeason']}>
        {({ infoSource, tvdbId, tvdbSeason }) =>
          infoSource === MetadataSource.Skyhook &&
          (!tvdbId || typeof tvdbSeason !== 'number') ? (
            <Alert
              message="theTVDB关联信息不完整，无法从Skyhook同步元数据"
              type="warning"
              showIcon
              style={{
                marginBottom: 16,
              }}
            />
          ) : null
        }
      </FormDependency>
      <ProFormSelect
        name="infoSource"
        label="元数据来源"
        formItemProps={formItemProps}
        options={[
          {
            label: 'Bangumi（中文）',
            value: MetadataSource.BgmCn,
          },
          {
            label: 'Skyhook（英语）',
            value: MetadataSource.Skyhook,
          },
          {
            label: '手动',
            value: MetadataSource.Manual,
          },
        ]}
        width="sm"
      />
      <ProFormTextArea
        name="description"
        label="简介"
        fieldProps={{
          rows: 10,
          disabled: true,
          autoSize: {
            minRows: 10,
          },
        }}
        formItemProps={formItemProps}
      />
      <Form.Item label="标签" {...formItemProps} dependencies={['tags']}>
        {(form: FormInstance<FormValues>) => {
          const tags = (form.getFieldValue('tags') as string[]) ?? [];
          if (tags.length > 0) {
            return tags.map((tag) => (
              <Tag key={tag} color="blue" className={styles.tag}>
                {tag}
              </Tag>
            ));
          } else {
            return <div className={styles.noData}>无数据</div>;
          }
        }}
      </Form.Item>
      <Form.Item label="放送日程" {...formItemProps}>
        <Space className={styles.schedule}>
          从
          <ProFormDigit
            name="year"
            formItemProps={{ noStyle: true }}
            width="xs"
            min={2000}
            max={2100}
          />
          年
          <ProFormSelect
            name="semester"
            valueEnum={{
              0: '其他',
              1: '春季（4月）',
              2: '夏季（7月）',
              3: '秋季（10月）',
              4: '冬季（1月）',
            }}
            placeholder="请选择"
            formItemProps={{
              noStyle: true,
            }}
            width={120}
          />
          开始，每
          <Input.Group
            compact
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <ProFormSelect
              name="weekday"
              valueEnum={weekdayToValueEnum}
              placeholder="请选择"
              formItemProps={{
                noStyle: true,
              }}
              width={120}
            />
            <ProFormText
              name="airTime"
              placeholder="HH:mm"
              formItemProps={{
                noStyle: true,
              }}
              width={120}
            />
          </Input.Group>
          <Typography.Text>
            放送
            <ProFormDependency name={['weekday', 'airTime']}>
              {({ weekday, airTime }) => {
                if (
                  weekday &&
                  typeof airTime === 'string' &&
                  /^\d{2}:\d{2}$/.test(airTime)
                ) {
                  const hours = parseInt(airTime.substring(0, 2));
                  const minutes = airTime.substring(3, 5);
                  const weekdayNum = parseInt(weekday);
                  if (hours >= 24) {
                    return `（即${weekdayToText[(weekdayNum + 1) % 7]} ${(
                      hours - 24
                    )
                      .toString()
                      .padStart(2, '0')}:${minutes}）`;
                  }
                }
                return null;
              }}
            </ProFormDependency>
          </Typography.Text>
        </Space>
      </Form.Item>
      <Form.Item label="图片" {...formItemProps}>
        <FormDependency<FormValues> name={['poster', 'fanart', 'banner']}>
          {({ poster, fanart, banner }) => (
            <div className={styles.images}>
              <ImageDisplay
                src={poster?.downloadPath}
                className={styles.posterContainer}
              />
              <div className={styles.rightColumn}>
                <ImageDisplay
                  src={banner?.downloadPath}
                  className={styles.bannerContainer}
                />
                <ImageDisplay
                  src={fanart?.downloadPath}
                  className={styles.fanartContainer}
                />
              </div>
            </div>
          )}
        </FormDependency>
      </Form.Item>
    </Section>
  );
}
