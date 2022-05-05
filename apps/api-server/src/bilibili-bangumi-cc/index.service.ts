import {
  BilibiliCCJSON,
  BilibiliDanmaku,
  BilibiliProxyRegion,
  BilibiliSeason,
  BilibiliSuccessResponse,
  BilibiliSuccessResponse2,
} from '@/bilibili-bangumi-cc/types';
import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
} from '@/common/axios.service';
import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Injectable()
export class BilibiliBangumiCCService {
  constructor(
    private global: GlobalAxiosService,
    private hk: HKAxiosService,
    private china: ChinaAxiosService,
  ) {}

  private regionToAxios: Record<BilibiliProxyRegion, Axios> = {
    global: this.global,
    thm: this.hk,
    mainland: this.china,
  };

  async fetchSeason(ssid: string, region = BilibiliProxyRegion.THM) {
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
    const obj = plainToClass(BilibiliSuccessResponse2, resp.data);
    await validateOrReject(obj);
    const data = plainToClass(BilibiliDanmaku, obj.data);
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
    const data = plainToClass(BilibiliCCJSON, resp.data);
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

  async downloadSRT(
    ssid: string,
    episode: number,
    language: string,
    region: BilibiliProxyRegion,
  ) {
    const season = await this.fetchSeason(ssid, region);
    const cid = this.findCID(season, episode);
    const danmaku = await this.fetchDanmaku(cid);
    const url = this.getSubtitleURL(danmaku, language);
    const ccJSON = await this.fetchCCJson(url);
    const srtText = this.generateSRTText(ccJSON);
    return srtText;
  }
}
