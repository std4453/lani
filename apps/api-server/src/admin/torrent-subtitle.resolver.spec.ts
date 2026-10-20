import { PrismaService } from '@/common/prisma.service';
import { ApolloFederationDriver } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import { GraphQLModule, Query, Resolver } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import axios, { AxiosInstance } from 'axios';
import { parse, ObjectTypeDefinitionNode } from 'graphql';
import { AddressInfo } from 'net';
import { Torrent, TorrentSubtitleResolver } from './torrent-subtitle.resolver';

jest.mock('@/common/prisma.service', () => ({ PrismaService: class {} }));

@Resolver()
class ProbeResolver {
  @Query(() => Boolean)
  probe() {
    return true;
  }
}

const query =
  'query($rows: [_Any!]!) { _entities(representations: $rows) { ... on Torrent { subtitleInfo alias: subtitleInfo } } }';
const entity = (id: number) => ({
  __typename: 'Torrent',
  nodeId: Buffer.from(JSON.stringify(['torrents', id])).toString('base64'),
});
const merged = {
  languages: ['en', 'zh-Hant'],
  multi: true,
  delivery: ['muxed'],
};
const row = (id: number) => ({
  id,
  parseVersion: 2,
  parseResult: {
    raw: '种子原始标题'.repeat(100),
    subtitleInfo: { languages: ['en'], multi: false, delivery: [] },
  },
  metadata: {
    status: 'known',
    subtitleInfo: {
      languages: ['zh-Hant'],
      multi: false,
      delivery: ['muxed'],
    },
  },
  subtitleHasCHS: false,
  subtitleHasCHT: false,
  subtitleHasJP: false,
  subtitleType: null,
});

