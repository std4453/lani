import "isomorphic-unfetch";

import {
  buildApp,
  buildRoute as r,
  buildService,
  startApp,
} from "@lani/framework";
import {
  mikanFetchService,
  MikanFetchService,
  RSSItem,
  rssItemsService,
  RSSItemsService,
  tGetDefaultRSSRequest,
  tGetDefaultRSSResponse,
  tGetForcedRSSRequest,
  tGetForcedRSSResponse,
} from "@lani/api";
import { createClient } from "@urql/core";
import config from "@/config";
import {
  GetDataForDefaultItemsDocument,
  GetDataForForcedItemsDocument,
  GetDataForForcedItemsQuery,
} from "@/generated/types";

const client = createClient({
  url: config.endpoint,
});

async function getDefaultRSS(limit: number): Promise<RSSItem[]> {
  const result = await client
    .query(GetDataForDefaultItemsDocument, { first: limit })
    .toPromise();
  if (result.error) {
    throw result.error;
  }
  const items: RSSItem[] = [];
  for (const {
    node: { hash, size, title, torrentLink },
  } of result.data.allRssItems.edges) {
    for (const {
      node: { anime, language, pattern, quality, type },
    } of result.data.allDownloadConfigs.edges) {
      const regexp = new RegExp(`^${pattern}$`);
      const match = title.match(regexp);
      if (!match?.groups?.episode) continue;
      const { episode } = match.groups;
      items.push({
        hash,
        size,
        torrentLink,
        type,
        quality,
        language,
        animeId: anime,
        episode: parseInt(episode),
      });
      break;
    }
  }
  return items;
}

const mikanFetch = buildService<MikanFetchService>(mikanFetchService);

async function getDownloadConfigItems(
  id: number,
  mikanAnimeId: string,
  {
    node: { bangumiId, language, pattern, publishGroupId, quality, type },
  }: GetDataForForcedItemsQuery["allAnimeMetadata"]["edges"][0]["node"]["downloadConfigsByAnime"]["edges"][0]
) {
  try {
    const finalBangumiId = bangumiId || mikanAnimeId;
    if (!finalBangumiId || !publishGroupId) {
      return [];
    }
    const { items } = await mikanFetch.routes["/fetchMikanRSS"]({
      partialURL: `Bangumi?bangumiId=${finalBangumiId}&subgroupid=${publishGroupId}`,
    });
    const regexp = new RegExp(`^${pattern}$`);
    const result: RSSItem[] = [];
    for (const { hash, size, title, torrentLink } of items) {
      const match = title.match(regexp);
      if (!match?.groups?.episode) continue;
      const { episode } = match.groups;
      result.push({
        animeId: id,
        hash,
        language,
        quality,
        type,
        size,
        torrentLink,
        episode: parseInt(episode),
      });
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getAnimeItems({
  node: {
    id,
    mikanAnimeId,
    downloadConfigsByAnime: { edges: downloadConfigs },
  },
}: GetDataForForcedItemsQuery["allAnimeMetadata"]["edges"][0]): Promise<
  RSSItem[]
> {
  return (
    await Promise.all(
      downloadConfigs.map((config) =>
        getDownloadConfigItems(id, mikanAnimeId, config)
      )
    )
  ).reduce((a, b) => [...a, ...b], []);
}

async function getForcedRSS(): Promise<RSSItem[]> {
  const result = await client.query(GetDataForForcedItemsDocument).toPromise();
  if (result.error) {
    throw result.error;
  }
  return (
    await Promise.all(result.data.allAnimeMetadata.edges.map(getAnimeItems))
  ).reduce((a, b) => [...a, ...b], []);
}

const app = buildApp<RSSItemsService>({
  "/getDefaultRSS": r(
    tGetDefaultRSSRequest,
    tGetDefaultRSSResponse,
    async ({ limit = 500 }) => {
      return {
        items: await getDefaultRSS(limit),
      };
    }
  ),
  "/getForcedRSS": r(tGetForcedRSSRequest, tGetForcedRSSResponse, async () => {
    return {
      items: await getForcedRSS(),
    };
  }),
});

startApp(app, rssItemsService);
