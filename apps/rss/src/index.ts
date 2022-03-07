import config from "@/config";
import {
  RSSItem,
  rssItemsService,
  RSSItemsService,
  rssService,
  RSSService,
} from "@lani/api";
import { buildApp, buildService, startApp } from "@lani/framework";
import Router from "koa-router";
import xml2js from "xml2js";

const rssItems = buildService<RSSItemsService>(rssItemsService);

const builder = new xml2js.Builder();

function outputRSS(ctx: Parameters<Router.IMiddleware>[0], items: RSSItem[]) {
  ctx.body = builder.buildObject({
    rss: {
      $: {
        version: "2.0",
      },
      channel: [
        {
          item: items
            .filter(
              ({ sonarrName, sonarrSeason }) => sonarrName && sonarrSeason
            )
            .map(
              ({
                episode,
                quality,
                type,
                language,
                publishDate,
                size,
                torrentLink,
                hash,
                sonarrName,
                sonarrSeason,
              }) => ({
                title: [
                  `${sonarrName} - S${sonarrSeason}E${episode} - ${language} - ${type} ${quality}p`,
                ],
                pubDate: [publishDate],
                enclosure: [
                  {
                    $: {
                      type: "application/x-bittorrent",
                      length: size,
                      url: torrentLink,
                    },
                  },
                ],
                link: [`${config.adminHost}/rss-item/${hash}`],
                guid: [
                  {
                    _: `${config.adminHost}/rss-item/${hash}`,
                    $: {
                      isPermaLink: true,
                    },
                  },
                ],
              })
            ),
        },
      ],
    },
  });
  ctx.type = "text/xml";
}

const handleDefault: Router.IMiddleware = async (ctx) => {
  const data = await rssItems.routes["/getDefaultRSS"]({ limit: undefined });
  outputRSS(ctx, data.items);
};

const handleForced: Router.IMiddleware = async (ctx) => {
  const data = await rssItems.routes["/getForcedRSS"]({ limit: undefined });
  outputRSS(ctx, data.items);
};

const app = buildApp<RSSService>({
  "/default": handleDefault,
  "/forced": handleForced,
});

startApp(app, rssService);
