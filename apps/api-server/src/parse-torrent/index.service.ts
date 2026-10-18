import { PrismaService } from '@/common/prisma.service';
import {
  EpisodeType,
  Prisma,
  Torrent,
  TorrentPlatform,
  TorrentSourceType,
} from '@lani/db';
import parseTorrentTitle, {
  parseTorrentNames,
  parseSubtitleInfo,
} from '@lani/parse-torrent-title';
import { Injectable, Logger } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';

// 持久化结果的版本包含解析器输出与本适配层的映射规则。
const TORRENT_PARSE_VERSION = 2;

class InvalidEpisodeNumberError extends Error {}

// 拒绝数据库无法精确存储的编号，避免舍入后混淆剧集身份。
function decimalNumber(value: number): string {
  const text = String(value);
  if (!/^\d+(?:\.\d{1,3})?$/.test(text) || value >= 10000000) {
    throw new InvalidEpisodeNumberError(`Invalid episode number: ${text}`);
  }
  return text;
}

const keyToColumnName = {
  parseResult: 'parse_result',
  parseVersion: 'parse_version',
  parsedAt: 'parsed_at',
  episodeType: 'episode_type',
  episodeNumber: 'episode_number',
  episodeNumberFrom: 'episode_number_from',
  episodeNumberTo: 'episode_number_to',
  organizationRaw: 'organization_raw',
  organizationParts: 'organization_parts',
  seasonTitleRaw: 'season_title_raw',
  seasonTitleAliases: 'season_title_aliases',
  index: '"index"',
  indexFrom: 'index_from',
  indexTo: 'index_to',
  sourceType: 'source_type',
  sourcePlatform: 'source_platform',
  formatResolution: 'format_resolution',
  formatVideoEncoding: 'format_video_encoding',
  formatAudioEncoding: 'format_audio_encoding',
  formatColorDepth: 'format_color_depth',
  formatContainer: 'format_container',
  subtitleHasCHS: 'subtitle_has_chs',
  subtitleHasCHT: 'subtitle_has_cht',
  subtitleHasJP: 'subtitle_has_jp',
  subtitleType: 'subtitle_type',
} as const;
const keyToDataType = {
  parseResult: 'jsonb',
  parseVersion: 'int',
  parsedAt: 'timestamptz',
  episodeType: 'episode_type',
  episodeNumber: 'text::numeric',
  episodeNumberFrom: 'text::numeric',
  episodeNumberTo: 'text::numeric',
  organizationRaw: 'text',
  organizationParts: 'text[]',
  seasonTitleRaw: 'text',
  seasonTitleAliases: 'text[]',
  index: 'int',
  indexFrom: 'int',
  indexTo: 'int',
  sourceType: 'torrent_source_type',
  sourcePlatform: 'torrent_platform',
  formatResolution: 'text',
  formatVideoEncoding: 'text',
  formatAudioEncoding: 'text',
  formatColorDepth: 'text',
  formatContainer: 'text',
  subtitleHasCHS: 'boolean',
  subtitleHasCHT: 'boolean',
  subtitleHasJP: 'boolean',
  subtitleType: 'text',
};
const columnNameKeys = Object.keys(keyToColumnName);

type ParsedTorrentUpdate = Prisma.TorrentUpdateInput & {
  id: number;
};

@Injectable()
export class ParseTorrentService {
  private logger = new Logger(ParseTorrentService.name);

  constructor(private prisma: PrismaService) {}

  private titleToFields(title: string) {
    const result = parseTorrentTitle(title);
    const fallbackNames = result ? undefined : parseTorrentNames(title);
    const number = result?.episodeInfo.index;
    const parsedFields = {
      parseResult: JSON.parse(
        JSON.stringify(
          result ?? {
            ...(fallbackNames?.title.aliases.length
              ? { title: fallbackNames.title }
              : {}),
            ...(fallbackNames?.organization
              ? { organization: fallbackNames.organization }
              : {}),
            subtitleInfo: parseSubtitleInfo(title),
          },
        ),
      ),
      parseVersion: TORRENT_PARSE_VERSION,
      parsedAt: new Date(),
      episodeType:
        (result?.episodeInfo.type.toUpperCase() as EpisodeType) ?? null,
      episodeNumber: typeof number === 'number' ? decimalNumber(number) : null,
      episodeNumberFrom:
        typeof number === 'object' ? decimalNumber(number.from) : null,
      episodeNumberTo:
        typeof number === 'object' ? decimalNumber(number.to) : null,
    };
    if (!result) {
      return {
        ...parsedFields,
        index: null,
        indexFrom: null,
        indexTo: null,
        organizationRaw: fallbackNames?.organization?.raw ?? null,
        organizationParts: fallbackNames?.organization?.parts ?? [],
        seasonTitleRaw: fallbackNames?.title.aliases.length
          ? fallbackNames.title.raw
          : null,
        seasonTitleAliases: fallbackNames?.title.aliases ?? [],
        sourceType: null,
        sourcePlatform: null,
        formatResolution: null,
        formatVideoEncoding: null,
        formatAudioEncoding: null,
        formatColorDepth: null,
        formatContainer: null,
        subtitleHasCHS: false,
        subtitleHasCHT: false,
        subtitleHasJP: false,
        subtitleType: null,
      };
    }
    const indexFields =
      result.index === undefined
        ? { index: null, indexFrom: null, indexTo: null }
        : typeof result.index === 'number'
        ? Number.isInteger(result.index)
          ? {
              index: result.index,
              indexFrom: null,
              indexTo: null,
            }
          : { index: null, indexFrom: null, indexTo: null }
        : Number.isInteger(result.index.from) &&
          Number.isInteger(result.index.to)
        ? {
            index: null,
            indexFrom: result.index.from,
            indexTo: result.index.to,
          }
        : { index: null, indexFrom: null, indexTo: null };
    return {
      ...parsedFields,
      organizationRaw: result.organization?.raw ?? null,
      organizationParts: result.organization?.parts ?? [],
      seasonTitleRaw: result.title.raw,
      seasonTitleAliases: result.title.aliases,
      ...indexFields,
      sourceType:
        (result.source.type?.toUpperCase() as TorrentSourceType) ?? null,
      sourcePlatform:
        (result.source.platform
          ?.replace(/-/g, '_')
          .toUpperCase() as TorrentPlatform) ?? null,
      formatResolution: result.format.resolution ?? null,
      formatVideoEncoding: result.format.videoEncoding ?? null,
      formatAudioEncoding: result.format.audioEncoding ?? null,
      formatColorDepth: result.format.colorDepth ?? null,
      formatContainer: result.format.container ?? null,
      subtitleHasCHS: result.subtitle?.hasCHS ?? false,
      subtitleHasCHT: result.subtitle?.hasCHT ?? false,
      subtitleHasJP: result.subtitle?.hasJP ?? false,
      subtitleType: result.subtitle?.type ?? null,
    };
  }

