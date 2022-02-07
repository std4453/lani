import { RequestFn } from "@/types";
import { buildServiceConfig } from "@/utils";
import * as t from "io-ts";

export const tFetchMikanRSSRequest = t.type({
  /**
   * 部分 RSS 地址，比如 https://mikanani.me/RSS/Classic 对应 'Classic'
   */
  partialURL: t.string,
});

export type FetchMikanRSSRequest = t.TypeOf<typeof tFetchMikanRSSRequest>;

export const tMikanRSSItem = t.type({
  /**
   * 条目唯一 hash，不超过48位，目前是连接地址的最后一段
   */
  hash: t.string,
  /**
   * mikan anime 剧集链接
   */
  link: t.string,
  /**
   * 种子标题
   */
  title: t.string,
  /**
   * 文件大小，可能超出32位，因此使用 string
   */
  size: t.string,
  /**
   * 发布时间，ISO-8601 格式字符串，包含时区
   */
  publishDate: t.string,
  /**
   * 种子文件地址
   */
  torrentLink: t.string,
});

export type MikanRSSItem = t.TypeOf<typeof tMikanRSSItem>;

export const tFetchMikanRSSResponse = t.type({
  /**
   * 条目数组。
   *
   * 当 RSS 返回符合格式但内容为空（比如尚未发布或者 id 错误）时，返回空数组，否则会返回报错。
   */
  items: t.array(tMikanRSSItem),
});

export type FetchMikanRSSResponse = t.TypeOf<typeof tFetchMikanRSSResponse>;

export type MikanFetchService = {
  routes: {
    "/fetchMikanRSS": RequestFn<FetchMikanRSSRequest, FetchMikanRSSResponse>;
  };
};

export const mikanFetchService = buildServiceConfig({
  svc: "mikan-fetch",
});
