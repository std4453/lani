import { GlobalAxiosService } from '@/common/axios.service';
import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsOptional, ValidateNested, validateOrReject } from 'class-validator';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import xml2js from 'xml2js';

class EnclosureProps {
  url: string;
}

class Enclosure {
  @ValidateNested()
  $: EnclosureProps;
}

class Item {
  title: string[];
  link: string[];
  @ValidateNested()
  torrent: Torrent[];
  @ValidateNested()
  enclosure: Enclosure[];
}
class Channel {
  @IsOptional()
  @ValidateNested()
  item?: Item[];
}

class Torrent {
  contentLength: string[];
  pubDate: string[];
}

class RSS {
  @ValidateNested()
  channel: Channel[];
}

class RSSItems {
  @ValidateNested()
  rss: RSS;
}

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
    const obj = plainToClass(RSSItems, parseResult);
    await validateOrReject(obj);

    const {
      rss: {
        channel: [{ item: items }],
      },
    } = obj;

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
