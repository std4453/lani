import "isomorphic-unfetch";

import {
  CreateRssItemDocument,
  GetExistingRssItemsWithHashDocument,
} from "@/generated/types";
import { buildService } from "@lani/framework";
import { mikanFetchService, MikanFetchService } from "@lani/api";
import { createClient } from "@urql/core";
import config from "@/config";

const client = createClient({
  url: config.endpoint,
});

const mikanFetch = buildService<MikanFetchService>(mikanFetchService);

async function syncMikan() {
  try {
    const { items } = await mikanFetch.routes["/fetchMikanRSS"]({
      partialURL: "Classic",
    });
    console.log(items.length, "items found");
    const newHashes = items.map(({ hash }) => hash);
    const result = await client
      .query(GetExistingRssItemsWithHashDocument, {
        in: newHashes,
      })
      .toPromise();
    const edges = result?.data?.allRssItems?.edges;
    if (!edges) {
      console.error("Unable to fetch existing items");
      throw result.error;
    }
    const existingHashes = edges.map((edge) => {
      const hash = edge?.node?.hash;
      if (!hash) {
        throw new Error("Malformed response");
      }
      return hash;
    });
    const newItems = items.filter(({ hash }) => !existingHashes.includes(hash));
    console.log(newItems.length, "items new");
    for (const { link, ...item } of newItems) {
      console.log("Creating item:", item);
      const mutateResult = await client
        .mutation(CreateRssItemDocument, {
          rssItem: item,
        })
        .toPromise();
      if (mutateResult.error) {
        throw mutateResult.error;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

syncMikan();
