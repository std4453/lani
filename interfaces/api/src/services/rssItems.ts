import { RequestFn } from "@/types";
import { buildServiceConfig } from "@/utils";
import * as t from "io-ts";

export const tRSSItem = t.type({
  /**
   * 条目唯一 hash，用于去重
   */
  hash: t.string,
  /**
   * 动画 ID，对应 anime metadatum 的 ID
   */
  animeId: t.number,
  /**
   * Sonarr 系列名称
   */
  sonarrName: t.union([t.string, t.undefined]),
  /**
   * Sonarr 动画季度
   */
  sonarrSeason: t.union([t.number, t.undefined]),
  /**
   * 集数（从 1 开始）
   */
  episode: t.number,
  /**
   * 种子语言
   */
  language: t.string,
  /**
   * 分辨率
   */
  quality: t.number,
  /**
   * 下载类型（如 WEBDL）
   */
  type: t.string,
  /**
   * 文件大小（BitInt 类型用 string 表示）
   */
  size: t.string,
  /**
   * 种子下载链接
   */
  torrentLink: t.string,
  /**
   * 种子发布时间
   */
  publishDate: t.string,
});

export type RSSItem = t.TypeOf<typeof tRSSItem>;

export const tGetDefaultRSSRequest = t.type({
  /**
   * 限制数量
   */
  limit: t.union([t.undefined, t.number]),
});

export type GetDefaultRSSRequest = t.TypeOf<typeof tGetDefaultRSSRequest>;

const tRSSItems = t.type({
  items: t.array(tRSSItem),
});

export const tGetDefaultRSSResponse = tRSSItems;

export type GetDefaultRSSResponse = t.TypeOf<typeof tGetDefaultRSSResponse>;

export const tGetForcedRSSRequest = t.type({});

export type GetForcedRSSRequest = t.TypeOf<typeof tGetForcedRSSRequest>;

export const tGetForcedRSSResponse = tRSSItems;

export type GetForcedRSSResponse = t.TypeOf<typeof tGetForcedRSSResponse>;

export type RSSItemsService = {
  routes: {
    "/getDefaultRSS": RequestFn<GetDefaultRSSRequest, GetDefaultRSSResponse>;
    "/getForcedRSS": RequestFn<GetForcedRSSRequest, GetForcedRSSResponse>;
  };
};

export const rssItemsService = buildServiceConfig({
  svc: "rss-items",
});
