import {
  bilibiliBangumiCCService,
  MikanFetchService,
  MikanRSSItem,
  tFetchMikanRSSRequest,
  tFetchMikanRSSResponse,
} from "@lani/api";
import {
  buildApp,
  buildRoute as r,
  NormalError,
  startApp,
} from "@lani/framework";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { isLeft } from "fp-ts/lib/Either";
import * as t from "io-ts";
import xml2js from "xml2js";
import createHttpsProxyAgent from "https-proxy-agent";
import config from "@/config";

dayjs.extend(utc);

const parser = new xml2js.Parser();

const tRSSItems = t.type({
  rss: t.type({
    channel: t.tuple([
      t.type({
        item: t.union([
          t.array(
            t.type({
              title: t.tuple([t.string]),
              link: t.tuple([t.string]),
              torrent: t.tuple([
                t.type({
                  link: t.tuple([t.string]),
                  contentLength: t.tuple([t.string]),
                  pubDate: t.tuple([t.string]),
                }),
              ]),
            })
          ),
          t.undefined,
        ]),
      }),
    ]),
  }),
});

const agent = createHttpsProxyAgent(config.proxy);

async function fetchMikanRSSItems(url: string): Promise<MikanRSSItem[]> {
  const { data: xmlStr } = await axios({
    url,
    method: "GET",
    responseType: "text",
    httpAgent: agent,
    timeout: 30 * 1000,
  });
  const parseResult = await parser.parseStringPromise(xmlStr);
  const decoded = tRSSItems.decode(parseResult);

  if (isLeft(decoded)) {
    throw new NormalError(500, "XML result does not match schema");
  }

  const {
    rss: {
      channel: [{ item: items }],
    },
  } = decoded.right;

  return (items ?? []).map(
    ({
      link: [link],
      title: [title],
      torrent: [
        {
          link: [torrentLink],
          contentLength: [size],
          pubDate: [pubDateStr],
        },
      ],
    }) => {
      const match = link.match(
        /^https:\/\/mikanani.me\/Home\/Episode\/([0-9a-zA-Z]+)$/
      );
      if (!match) {
        throw new NormalError(500, "Unrecognized item link");
      }
      return {
        hash: match[1],
        link,
        title,
        publishDate: dayjs(pubDateStr).utcOffset(8, true).format(),
        size,
        torrentLink,
      };
    }
  );
}

const app = buildApp<MikanFetchService>({
  "/fetchMikanRSS": r(
    tFetchMikanRSSRequest,
    tFetchMikanRSSResponse,
    async (req) => {
      const url = `https://mikanani.me/RSS/${req.partialURL}`;
      const items = await fetchMikanRSSItems(url);
      return {
        items,
      };
    }
  ),
});

startApp(app, bilibiliBangumiCCService);
