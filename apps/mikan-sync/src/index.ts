import "isomorphic-unfetch";

import client from "@/client";
import {
  CreateRssItemDocument,
  GetExistingRssItemsWithHashDocument,
  RssItemInput,
} from "@/generated/types";
import axios from "axios";
import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import xml2js from "xml2js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const parser = new xml2js.Parser();

const tRSSItems = t.type({
  rss: t.type({
    channel: t.array(
      t.type({
        item: t.array(
          t.type({
            title: t.array(t.string),
            link: t.array(t.string),
            torrent: t.array(
              t.type({
                link: t.array(t.string),
                contentLength: t.array(t.string),
                pubDate: t.array(t.string),
              })
            ),
          })
        ),
      })
    ),
  }),
});

async function fetchAllItems(): Promise<RssItemInput[]> {
  const { data: xmlStr } = await axios({
    url: "https://mikanani.me/RSS/Classic",
    method: "GET",
    responseType: "text",
  });
  const parseResult = await parser.parseStringPromise(xmlStr);
  const decoded = tRSSItems.decode(parseResult);

  if (isLeft(decoded)) {
    throw new Error("XML result does not match schema");
  }

  const channel = decoded.right.rss.channel[0];
  if (!channel) {
    throw new Error("Channel not present");
  }
  const items = channel.item;

  return items.map(({ link: links, title: titles, torrent: torrents }) => {
    if (links.length !== 1 || titles.length !== 1 || torrents.length !== 1) {
      throw new Error("Malformed item");
    }
    const link = links[0];
    const {
      link: torrentLinks,
      contentLength: sizes,
      pubDate: pubDates,
    } = torrents[0];
    if (
      torrentLinks.length !== 1 ||
      sizes.length !== 1 ||
      pubDates.length !== 1
    ) {
      throw new Error("Malformed item");
    }
    const match = link.match(
      /^https:\/\/mikanani.me\/Home\/Episode\/([0-9a-zA-Z]+)$/
    );
    if (!match) {
      throw new Error("Malformed item");
    }
    return {
      hash: match[1],
      title: titles[0],
      publishDate: dayjs(pubDates[0]).utcOffset(8, true).format(),
      size: sizes[0],
      torrentLink: torrentLinks[0],
    };
  });
}

async function syncMikan() {
  try {
    const items = await fetchAllItems();
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
    for (const item of newItems) {
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
