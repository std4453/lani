import {
  BilibiliCCJSON,
  BilibiliDanmaku,
  BilibiliProxyRegion as BilibiliRegion,
  BilibiliSeason,
  BilibiliSuccessResponse,
} from '@/bilibili-bangumi-cc/types';
import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
} from '@/common/axios.service';
import { COSService } from '@/common/cos.service';
import { ConfigType, COSBucket } from '@/config';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Axios } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class BilibiliBangumiCCService {
  constructor(
    private global: GlobalAxiosService,
    private hk: HKAxiosService,
    private china: ChinaAxiosService,
    private config: ConfigService<ConfigType, true>,
    private cos: COSService,
  ) {}

  private regionToAxios: Record<BilibiliRegion, Axios> = {
    global: this.global,
    thm: this.hk,
    mainland: this.china,
  };

  async fetchSeason(ssid: string, region = BilibiliRegion.THM) {
    const resp = await this.regionToAxios[region].get(
      `https://api.bilibili.com/pgc/view/web/season?season_id=${ssid}`,
    );
    const obj = plainToClass(BilibiliSuccessResponse, resp.data);
    await validateOrReject(obj);
    const data = plainToClass(BilibiliSeason, obj.result);
    await validateOrReject(data);
    return data;
  }

  private findCID(data: BilibiliSeason, index: number) {
    const episode = data.episodes[index - 1];
    if (!episode) {
      throw new Error('Episode Not Found');
    }
    return episode.cid;
  }

  async fetchDanmaku(cid: number) {
    const resp = await this.china.get(
      `https://api.bilibili.com/x/v2/dm/view?oid=${cid}&type=1`,
    );
    const obj = plainToClass(BilibiliSuccessResponse, resp.data);
    await validateOrReject(obj);
    const data = plainToClass(BilibiliDanmaku, obj.result);
    return data;
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
    const resp = await this.china.get(url);
    const obj = plainToClass(BilibiliSuccessResponse, resp.data);
    await validateOrReject(obj);
    const data = plainToClass(BilibiliCCJSON, obj.result);
    return data;
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

  private uploadCOS(
    ssid: string,
    episode: number,
    language: string,
    srtText: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const key = `bilibili-bangumi-cc/ss${ssid}-ep-${episode}-${language}.srt`;
      const bucket = this.config.get<COSBucket>('tempBucket');
      this.cos.putObject(
        {
          Bucket: bucket.bucket,
          Region: bucket.region,
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
