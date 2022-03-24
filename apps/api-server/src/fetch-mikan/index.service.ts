import { GlobalAxiosService } from '@/common/axios.service';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import xml2js from 'xml2js';

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
                  contentLength: t.tuple([t.string]),
                  pubDate: t.tuple([t.string]),
                }),
              ]),
              enclosure: t.tuple([
                t.type({
                  $: t.type({
                    url: t.string,
                  }),
                }),
              ]),
            }),
          ),
          t.undefined,
        ]),
      }),
    ]),
  }),
});

@Injectable()
export class FetchMikanService {
  constructor(private axios: GlobalAxiosService) {
    dayjs.extend(utc);
  }

  private readonly parser = new xml2js.Parser();

  async fetchMikanRSSItems(partialURL: string) {
    const { data: xmlStr } = await this.axios.get<string>(
      `https://mikanani.me/RSS/${partialURL}`,
      {
        responseType: 'text',
      },
    );
    const parseResult = await this.parser.parseStringPromise(xmlStr);
    const decoded = tRSSItems.decode(parseResult);

    if (isLeft(decoded)) {
      throw new Error('XML result does not match schema');
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
            contentLength: [size],
            pubDate: [pubDateStr],
          },
        ],
        enclosure: [
          {
            $: { url: torrentLink },
          },
        ],
      }) => {
        const match = link.match(
          /^https:\/\/mikanani.me\/Home\/Episode\/([0-9a-zA-Z]+)$/,
        );
        if (!match) {
          throw new Error('Unrecognized item link');
        }
        return {
          hash: match[1],
          link,
          title,
          publishDate: dayjs(pubDateStr).utcOffset(8, true).toDate(),
          size: BigInt(size),
          torrentLink,
        };
      },
    );
  }
}
