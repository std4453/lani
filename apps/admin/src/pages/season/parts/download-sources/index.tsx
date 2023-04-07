import AsyncButton from '@/components/AsyncButton';
import FormDependency from '@/components/FormDependency';
import { useSearchTorrentDialog } from '@/components/SearchTorrentDialog';
import { DownloadSource, GetMatchingTorrentsDocument } from '@/generated/types';
import { LaniError, handleError } from '@/utils/error';
import { extractNode } from '@/utils/graphql';
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
  ProFormSelect,
  ProFormSwitch,
  ProFormTextArea,
} from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { Alert, Button, Form, Space, Tooltip, Typography, message } from 'antd';
import { FormListOperation } from 'antd/lib/form/FormList';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { escapeRegExp } from 'lodash';
import { useRef } from 'react';
import Section from '../../components/section';
import { FormValues, formItemProps, useSeasonPageContext } from '../../help';
import styles from './index.module.less';

export default function DownloadSources() {
  const ref = useRef<FormListOperation>();
  const { formRef, episodes, updateTouched, id } = useSeasonPageContext();
  const [searchTorrentDialog, , openSearchTorrent] = useSearchTorrentDialog();
  const client = useApolloClient();

  const autoMatchDownloadOffset = useMemoizedFn(async () => {
    const form = formRef.current;
    if (!form) {
      return;
    }
    try {
      const sources = form.getFieldValue('downloadSources') as DownloadSource[];
      if (!sources.length) {
        void message.info('请先添加种子标题匹配规则');
        return;
      }
      if (!episodes.length) {
        void message.info('请先同步剧集信息');
        return;
      }

      let earliestEpisodeAirTime = Number.MAX_VALUE;
      for (const episode of episodes) {
        if (!episode.airTime) {
          continue;
        }
        const newAirTime = dayjs(episode.airTime).unix();
        if (newAirTime < earliestEpisodeAirTime) {
          earliestEpisodeAirTime = newAirTime;
        }
      }
      if (earliestEpisodeAirTime === Number.MAX_VALUE) {
        throw new Error();
      }

      const { data } = await client.query({
        query: GetMatchingTorrentsDocument,
        variables: {
          filter: {
            and: [
              {
                // 这里为了防止筛选进不必要的种子，从最早的一集放送时间往前取了 15 天，因为
                // 偏移量最大是 15 天
                publishDate: {
                  greaterThan: dayjs
                    .unix(earliestEpisodeAirTime)
                    .subtract(15, 'd')
                    .toISOString(),
                },
              },
              {
                or: sources.map(({ pattern }) => ({
                  title: {
                    like: pattern,
                  },
                })),
              },
            ],
          },
          first: 100,
        },
      });
      const torrents = extractNode(data.allTorrents);
      if (!torrents) {
        // 不应该
        throw new Error();
      }
      if (!torrents.length) {
        throw new LaniError('未匹配到种子');
      }

      let minimumOffset = Number.MAX_VALUE;

      for (const torrent of torrents) {
        const { title, episodeIndex, publishDate } = torrent;
        if (!title || typeof episodeIndex !== 'number') {
          // 非常特殊的情况，一般是 SP，忽略这条种子
          continue;
        }

        // 找到匹配的规则
        const matchedSource = sources.find(({ pattern }) => {
          const escapedPattern = escapeRegExp(pattern);
          // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
          const regexpPattern = new RegExp(
            `^${escapedPattern.replace('%', '.*')}$`,
          );
          return regexpPattern.test(title);
        });
        if (!matchedSource) {
          // 不应该出现，忽略这条种子
          console.error('Torrent has no matched source', torrent);
          continue;
        }

        // 找到对应的剧集
        const { offset } = matchedSource;
        const realEpisodeIndex = episodeIndex - offset;
        const matchedEpisode = episodes.find(
          ({ index }) => index === realEpisodeIndex,
        );
        if (!matchedEpisode) {
          // 比如某条规则匹配到了 1~24，但我们需要的只有第二季的 13~24，属于正常情况，可以直接
          // 忽略这条种子
          continue;
        }

        const { rawAirTime } = matchedEpisode;
        if (!rawAirTime) {
          // 剧集没有原始发布时间，忽略这条种子
          continue;
        }
        // 时间差，单位小时，注意是 rawAirTime -> publishTime，如果 publishTime 大
        // 的话，得到正数
        const diff = dayjs(publishDate).diff(rawAirTime, 'hour', true);
        if (diff < minimumOffset) {
          minimumOffset = diff;
        }
      }

      if (minimumOffset === Number.MAX_VALUE) {
        // 没有匹配到任何种子
        void message.error('无法匹配种子和剧集，请检查数据是否正确');
        return;
      }

      // 最终设置的小时数为最小时间差向 -Infinity 取整，可以提早开始下载但不能晚
      // 注意这里，延后的话是负数，提前是正数，和 downloadOffsetHours 相同
      const finalOffset = -Math.floor(minimumOffset);

      form.setFieldsValue({
        downloadOffsetType: finalOffset >= 0 ? 'advance' : 'postpone',
        downloadOffsetDays: Math.floor(Math.abs(finalOffset) / 24),
        downloadOffsetHours: Math.abs(finalOffset) % 24,
      });
      updateTouched();

      void message.success('设置成功');
    } catch (error) {
      handleError(error, '设置失败');
    }
  });

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
                        偏移X集，则该标题匹配到的第(1+X)集，对应lani系统中第1集，通常用于年番后半季、第二季中，种子集数不从1开始的情况
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
                seasonId: id,
                useLocalSavedKeyword: true,
                saveLocalKeyword: true,
                seasonFullName: formRef.current?.getFieldValue('title'),
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
      <Form.Item
        label={
          <>
            下载时间&nbsp;
            <Tooltip title="当剧集数据中的放送时间与实际放送时间有差异时，提前或延后开始下载。通常用于处理先行放送、整周偏移，以及bangumi数据无精确时间的问题">
              <QuestionCircleOutlined />
            </Tooltip>
          </>
        }
        {...formItemProps}
      >
        <Space className={styles.timeOffset}>
          基于剧集放送时间，
          <ProFormSelect
            name="downloadOffsetType"
            valueEnum={{
              advance: '提前',
              postpone: '延后',
            }}
            placeholder="请选择"
            formItemProps={{
              noStyle: true,
            }}
            width={100}
          />
          <ProFormDigit
            name="downloadOffsetDays"
            formItemProps={{ noStyle: true }}
            width="xs"
            min={0}
            max={14}
          />
          天
          <ProFormDigit
            name="downloadOffsetHours"
            formItemProps={{ noStyle: true }}
            width="xs"
            min={0}
            max={24}
          />
          小时开始下载
          <Tooltip title="根据种子标题匹配规则，自动设置提前或延后时间">
            <AsyncButton
              type="primary"
              ghost
              style={{
                marginLeft: 8,
              }}
              onClick={autoMatchDownloadOffset}
            >
              自动设置
            </AsyncButton>
          </Tooltip>
        </Space>
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
