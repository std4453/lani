import {
  BilibiliCCJSON,
  BilibiliDanmaku,
  BilibiliProxyRegion as BilibiliRegion,
  BilibiliSeason,
  BilibiliSuccessResponse,
} from '@/bilibili-bangumi-cc/types';
import { CommonService } from '@/common/index.module';
import { ConfigType } from '@/config';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import COS from 'cos-nodejs-sdk-v5';
import { concatMap, firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class BilibiliBangumiCCService {
  constructor(
    private commonService: CommonService,
    private axios: HttpService,
    private config: ConfigService<ConfigType>,
  ) {}

  private regionToAgent: Partial<Record<BilibiliRegion, any>> = {
    // TODO: 全球番剧 API 代理
    thm: this.commonService.hk1Agent,
  };

  private cos = new COS({
    SecretId: this.config.get('cosSecretId'),
    SecretKey: this.config.get('cosSecretKey'),
  });

  async fetchSeason(ssid: string, region = BilibiliRegion.THM) {
    return firstValueFrom(
      this.axios
        .get(`https://api.bilibili.com/pgc/view/web/season?season_id=${ssid}`, {
          httpsAgent: this.regionToAgent[region],
        })
        .pipe(
          timeout(10000),
          concatMap(async (resp) => {
            const obj = plainToClass(BilibiliSuccessResponse, resp.data);
            await validateOrReject(obj);
            const data = plainToClass(BilibiliSeason, obj.result);
            await validateOrReject(data);
            return data;
          }),
        ),
    );
  }

  private findCID(data: BilibiliSeason, index: number) {
    const episode = data.episodes[index - 1];
    if (!episode) {
      throw new Error('Episode Not Found');
    }
    return episode.cid;
  }

  async fetchDanmaku(cid: number) {
    return await firstValueFrom(
      this.axios
        .get(`https://api.bilibili.com/x/v2/dm/view?oid=${cid}&type=1`)
        .pipe(
          timeout(10000),
          concatMap(async (resp) => {
            const obj = plainToClass(BilibiliSuccessResponse, resp.data);
            await validateOrReject(obj);
            const data = plainToClass(BilibiliDanmaku, obj.result);
            return data;
          }),
        ),
    );
  }

  private getSubtitleURL(danmaku: BilibiliDanmaku, language: string) {
    const subtitles = danmaku?.subtitle?.subtitles;
    if (!subtitles) {
      throw new Error('Subtitle Not Found');
    }
    const url = subtitles.find(({ lan }) => lan === language)?.subtitle_url;
    if (!url) {
      throw new Error(`Subtitle with Language ${language} Not Found`);
    }

    return url;
  }

  private async fetchCCJson(url: string) {
    // TODO: SSRF!
    return await firstValueFrom(
      this.axios.get(url).pipe(
        timeout(15000),
        concatMap(async (resp) => {
          const obj = plainToClass(BilibiliSuccessResponse, resp.data);
          await validateOrReject(obj);
          const data = plainToClass(BilibiliCCJSON, obj.result);
          return data;
        }),
      ),
    );
  }

  private pad(n: number, width) {
    return `${n}`.padStart(width, '0');
  }

  private srtftime(time: number) {
    const sec = Math.floor(time % 60);
    const min = Math.floor((time / 60) % 60);
    const hrs = Math.floor(time / 60 / 60);
    const ms = Math.floor((time - Math.floor(time)) * 1000);
    return `${this.pad(hrs, 2)}:${this.pad(min, 2)}:${this.pad(
      sec,
      2,
    )},${this.pad(ms, 3)}`;
  }

  private generateSRTText(ccJSON: BilibiliCCJSON) {
    return ccJSON.body
      .map(({ from, to, content }, index) => {
        return [
          `${index + 1}`,
          `${this.srtftime(from)} --> ${this.srtftime(to)}`,
          content,
          '',
          '',
        ].join('\n');
      })
      .join('');
  }

  private async uploadCOS(
    ssid: string,
    episode: number,
    language: string,
    srtText: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const key = `bilibili-bangumi-cc/ss${ssid}-ep-${episode}-${language}.srt`;
      this.cos.putObject(
        {
          Bucket: this.config.get('cosBucket'),
          Region: this.config.get('cosRegion'),
          Key: key,
          Body: srtText,
        },
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(key);
          }
        },
      );
    });
  }

  async downloadSRT(
    ssid: string,
    episode: number,
    language: string,
    region: BilibiliRegion,
  ) {
    const season = await this.fetchSeason(ssid, region);
    const cid = this.findCID(season, episode);
    const danmaku = await this.fetchDanmaku(cid);
    const url = this.getSubtitleURL(danmaku, language);
    const ccJSON = await this.fetchCCJson(url);
    const srtText = this.generateSRTText(ccJSON);
    const cosKey = await this.uploadCOS(ssid, episode, language, srtText);
    return cosKey;
  }
}
