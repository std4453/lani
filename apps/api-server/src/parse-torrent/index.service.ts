import { PrismaService } from '@/common/prisma.service';
import { Prisma, Torrent, TorrentPlatform, TorrentSourceType } from '@lani/db';
import parseTorrentTitle, {
  Platform,
  SourceType,
} from '@lani/parse-torrent-title';
import { Injectable } from '@nestjs/common';

const keyToColumnName = {
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
  constructor(private prisma: PrismaService) {}

  private titleToFields(title: string) {
    const result = parseTorrentTitle(title);
    if (!result) {
      return null;
    }
    return {
      organizationRaw: result.organization?.raw,
      organizationParts: result.organization?.parts,
      seasonTitleRaw: result.title.raw,
      seasonTitleAliases: result.title.aliases,
      index: typeof result.index === 'number' ? result.index : undefined,
      indexFrom:
        typeof result.index === 'number' ? undefined : result.index.from,
      indexTo: typeof result.index === 'number' ? undefined : result.index.to,
      sourceType: result.source.type
        ? (
            {
              [TorrentSourceType.BD]: 'BD',
              [TorrentSourceType.BDRIP]: 'BDRip',
              [TorrentSourceType.DONGHUA]: 'Donghua',
              [TorrentSourceType.WEBDL]: 'WebDL',
              [TorrentSourceType.WEBRIP]: 'WebRip',
            } as Record<TorrentSourceType, SourceType>
          )[result.source.type]
        : undefined,
      sourcePlatform: result.source.platform
        ? (
            {
              [TorrentPlatform.BAHA]: 'Baha',
              [TorrentPlatform.BILIBILI]: 'Bilibili',
              [TorrentPlatform.B_GLOBAL]: 'B-Global',
              [TorrentPlatform.B_THM]: 'B-THM',
              [TorrentPlatform.VIUTV]: 'ViuTV',
            } as Record<TorrentPlatform, Platform>
          )[result.source.platform]
        : undefined,
      formatResolution: result.format.resolution,
      formatVideoEncoding: result.format.videoEncoding,
      formatAudioEncoding: result.format.audioEncoding,
      formatColorDepth: result.format.colorDepth,
      formatContainer: result.format.container,
      subtitleHasCHS: result.subtitle?.hasCHS ?? false,
      subtitleHasCHT: result.subtitle?.hasCHT ?? false,
      subtitleHasJP: result.subtitle?.hasJP ?? false,
      subtitleType: result.subtitle?.type,
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
      if (
        (data[key] === undefined && torrent[key] !== null) ||
        (data[key] !== undefined &&
          JSON.stringify(torrent[key]) !== JSON.stringify(data[key]))
      ) {
        console.log(`key=${key}, ${torrent.title}`);
        different = true;
        break;
      }
    }
    return different;
  }

  private torrentsToUpdate(
    torrents: Torrent[],
    ignoreUnchanged: boolean = true,
  ): ParsedTorrentUpdate[] {
    return torrents
      .map((torrent) => {
        const data = this.titleToUpdateInput(torrent.title);
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
      ...columnNameKeys.map((column) => d[column]),
    ]);
    await this.prisma.$executeRaw(sqlTemplate, ...parameters);
  }

  private async updateTorrentsMany(updates: ParsedTorrentUpdate[]) {
    const batch = 200;
    for (let i = 0; i < updates.length; i += batch) {
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
    console.log(`${updates.length} rows to update`);
    await this.updateTorrentsMany(updates);
  }
}
