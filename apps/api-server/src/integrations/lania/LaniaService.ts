import { LocalAxiosService } from '@/common/axios.service';
import config from '@/config';
import {
  EpisodePublishEvent,
  EPISODE_PUBLISH_EVENT,
} from '@/download-job/events';
import { SeasonSaveEvent, SEASON_SAVE_EVENT } from '@/integrations/events';
import { LaniFilterCron } from '@/utils/GraphQLExceptionFilter';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class LaniaService {
  private readonly logger = new Logger(LaniaService.name);

  constructor(private local: LocalAxiosService) {}

  @OnEvent(SEASON_SAVE_EVENT)
  @LaniFilterCron()
  async onSeasonSave(event: SeasonSaveEvent) {
    return this.onSeasonSaveInternal(event);
  }

  private async onSeasonSaveInternal(event: SeasonSaveEvent) {
    if (!config.features.lania || !config.integrations.lania.enabled) {
      return;
    }
    const { agentEndpoint, authKey } = config.integrations.lania;
    const { id, title, description, posterImage, laniaSync } = event.season;
    if (!laniaSync) {
      return;
    }
    this.logger.verbose(
      `Creating lania series for season #${id} (${title})...`,
    );
    await this.local.post(
      `${agentEndpoint}/series/create`,
      {
        id,
        title,
        description,
        // TODO: 兼容没有publicHost的情况
        cover: posterImage?.cosPath
          ? `${config.s3.publicHost}${posterImage.cosPath}`
          : '',
      },
      {
        headers: {
          Authorization: `Bearer ${authKey}`,
        },
      },
    );
    this.logger.verbose(`Created lania series for season #${id} (${title}).`);
  }

  @OnEvent(EPISODE_PUBLISH_EVENT)
  @LaniFilterCron()
  async onEpisodePublish(event: EpisodePublishEvent) {
    return this.onEpisodePublishInternal(event);
  }

  private async onEpisodePublishInternal(event: EpisodePublishEvent) {
    if (!config.features.lania || !config.integrations.lania.enabled) {
      return;
    }
    const { agentEndpoint, authKey } = config.integrations.lania;
    const { id, seasonId, index, title, description, airTime, downloadJobs } =
      event.episode;
    if (!downloadJobs.length) {
      this.logger.warn(
        `Episode published ${id} but no download job, skipping lania queue`,
      );
      return;
    }
    this.logger.verbose(
      `Queueing lania upload for episode #${id} (${title})...`,
    );
    await this.local.post(
      `${agentEndpoint}/queue`,
      {
        id,
        season_id: seasonId,
        ep: index,
        title,
        description,
        file_path: downloadJobs[0].filePath,
        air_time: airTime,
      },
      {
        headers: {
          Authorization: `Bearer ${authKey}`,
        },
      },
    );
    this.logger.verbose(`Queued lania upload for episode #${id} (${title}).`);
  }
}
