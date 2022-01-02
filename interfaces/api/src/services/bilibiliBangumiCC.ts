import { RequestFn } from "@/types";
import { buildServiceConfig } from "@/utils";
import * as t from "io-ts";

export const tDownloadSRTRequest = t.type({
  epid: t.string,
  language: t.string,
});

export type DownloadSRTRequest = t.TypeOf<typeof tDownloadSRTRequest>;

export const tDownloadSRTResponse = t.type({
  srtText: t.string,
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
