import { buildServiceConfig } from "@/utils";

export type RSSService = {
  routes: {};
};

export const rssService = buildServiceConfig({
  svc: "rss",
});
