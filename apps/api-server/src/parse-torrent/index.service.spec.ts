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
      indexFrom: undefined,
      indexTo: undefined,
    });
    expect(
      service.titleToUpdateInput('[Group] Series 25 [1080p]'),
    ).toMatchObject({
      index: 25,
      indexFrom: undefined,
      indexTo: undefined,
    });
  });

  it('keeps integer range fields unchanged', () => {
    mockedParseTorrentTitle.mockReturnValue(parsedTitle({ from: 1, to: 12 }));

    expect(
      service.titleToCreateInput('[Group] Series 01-12 [1080p]'),
    ).toMatchObject({
      index: undefined,
      indexFrom: 1,
      indexTo: 12,
    });
    expect(
      service.titleToUpdateInput('[Group] Series 01-12 [1080p]'),
    ).toMatchObject({
      index: undefined,
      indexFrom: 1,
      indexTo: 12,
    });
  });
});
