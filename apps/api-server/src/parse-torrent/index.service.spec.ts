import { PrismaService } from '@/common/prisma.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';
import { Logger } from '@nestjs/common';
import parseTorrentTitle, {
  EpisodeInfo,
  Index,
  ParseTorrentTitleResult,
} from '@lani/parse-torrent-title';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));
jest.mock(
  '@lani/db',
  () => ({
    TorrentPlatform: {},
    TorrentSourceType: {},
  }),
  { virtual: true },
);
jest.mock('@lani/parse-torrent-title', () => ({
  __esModule: true,
  default: jest.fn(),
  parseSubtitleInfo: jest.fn(),
}));

const mockedParseTorrentTitle = parseTorrentTitle as jest.MockedFunction<
  typeof parseTorrentTitle
>;

function parsedTitle(
  index: Index | undefined,
  episodeInfo: EpisodeInfo = index === undefined
    ? { type: 'sp' }
    : {
        type: 'episode',
        index,
      },
): ParseTorrentTitleResult {
  return {
    organization: {
      raw: 'Group',
      parts: ['Group'],
    },
    title: {
      raw: 'Series',
      aliases: ['Series', 'シリーズ'],
    },
    ...(index === undefined ? {} : { index }),
    episodeInfo,
    source: {},
    format: {
      resolution: '1080',
      videoEncoding: 'HEVC',
    },
    subtitle: {
      hasCHS: true,
      type: '外挂',
    },
    raw: '[Group] Series',
    positionalItems: [],
  };
}

describe('ParseTorrentService title index fields', () => {
  const service = new ParseTorrentService({} as PrismaService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each<[string, Index]>([
    ['fractional single episode', 25.5],
    ['fractional range end', { from: 1, to: 2.5 }],
    ['fractional range start', { from: 1.5, to: 2 }],
  ])('nulls all integer index columns for %s', (_description, index) => {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle(index));

    const title = '[Group] Series 25.5 [1080p]';
    const createInput = service.titleToCreateInput(title);
    const updateInput = service.titleToUpdateInput(title);

    for (const input of [createInput, updateInput]) {
      expect(input).toMatchObject({
        index: null,
        indexFrom: null,
        indexTo: null,
        organizationRaw: 'Group',
        organizationParts: ['Group'],
        seasonTitleRaw: 'Series',
        seasonTitleAliases: ['Series', 'シリーズ'],
        formatResolution: '1080',
        formatVideoEncoding: 'HEVC',
        subtitleHasCHS: true,
        subtitleType: '外挂',
      });
    }
    expect(mockedParseTorrentTitle).toHaveBeenCalledWith(title);
  });

  test.each<[string, EpisodeInfo]>([
    ['numbered special episode', { type: 'sp', index: 1 }],
    ['unnumbered special episode', { type: 'sp' }],
    ['unnumbered OVA', { type: 'ova' }],
  ])('clears integer index columns for an %s', (_description, episodeInfo) => {
    mockedParseTorrentTitle.mockReturnValue(
      parsedTitle(undefined, episodeInfo),
    );

    const title = '[Group] Series SP [1080p]';
    const createInput = service.titleToCreateInput(title);
    const updateInput = service.titleToUpdateInput(title);

    for (const input of [createInput, updateInput]) {
      expect(input).toMatchObject({
        index: null,
        indexFrom: null,
        indexTo: null,
        organizationRaw: 'Group',
        seasonTitleRaw: 'Series',
        formatResolution: '1080',
        subtitleHasCHS: true,
      });
    }
  });

  it('keeps integer single episode fields unchanged', () => {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle(25));

    expect(
      service.titleToCreateInput('[Group] Series 25 [1080p]'),
    ).toMatchObject({
      index: 25,
      indexFrom: null,
      indexTo: null,
    });
    expect(
      service.titleToUpdateInput('[Group] Series 25 [1080p]'),
    ).toMatchObject({
      index: 25,
      indexFrom: null,
      indexTo: null,
    });
  });

  it('keeps integer range fields unchanged', () => {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle({ from: 1, to: 12 }));

    expect(
      service.titleToCreateInput('[Group] Series 01-12 [1080p]'),
    ).toMatchObject({
      index: null,
      indexFrom: 1,
      indexTo: 12,
    });
    expect(
      service.titleToUpdateInput('[Group] Series 01-12 [1080p]'),
    ).toMatchObject({
      index: null,
      indexFrom: 1,
      indexTo: 12,
    });
  });
});

