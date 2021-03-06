import { S3Service } from '@/common/s3.service';
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
import { DownloadJob, DownloadStatus } from '@lani/db';
import * as lark from '@larksuiteoapi/allcore';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ID, Mutation, Resolver } from '@nestjs/graphql';
import dayjs from 'dayjs';

@Injectable()
@Resolver()
export class LarkBot
  implements ManagementNotificationProvider, UserNotificationProvider
{
  private larkConfig: LarkConfig;
  private conf: lark.core.Config;

  constructor(private s3: S3Service) {
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
      try {
        const { Body: image } = await this.s3
          .getObject({
            Bucket: config.s3.bucket,
            Key: posterImage.cosPath,
          })
          .promise();
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

    // TODO: ????????????
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
              `?????????${episode.title}`,
              `???????????????${dayjs(episode.airTime).format(DateFormat.BarDay)}`,
              `?????????${episode.description}`,
            ].join('\n'),
          },
          {
            actions: [
              episode.jellyfinEpisodeId && {
                tag: 'button',
                text: {
                  content: '????????????',
                  tag: 'plain_text',
                },
                type: 'primary',
                url: `${config.jellyfin.publicHost}/web/index.html#!/details?id=${episode.jellyfinEpisodeId}`,
              },
              episode.season.jellyfinFolder?.jellyfinId && {
                tag: 'button',
                text: {
                  content: '????????????',
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
            content: `?????????????????? ${episode.season.title} #${episode.index}`,
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
          children: '??????',
        },
        [DownloadStatus.DOWNLOADING]: {
          children: '?????????',
        },
        [DownloadStatus.DOWNLOAD_COMPLETED]: {
          children: '????????????',
        },
        [DownloadStatus.IMPORTING]: {
          children: '?????????',
        },
        [DownloadStatus.PLAYER_WAITING]: {
          children: '????????????',
        },
        [DownloadStatus.WRITING_METADATA]: {
          children: '???????????????',
        },
        [DownloadStatus.DOWNLOAD_SUBMITTING]: {
          children: '????????????',
        },
      }[job.status] ?? '??????';
    return `${state}${job.isFailed ? '????????????' : ''}`;
  }

  async onEpisodesMissing(episodes: OnEpisodesMissingEpisode[]) {
    const now = dayjs().format(DateFormat.DateTime);
    await this.sendMessage(
      'chat_id',
      this.larkConfig.adminChatId,
      buildPostMessage({
        title: `?????????????????? ${episodes.length} ??????`,
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
              text: ` #${episode.index} (????????? ${dayjs(episode.airTime).format(
                DateFormat.DateTime,
              )}${
                episode.downloadJobs.length > 0
                  ? `??????????????????${this.getDownloadJobState(
                      episode.downloadJobs[0],
                    )}`
                  : ''
              })`,
            },
          ]),
          [
            {
              tag: 'text',
              text: `?????????????????? ${now} ?????????????????? 12 ????????????????????????`,
            },
          ],
          [
            {
              tag: 'text',
              text: '???????????????',
            },
            {
              tag: 'a',
              href: `${config.lani.publicHost}/seasons?f_episodes=lack&f_isMonitoring=true`,
              text: '????????????',
            },
            {
              tag: 'text',
              text: '???',
            },
            {
              tag: 'a',
              href: `${config.lani.publicHost}/jobs`,
              text: '????????????',
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
      buildTextMessage('????????????'),
    );
    return 'ok';
  }
}