  titleToUpdateInput(title: string): Prisma.TorrentUpdateInput | null {
    return this.titleToFields(title);
  }

  titleToCreateInput(
    title: string,
  ): Pick<Prisma.TorrentCreateInput, keyof typeof keyToColumnName> | null {
    return this.titleToFields(title);
  }

  private shouldUpdateTorrent(
    torrent: Torrent,
    data: Prisma.TorrentUpdateInput | null,
  ) {
    if (!data) {
      return false;
    }
    let different = false;
    for (const key in data) {
      if (key === 'parsedAt') continue;
      if (key === 'parseResult') {
        if (!isDeepStrictEqual(torrent[key], data[key])) return true;
        continue;
      }
      if (
        (data[key] === undefined && torrent[key] !== null) ||
        (data[key] !== undefined &&
          JSON.stringify(torrent[key]) !== JSON.stringify(data[key]))
      ) {
        different = true;
        break;
      }
    }
    return different;
  }

  private torrentsToUpdate(
    torrents: Torrent[],
    ignoreUnchanged = true,
  ): ParsedTorrentUpdate[] {
    return torrents
      .map((torrent) => {
        let data: Prisma.TorrentUpdateInput | null;
        try {
          data = this.titleToUpdateInput(torrent.title);
        } catch (error) {
          if (!(error instanceof InvalidEpisodeNumberError)) throw error;
          this.logger.warn(`Skipping torrent ${torrent.id}: ${error.message}`);
          return null;
        }
        if (
          !ignoreUnchanged ||
          (data && this.shouldUpdateTorrent(torrent, data))
        ) {
          return {
            id: torrent.id,
            ...data,
          };
        } else {
          return null;
        }
      })
      .filter((a): a is ParsedTorrentUpdate => a !== null);
  }

  private constructSqlTemplate(rows: number) {
    const setProperties = columnNameKeys
      .map((column) => keyToColumnName[column])
      .map((name) => `${name}=d.${name}`)
      .join(',');
    const row = `(@::int, ${columnNameKeys
      .map((column) => `@::${keyToDataType[column]}`)
      .join(',')})`;
    const valueRows = `(VALUES ${new Array(rows)
      .fill(0)
      .map(() => row)
      .join(',')})`;
    const asTable = `d(id, ${columnNameKeys
      .map((column) => keyToColumnName[column])
      .join(',')})`;
    const sql = `UPDATE torrents AS t 
        SET ${setProperties} 
        FROM ${valueRows} as ${asTable} 
        WHERE t.id=d.id::int`;

    const sqlParts: ReadonlyArray<string> & {
      raw?: readonly string[];
    } = sql.split('@');
    sqlParts.raw = sqlParts;

    return sqlParts as TemplateStringsArray;
  }

  private async batchUpdateTorrents(data: ParsedTorrentUpdate[]) {
    const sqlTemplate = this.constructSqlTemplate(data.length);
    const parameters = data.flatMap((d) => [
      d.id,
      ...columnNameKeys.map((column) =>
        column === 'parseResult'
          ? JSON.stringify(d[column])
          : d[column] ?? null,
      ),
    ]);
    await this.prisma.$executeRaw(sqlTemplate, ...parameters);
  }

  private async updateTorrentsMany(updates: ParsedTorrentUpdate[]) {
    const batch = 200;
    for (let i = 0; i < updates.length; i += batch) {
      this.logger.verbose(
        `Updating torrents ${i}-${Math.min(
          updates.length,
          i + batch,
        )} of total ${updates.length}`,
      );
      const data = updates.slice(i, i + batch);
      await this.batchUpdateTorrents(data);
    }
  }

  async parseTorrentTitleForAll() {
    const torrents = await this.prisma.torrent.findMany();
    const updates = this.torrentsToUpdate(torrents);
    await this.updateTorrentsMany(updates);
  }

  async parseTorrents(ids: number[]) {
    const torrents = await this.prisma.torrent.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    const updates = this.torrentsToUpdate(torrents);
    this.logger.log(`${updates.length} rows to update`);
    await this.updateTorrentsMany(updates);
  }
}