describe('Torrent subtitle Federation HTTP resolver', () => {
  let app: INestApplication;
  let http: AxiosInstance;
  const findMany = jest.fn();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot({
          driver: ApolloFederationDriver,
          autoSchemaFile: true,
          buildSchemaOptions: { orphanedTypes: [Torrent] },
        }),
      ],
      providers: [
        TorrentSubtitleResolver,
        ProbeResolver,
        { provide: PrismaService, useValue: { torrent: { findMany } } },
      ],
    }).compile();
    app = module.createNestApplication(undefined, { logger: false });
    await app.listen(0, '127.0.0.1');
    const { port } = app.getHttpServer().address() as AddressInfo;
    http = axios.create({
      baseURL: `http://127.0.0.1:${port}`,
      proxy: false,
      validateStatus: () => true,
    });
  });

  beforeEach(() => {
    findMany.mockReset().mockResolvedValue([]);
  });

  afterAll(async () => {
    await app?.close();
  });

  async function execute(ids: number[]) {
    const response = await http.post('/graphql', {
      query,
      variables: { rows: ids.map(entity) },
    });
    expect(response.status).toBe(200);
    return response.data;
  }

  it('only requires the entity key and exposes the same nullable JSON field', async () => {
    const response = await http.post('/graphql', {
      query: '{ _service { sdl } }',
    });
    expect(response.data.errors).toBeUndefined();
    const sdl = response.data.data._service.sdl;
    const torrent = parse(sdl).definitions.find(
      (definition) =>
        definition.kind === 'ObjectTypeDefinition' &&
        definition.name.value === 'Torrent',
    ) as ObjectTypeDefinitionNode;
    expect(torrent.fields?.map((field) => field.name.value).sort()).toEqual([
      'nodeId',
      'subtitleInfo',
    ]);
    const subtitle = torrent.fields?.find(
      (field) => field.name.value === 'subtitleInfo',
    );
    expect(subtitle?.type).toMatchObject({
      kind: 'NamedType',
      name: { value: 'JSON' },
    });
    expect(subtitle?.directives).toEqual([]);
    expect(sdl).toContain('@key(fields: "nodeId")');
    expect(findMany).not.toHaveBeenCalled();
  });

  it('resolves 100 rows and aliases with one ID-only request and one database query', async () => {
    const ids = Array.from({ length: 100 }, (_, index) => index + 1);
    const records = ids.map(row);
    // 旧版把整页解析 JSON 放入 representations，会触发默认请求体限制。
    expect(Buffer.byteLength(JSON.stringify(records))).toBeGreaterThan(
      100 * 1024,
    );
    expect(
      Buffer.byteLength(
        JSON.stringify({ query, variables: { rows: ids.map(entity) } }),
      ),
    ).toBeLessThan(100 * 1024);
    findMany.mockResolvedValue([...records].reverse());
    const result = await execute([...ids, ids[0]]);
    expect(result.errors).toBeUndefined();
    expect(result.data._entities).toEqual(
      [...ids, ids[0]].map(() => ({ subtitleInfo: merged, alias: merged })),
    );
    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: ids } },
      select: {
        id: true,
        parseVersion: true,
        parseResult: true,
        metadata: true,
        subtitleHasCHS: true,
        subtitleHasCHT: true,
        subtitleHasJP: true,
        subtitleType: true,
      },
    });
  });

  it('maps out-of-order rows by ID, preserves legacy flags and returns null for deleted rows', async () => {
    const legacy = {
      ...row(2),
      parseVersion: null,
      parseResult: null,
      metadata: null,
      subtitleHasCHS: true,
      subtitleHasJP: true,
      subtitleType: '外挂',
    };
    findMany.mockResolvedValue([legacy, row(1)]);
    const result = await execute([1, 2, 3]);
    expect(result.errors).toBeUndefined();
    const legacyInfo = {
      languages: ['zh-Hans', 'ja'],
      multi: true,
      delivery: ['external'],
    };
    expect(result.data._entities).toEqual([
      { subtitleInfo: merged, alias: merged },
      { subtitleInfo: legacyInfo, alias: legacyInfo },
      { subtitleInfo: null, alias: null },
    ]);
    expect(findMany).toHaveBeenCalledTimes(1);
  });

  it('does not reuse cached subtitles in a later HTTP request', async () => {
    findMany.mockResolvedValueOnce([row(1)]).mockResolvedValueOnce([
      {
        ...row(1),
        parseResult: { subtitleInfo: null },
        metadata: { status: 'none', subtitleInfo: null },
      },
    ]);
    expect((await execute([1])).data._entities[0].subtitleInfo).toEqual(merged);
    expect((await execute([1])).data._entities[0].subtitleInfo).toBeNull();
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it('keeps concurrent requests in separate batches', async () => {
    findMany.mockImplementation(async ({ where }) => where.id.in.map(row));
    const results = await Promise.all([execute([1, 2]), execute([3, 4])]);
    expect(results.every((result) => !result.errors)).toBe(true);
    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany.mock.calls.map(([args]) => args.where.id.in)).toEqual(
      expect.arrayContaining([
        [1, 2],
        [3, 4],
      ]),
    );
  });

  it('reports database failures and lets the next request retry', async () => {
    findMany.mockRejectedValueOnce(new Error('Database unavailable'));
    const failed = await execute([1, 2]);
    expect(failed.errors.length).toBeGreaterThan(0);
    expect(failed.data._entities[0].subtitleInfo).toBeNull();
    expect(findMany).toHaveBeenCalledTimes(1);
    findMany.mockResolvedValue([row(1)]);
    const retried = await execute([1]);
    expect(retried.errors).toBeUndefined();
    expect(retried.data._entities[0].subtitleInfo).toEqual(merged);
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it('still rejects request bodies above the default 100 KiB limit', async () => {
    const response = await http.post('/graphql', {
      query: '{ probe }',
      padding: 'x'.repeat(100 * 1024),
    });
    expect(response.status).toBe(413);
    expect(findMany).not.toHaveBeenCalled();
  });
});
