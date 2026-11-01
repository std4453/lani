jest.mock('@/config', () => ({
  __esModule: true,
  default: { network: { timeout: 10000 } },
}));
import { LocalAxiosService, HttpRequestError } from '@/common/axios.service';
import axios from 'axios';
import { createServer, Server } from 'http';
import { AddressInfo, Socket } from 'net';
import { MatcherTransport } from './transport';

let server: Server;
let client: MatcherTransport;
let version: string | null;
let requests: string[];
let resultId: string | null;
let stage: 'primary' | 'fallback';
let modelVersion: string;
let mode: string;
let matchModelVersion: string | undefined;
let mutateResponse: ((response: any) => void) | undefined;
let bodies: any[];
let fail: boolean;
let responseOverride: string | undefined;
let hold: boolean;
let received: () => void;
let requestReceived: Promise<void>;
const sockets = new Set<Socket>();
const catalog = {
  version: 'abc',
  catalog: [
    {
      id: '1',
      title: '动画',
      aliases: ['Anime'],
      year: 2026,
      quarter: 4,
    },
  ],
};
const query = {
  rawTitle: '动画 03',
  aliases: ['动画'],
  publishedAt: '2026-10-21T00:00:00Z',
};

beforeEach(async () => {
  version = null;
  requests = [];
  resultId = '1';
  stage = 'primary';
  modelVersion = 'test-model';
  mode = 'lexical';
  matchModelVersion = undefined;
  mutateResponse = undefined;
  bodies = [];
  fail = false;
  hold = false;
  responseOverride = undefined;
  requestReceived = new Promise((resolve) => {
    received = resolve;
  });
  server = createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);
    received();
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      if (hold) return;
      if (responseOverride !== undefined) {
        res.end(responseOverride);
        return;
      }
      if (fail) {
        res.writeHead(503);
        res.end('{}');
        return;
      }
      const body = chunks.length
        ? JSON.parse(Buffer.concat(chunks).toString())
        : {};
      bodies.push(body);
      if (req.url === '/v2/catalog') version = body.catalogVersion;
      const status = {
        protocolVersion: 2,
        mode,
        modelVersion,
        catalogVersion: version,
      };
      res.setHeader('content-type', 'application/json');
      const response =
        req.url === '/v2/match'
          ? {
              ...status,
              requestId: body.requestId,
              decision: { stage },
              modelVersion: matchModelVersion ?? modelVersion,
              result: { seasonId: resultId },
            }
          : status;
      if (req.url === '/v2/match') mutateResponse?.(response);
      res.end(JSON.stringify(response));
    });
  });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  client = new MatcherTransport(
    {
      endpoint: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
      timeoutMs: 500,
    },
    new LocalAxiosService(),
  );
});
afterEach(async () => {
  await client.close();
  for (const socket of sockets) socket.destroy();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

it('uploads once, then restores a lost cache before the next match', async () => {
  await client.match(catalog, query, ['1'], 'first');
  await client.match(catalog, query, ['1'], 'second');
  expect(requests.filter((r) => r === 'PUT /v2/catalog')).toHaveLength(1);
  version = null;
  await client.match(catalog, query, ['1'], 'third');
  expect(requests.filter((r) => r === 'PUT /v2/catalog')).toHaveLength(2);
});
it('accepts refusal and rejects IDs outside the requested candidates', async () => {
  resultId = null;
  expect(
    (await client.match(catalog, query, [], 'empty')).result.seasonId,
  ).toBeNull();
  resultId = '2';
  await expect(client.match(catalog, query, ['1'], 'bad')).rejects.toThrow(
    'Invalid matcher result',
  );
});
it('does not retry service failures', async () => {
  fail = true;
  await expect(
    client.match(catalog, query, ['1'], 'fail'),
  ).rejects.toMatchObject({
    status: 503,
  });
  expect(requests).toEqual(['GET /v2/status']);
});

it('cancels a stalled request at the matching timeout and preserves the error code', async () => {
  hold = true;
  const result = client.load(catalog);
  await expect(result).rejects.toMatchObject({ code: 'ETIMEDOUT' });
  expect(requests).toEqual(['GET /v2/status']);
});

it('close cancels the active request and prevents queued requests from starting', async () => {
  hold = true;
  const active = client.load(catalog).catch((error) => error);
  const queued = client.load(catalog).catch((error) => error);
  await requestReceived;
  await client.close();
  expect(axios.isCancel(await active)).toBe(true);
  expect(await queued).toEqual(new Error('Matcher transport is closed'));
  expect(requests).toEqual(['GET /v2/status']);
});

it('rejects malformed JSON rather than treating it as a successful response', async () => {
  responseOverride = '{';
  await expect(client.load(catalog)).rejects.toThrow('Invalid matcher JSON');
});

it('rejects oversized responses and requests without retrying', async () => {
  responseOverride = 'x'.repeat(16 * 1024 * 1024 + 1);
  await expect(client.load(catalog)).rejects.toBeInstanceOf(HttpRequestError);
  expect(requests).toEqual(['GET /v2/status']);
  responseOverride = undefined;
  version = catalog.version;
  await expect(
    client.match(
      catalog,
      { ...query, aliases: ['x'.repeat(16 * 1024 * 1024)] },
      ['1'],
      'large',
    ),
  ).rejects.toThrow('Matcher request too large');
  expect(requests).toEqual(['GET /v2/status', 'GET /v2/status']);
});

it('sends only recent candidate IDs and accepts a result from the full catalog', async () => {
  const expanded = {
    ...catalog,
    catalog: [
      ...catalog.catalog,
      { ...catalog.catalog[0], id: '2', year: 2000 },
    ],
  };
  stage = 'primary';
  resultId = '2';
  expect(
    (await client.match(expanded, query, ['1'], 'catalog-match')).result
      .seasonId,
  ).toBe('2');
  const body = bodies.find((body) => body.requestId === 'catalog-match');
  expect(body).toEqual({
    protocolVersion: 2,
    catalogVersion: 'abc',
    candidateIds: ['1'],
    query,
    requestId: 'catalog-match',
  });
  expect(body).not.toHaveProperty('primaryCandidateIds');
  expect(body).not.toHaveProperty('fallbackCandidateIds');
});

it('accepts optional backend fields unchanged without checking identity or stage', async () => {
  matchModelVersion = 'another-model';
  mutateResponse = (response) => {
    response.decision = { stage: 'custom', detail: ['backend-owned'] };
    response.diagnostics = {
      attempts: Array(5).fill({ vendorUnits: 'unknown' }),
      anotherField: true,
    };
    response.result.explanation = { opaque: [1, null, 'value'] };
    response.result.score = { custom: 'uncalibrated' };
    response.extra = { nested: ['kept'] };
    modelVersion = 'changed-during-request';
  };
  const response = await client.match(catalog, query, ['1'], 'extensions');
  expect(response).toMatchObject({
    modelVersion: 'another-model',
    decision: { stage: 'custom', detail: ['backend-owned'] },
    diagnostics: {
      attempts: Array(5).fill({ vendorUnits: 'unknown' }),
      anotherField: true,
    },
    extra: { nested: ['kept'] },
    result: {
      explanation: { opaque: [1, null, 'value'] },
      score: { custom: 'uncalibrated' },
    },
  });
  expect(requests).toEqual([
    'GET /v2/status',
    'PUT /v2/catalog',
    'POST /v2/match',
  ]);
});

it('accepts core status and match responses without model identity or extensions', async () => {
  const request = jest
    .fn()
    .mockResolvedValueOnce({
      data: JSON.stringify({ protocolVersion: 2, catalogVersion: 'abc' }),
    })
    .mockResolvedValueOnce({
      data: JSON.stringify({
        protocolVersion: 2,
        catalogVersion: 'abc',
        requestId: 'core',
        result: { seasonId: '1' },
      }),
    });
  const core = new MatcherTransport(
    { endpoint: 'http://example.test', timeoutMs: 1000 },
    { request } as any,
  );
  expect(await core.match(catalog, query, ['1'], 'core')).toEqual({
    protocolVersion: 2,
    catalogVersion: 'abc',
    requestId: 'core',
    result: { seasonId: '1' },
  });
  expect(request).toHaveBeenCalledTimes(2);
  await core.close();
});

it.each(['requestId', 'catalogVersion'])(
  'rejects a mismatched %s even when the result ID is valid',
  async (field) => {
    mutateResponse = (response) => {
      response[field] = 'different';
    };
    await expect(
      client.match(catalog, query, ['1'], 'expected'),
    ).rejects.toThrow('Invalid matcher result');
  },
);

it('rejects the legacy protocol', async () => {
  responseOverride = JSON.stringify({
    protocolVersion: 1,
    catalogVersion: 'abc',
  });
  await expect(client.load(catalog)).rejects.toThrow(
    'Incompatible matcher protocol',
  );
});

it('uploads optional number summaries through the existing v2 catalog contract', async () => {
  const numbers = {
    episode: { local: '1-12', sort: '14-25' },
    sp: { sort: '13.5' },
  };
  const extended = {
    ...catalog,
    catalog: [{ ...catalog.catalog[0], numbers }],
  };
  await client.load(extended);
  expect(bodies.find((body) => body.catalog)).toEqual({
    protocolVersion: 2,
    catalogVersion: extended.version,
    catalog: extended.catalog,
  });
  expect(
    (await client.match(extended, query, ['1'], 'with-numbers')).result
      .seasonId,
  ).toBe('1');
});
