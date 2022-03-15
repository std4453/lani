import { Injectable } from '@nestjs/common';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isLeft } from 'fp-ts/lib/Either';
import * as t from 'io-ts';
import { CommonService } from 'src/common/index.module';
import { MikanRSSItem } from 'src/fetch-mikan/index.model';
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
                  link: t.tuple([t.string]),
                  contentLength: t.tuple([t.string]),
                  pubDate: t.tuple([t.string]),
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

// https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
function pTimeout<T>(promise: Promise<T>, timeout: number) {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject);
    setTimeout(() => {
      reject('Timeout waiting for promise');
    }, timeout);
  });
}

@Injectable()
export class FetchMikanService {
  constructor(private commonService: CommonService) {
    dayjs.extend(utc);
  }

  private readonly parser = new xml2js.Parser();

  async fetchMikanRSSItems(partialURL: string): Promise<MikanRSSItem[]> {
    const url = `https://mikanani.me/RSS/${partialURL}`;
    const { data: xmlStr } = await pTimeout(
      axios.request<string>({
        url,
        method: 'GET',
        responseType: 'text',
        httpsAgent: this.commonService.hk1Agent,
      }),
      30000,
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
            link: [torrentLink],
            contentLength: [size],
            pubDate: [pubDateStr],
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
          size,
          torrentLink,
        };
      },
    );
  }
}