describe('new recognition persistence', () => {
  const service = new ParseTorrentService({} as PrismaService);
  it('stores decimal identities and the complete subtitle payload', () => {
    const result = parsedTitle(12.5);
    result.subtitleInfo = {
      languages: ['zh-Hans', 'en'],
      multi: true,
      delivery: ['muxed', 'external'],
    };
    mockedParseTorrentTitle.mockReturnValue(result);
    expect(service.titleToCreateInput(result.raw)).toMatchObject({
      parseVersion: 1,
      episodeType: 'EPISODE',
      episodeNumber: '12.5',
      parseResult: {
        episodeInfo: { type: 'episode', index: 12.5 },
        subtitleInfo: result.subtitleInfo,
      },
    });
  });
  it('keeps unnumbered specials separate from episode zero', () => {
    mockedParseTorrentTitle.mockReturnValue(
      parsedTitle(undefined, { type: 'sp' }),
    );
    expect(service.titleToUpdateInput('SP')).toMatchObject({
      episodeType: 'SP',
      episodeNumber: null,
    });
    mockedParseTorrentTitle.mockReturnValue(parsedTitle(0));
    expect(service.titleToUpdateInput('00')).toMatchObject({
      episodeType: 'EPISODE',
      episodeNumber: '0',
    });
  });
  it('marks failed recognition and clears old matching identities', () => {
    mockedParseTorrentTitle.mockReturnValue(undefined);
    expect(service.titleToUpdateInput('no episode')).toMatchObject({
      parseVersion: 1,
      parseResult: {},
      episodeType: null,
      episodeNumber: null,
      episodeNumberFrom: null,
      episodeNumberTo: null,
      index: null,
      indexFrom: null,
      indexTo: null,
    });
  });
  it('does not round excessive precision into another identity', () => {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle(12.1234));
    expect(() => service.titleToCreateInput('12.1234')).toThrow(
      'Invalid episode number',
    );
  });
});

describe('重解析时跳过未变化的记录', () => {
  function setup() {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle(12.5));
    const prisma = {
      torrent: { findMany: jest.fn() },
      $executeRaw: jest.fn().mockResolvedValue(1),
    };
    const service = new ParseTorrentService(prisma as unknown as PrismaService);
    const fields = service.titleToCreateInput('title');
    if (!fields) throw new Error('Expected parsed fields');
    const reverseKeys = (value: any): any =>
      Array.isArray(value)
        ? value.map(reverseKeys)
        : value && typeof value === 'object'
        ? Object.fromEntries(
            Object.entries(value)
              .reverse()
              .map(([key, child]) => [key, reverseKeys(child)]),
          )
        : value;
    const stored = {
      ...fields,
      id: 1,
      title: 'title',
      parsedAt: new Date(0),
      parseResult: reverseKeys(fields.parseResult),
      episodeNumber: { toJSON: () => '12.5' },
    };
    prisma.torrent.findMany.mockResolvedValue([stored]);
    return { prisma, service, stored };
  }
  it('忽略解析时间和 JSON 对象键顺序，兼容数据库小数表示', async () => {
    const { prisma, service } = setup();
    await service.parseTorrents([1]);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
  it.each(['version', 'payload', 'column', 'array'])(
    '仍写入实际变化：%s',
    async (change) => {
      const { prisma, service, stored } = setup();
      if (change === 'version') stored.parseVersion = 0;
      if (change === 'payload')
        stored.parseResult.subtitleInfo = { languages: ['en'], multi: false };
      if (change === 'column') stored.formatResolution = '720';
      if (change === 'array') stored.parseResult.title.aliases.reverse();
      await service.parseTorrents([1]);
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    },
  );
});

describe('批量重解析的异常隔离', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['parseTorrents', 'parseTorrentTitleForAll'] as const)(
    '%s 跳过无效编号并保存其他种子，直接创建仍拒绝无效编号',
    async (method) => {
      const prisma = {
        torrent: {
          findMany: jest.fn().mockResolvedValue([
            { id: 1, title: 'invalid' },
            { id: 2, title: 'valid' },
          ]),
        },
        $executeRaw: jest.fn().mockResolvedValue(1),
      };
      const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
      mockedParseTorrentTitle.mockImplementation((title) =>
        parsedTitle(title === 'invalid' ? 10000000 : 12.5),
      );
      const service = new ParseTorrentService(
        prisma as unknown as PrismaService,
      );
      await service[method]([1, 2]);
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
      const [, id, payload] = prisma.$executeRaw.mock.calls[0];
      expect(id).toBe(2);
      expect(JSON.parse(payload).episodeInfo.index).toBe(12.5);
      expect(warn).toHaveBeenCalledWith(
        'Skipping torrent 1: Invalid episode number: 10000000',
      );
      expect(() => service.titleToCreateInput('invalid')).toThrow(
        'Invalid episode number',
      );
    },
  );

  it('不吞掉其他解析错误', async () => {
    const prisma = {
      torrent: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, title: 'broken' }]),
      },
      $executeRaw: jest.fn(),
    };
    const error = new Error('Unexpected parser failure');
    mockedParseTorrentTitle.mockImplementation(() => {
      throw error;
    });
    const service = new ParseTorrentService(prisma as unknown as PrismaService);
    await expect(service.parseTorrents([1])).rejects.toBe(error);
    expect(prisma.$executeRaw).not.toHaveBeenCalled();
  });
});
