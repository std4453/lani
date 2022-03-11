import config from "@/config";
import {
  GetDataForDefaultItemsDocument,
  GetDataForForcedItemsDocument,
  GetDataForForcedItemsQuery,
} from "@/generated/types";
import { ExtractNode, extractNodeNonNullable } from "@/graphql";
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
import { App, buildRoute as r, buildService } from "@lani/framework";
import { createClient } from "@urql/core";
import "isomorphic-unfetch";

const client = createClient({
  url: config.endpoint,
  requestPolicy: "network-only",
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
    hash,
    size,
    title,
    torrentLink,
    publishDate,
  } of extractNodeNonNullable(result?.data?.allRssItems)) {
    for (const {
      anime,
      language,
      pattern,
      quality,
      type,
      animeMetadatumByAnime,
    } of extractNodeNonNullable(result?.data?.allDownloadConfigs)) {
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
        publishDate,
        sonarrName: animeMetadatumByAnime?.sonarrSeryBySonarrSeries?.sonarrName,
        sonarrSeason: animeMetadatumByAnime?.sonarrSeason
          ? animeMetadatumByAnime?.sonarrSeason
          : undefined,
      });
      break;
    }
  }
  return items;
}

const mikanFetch = buildService<MikanFetchService>(mikanFetchService);

async function getDownloadConfigItems(
  {
    id,
    mikanAnimeId,
    sonarrSeason,
    sonarrSeryBySonarrSeries,
  }: ExtractNode<GetDataForForcedItemsQuery["allAnimeMetadata"]>,
  {
    bangumiId,
    language,
    pattern,
    publishGroupId,
    quality,
    type,
  }: ExtractNode<
    ExtractNode<
      GetDataForForcedItemsQuery["allAnimeMetadata"]
    >["downloadConfigsByAnime"]
  >
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
    for (const { hash, size, title, torrentLink, publishDate } of items) {
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
        publishDate,
        sonarrName: sonarrSeryBySonarrSeries?.sonarrName,
        sonarrSeason: sonarrSeason ? sonarrSeason : undefined,
      });
    }
    return result;
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function getAnimeItems(
  node: ExtractNode<GetDataForForcedItemsQuery["allAnimeMetadata"]>
): Promise<RSSItem[]> {
  const { downloadConfigsByAnime } = node;
  return (
    await Promise.all(
      extractNodeNonNullable(downloadConfigsByAnime).map((config) =>
        getDownloadConfigItems(node, config)
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
    await Promise.all(
      extractNodeNonNullable(result?.data?.allAnimeMetadata).map(getAnimeItems)
    )
  ).reduce((a, b) => [...a, ...b], []);
}

const app = new App();
app
  .setupMiddlewares()
  .setupRoutes<RSSItemsService>({
    "/getDefaultRSS": r(
      tGetDefaultRSSRequest,
      tGetDefaultRSSResponse,
      async ({ limit = 500 }) => {
        return {
          items: await getDefaultRSS(limit),
        };
      }
    ),
    "/getForcedRSS": r(
      tGetForcedRSSRequest,
      tGetForcedRSSResponse,
      async () => {
        return {
          items: await getForcedRSS(),
        };
      }
    ),
  })
  .setupRouter()
  .start(rssItemsService);
