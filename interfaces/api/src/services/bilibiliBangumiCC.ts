import { RequestFn } from "@/types";
import { buildServiceConfig } from "@/utils";
import * as t from "io-ts";

export const tDownloadSRTRequest = t.type({
  /**
   * 不应包括前缀 ss
   */
  ssid: t.string,
  /**
   * 从 1 开始的剧集编号
   */
  index: t.number,
  /**
   * 默认为 zh-Hant
   */
  language: t.union([t.undefined, t.string]),
  /**
   * 针对地区使用不同的 proxy, 默认 thm
   */
  region: t.union([
    t.undefined,
    // 港澳台, Taiwan, Hong Kong and Macau
    t.literal("thm"),
    t.literal("mainland"),
    t.literal("global"),
  ]),
});

export type DownloadSRTRequest = t.TypeOf<typeof tDownloadSRTRequest>;

export const tDownloadSRTResponse = t.type({
  cosKey: t.string,
});

export type DownloadSRTResponse = t.TypeOf<typeof tDownloadSRTResponse>;

export type BilibiliBangumiCCService = {
  routes: {
    "/downloadSRT": RequestFn<DownloadSRTRequest, DownloadSRTResponse>;
  };
};

export const bilibiliBangumiCCService = buildServiceConfig({
  svc: "bilibili-bangumi-cc",
});
