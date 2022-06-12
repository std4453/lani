import { COSService } from '@/common/cos.service';
import config from '@/config';
import { LarkConfig } from '@/config/types';
import { DateFormat } from '@/constants/date-format';
import { env } from '@/env';
import {
  buildCardMessage,
  buildPostMessage,
  buildTextMessage,
  LarkMessage,
  LarkPostTag,
  LarkReceiveIDType,
} from '@/notification/lark/types';
import {
  ManagementNotificationProvider,
  OnEpisodesMissingEpisode,
} from '@/notification/ManagementNotificationProvider';
import {
  OnEpisodePublishEpisode,
  UserNotificationProvider,
} from '@/notification/UserNotificationProvider';
import * as lark from '@larksuiteoapi/allcore';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ID, Mutation, Resolver } from '@nestjs/graphql';
import { DownloadJob, DownloadStatus } from '@lani/db';
import dayjs from 'dayjs';

@Injectable()
@Resolver()
export class LarkBot
  implements ManagementNotificationProvider, UserNotificationProvider
{
  private larkConfig: LarkConfig;
  private conf: lark.core.Config;

  constructor(private cos: COSService) {
    const {
      notifications: { lark: larkConfig },
    } = config;
    if (!larkConfig) {
      throw new Error('lark is not configured!');
    }
    this.larkConfig = larkConfig;
    const appSettings = lark.newInternalAppSettings({
      appID: this.larkConfig.appId,
      appSecret: this.larkConfig.appSecret,
      encryptKey: this.larkConfig.encryptKey,
      verificationToken: this.larkConfig.verificationToken,
    });
    this.conf = lark.newConfig(lark.Domain.FeiShu, appSettings, {
      loggerLevel: lark.LoggerLevel.INFO,
    });
  }

  async onEpisodePublish(episode: OnEpisodePublishEpisode) {
    let imageEl: any | undefined = undefined;

    const posterImage = episode.season.posterImage;
    if (posterImage?.cosPath) {
      const bucket = config.cos.imagesBucket;
      try {
        const { Body: image } = await this.cos.getObject({
          Bucket: bucket.bucket,
          Region: bucket.region,
          Key: posterImage.cosPath,
        });
        const formData = new lark.api.FormData();
        formData.addField('image_type', 'message');
        formData.addFile('image', new lark.api.File().setContent(image));
        const resp = await this.request(
          '/open-apis/im/v1/images',
          'POST',
          lark.api.AccessTokenType.Tenant,
          formData,
        );
        imageEl = {
          alt: {
            content: episode.season.title,
            tag: 'plain_text',
          },
          img_key: resp.data.image_key,
          tag: 'img',
        };
      } catch (error) {
        console.error(error);
      }
    }

    // TODO: 发给用户
    await this.sendMessage(
      'chat_id',
      this.larkConfig.adminChatId,
      buildCardMessage({
        config: {
          wide_screen_mode: true,
        },
        elements: [
          imageEl,
          {
            tag: 'markdown',
            content: [
              `标题：${episode.title}`,
              `放送日期：${dayjs(episode.airTime).format(DateFormat.BarDay)}`,
              `简介：${episode.description}`,
            ].join('\n'),
          },
          {
            actions: [
              episode.jellyfinEpisodeId && {
                tag: 'button',
                text: {
                  content: '在线观看',
                  tag: 'plain_text',
                },
                type: 'primary',
                url: `${config.jellyfin.publicHost}/web/index.html#!/details?id=${episode.jellyfinEpisodeId}`,
              },
              episode.season.jellyfinFolder?.jellyfinId && {
                tag: 'button',
                text: {
                  content: '全部动画',
                  tag: 'plain_text',
                },
                type: 'default',
                url: `${config.jellyfin.publicHost}/web/index.html#!/tv.html?topParentId=${episode.season.jellyfinFolder.jellyfinId}`,
              },
            ].filter(Boolean),
            tag: 'action',
          },
        ].filter(Boolean),
        header: {
          template: 'turquoise',
          title: {
            content: `【动画更新】 ${episode.season.title} #${episode.index}`,
            tag: 'plain_text',
          },
        },
      }),
    );
  }

  private getDownloadJobState(job: DownloadJob) {
    const state =
      {
        [DownloadStatus.AVAILABLE]: {
          children: '可用',
        },
        [DownloadStatus.DOWNLOADING]: {
          children: '下载中',
        },
        [DownloadStatus.DOWNLOAD_COMPLETED]: {
          children: '寻找文件',
        },
        [DownloadStatus.IMPORTING]: {
          children: '导入中',
        },
        [DownloadStatus.PLAYER_WAITING]: {
          children: '等待识别',
        },
        [DownloadStatus.WRITING_METADATA]: {
          children: '写入元数据',
        },
        [DownloadStatus.DOWNLOAD_SUBMITTING]: {
          children: '提交下载',
        },
      }[job.status] ?? '未知';
    return `${state}${job.isFailed ? '，已失败' : ''}`;
  }

  async onEpisodesMissing(episodes: OnEpisodesMissingEpisode[]) {
    const now = dayjs().format(DateFormat.DateTime);
    await this.sendMessage(
      'chat_id',
      this.larkConfig.adminChatId,
      buildPostMessage({
        title: `缺集告警（共 ${episodes.length} 集）`,
        content: [
          ...episodes.map((episode, index): LarkPostTag[] => [
            {
              tag: 'text',
              text: `${index + 1}.`,
            },
            {
              tag: 'a',
              text: episode.season.title,
              href: `${config.lani.publicHost}/season/${episode.season.id}`,
            },
            {
              tag: 'text',
              text: ` #${episode.index} (发布于 ${dayjs(episode.airTime).format(
                DateFormat.DateTime,
              )}${
                episode.downloadJobs.length > 0
                  ? `，下载状态：${this.getDownloadJobState(
                      episode.downloadJobs[0],
                    )}`
                  : ''
              })`,
            },
          ]),
          [
            {
              tag: 'text',
              text: `以上剧集截止 ${now} 已经缺少超过 12 小时，请及时处理`,
            },
          ],
          [
            {
              tag: 'text',
              text: '相关链接：',
            },
            {
              tag: 'a',
              href: `${config.lani.publicHost}/seasons?f_episodes=lack&f_isMonitoring=true`,
              text: '缺集季度',
            },
            {
              tag: 'text',
              text: '、',
            },
            {
              tag: 'a',
              href: `${config.lani.publicHost}/jobs`,
              text: '下载任务',
            },
          ],
        ],
      }),
    );
  }

  private request(...args: Parameters<typeof lark.api.newRequest>) {
    return lark.api.sendRequest(this.conf, lark.api.newRequest(...args));
  }

  private sendMessage(
    receiveIDType: LarkReceiveIDType,
    receiveID: string,
    message: LarkMessage,
  ) {
    return this.request(
      `/open-apis/im/v1/messages?receive_id_type=${receiveIDType}`,
      'POST',
      lark.api.AccessTokenType.Tenant,
      {
        receive_id: receiveID,
        content: JSON.stringify(message.content),
        msg_type: message.msg_type,
      },
    );
  }

  @Mutation(() => ID)
  async larkSendTestMessage() {
    if (env !== 'dev') {
      throw new ForbiddenException('only available in dev mode');
    }
    this.sendMessage(
      'chat_id',
      this.larkConfig.adminChatId,
      buildTextMessage('测试消息'),
    );
    return 'ok';
  }
}
