import { PrismaService } from '@/common/prisma.service';
import { ParseTorrentService } from '@/parse-torrent/index.service';
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
