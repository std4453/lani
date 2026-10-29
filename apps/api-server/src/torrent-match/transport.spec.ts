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

it('sends full fallback candidates and accepts a fallback-only result', async () => {
  const expanded = {
    ...catalog,
    catalog: [
      ...catalog.catalog,
      { ...catalog.catalog[0], id: '2', year: 2000 },
    ],
  };
  stage = 'fallback';
  resultId = '2';
  expect(
    (await client.match(expanded, query, ['1'], 'fallback')).result.seasonId,
  ).toBe('2');
  expect(bodies.find((body) => body.requestId === 'fallback')).toMatchObject({
    protocolVersion: 2,
    primaryCandidateIds: ['1'],
    fallbackCandidateIds: ['1', '2'],
  });
  stage = 'primary';
  await expect(
    client.match(expanded, query, ['1'], 'invalid-stage'),
  ).rejects.toThrow('Invalid matcher result');
});

it('rejects an invalid stage and a response from a different model', async () => {
  mutateResponse = (response) => {
    response.decision.stage = 'other';
  };
  await expect(client.match(catalog, query, ['1'], 'bad')).rejects.toThrow(
    'Invalid matcher result',
  );
  mutateResponse = undefined;
  matchModelVersion = 'stale-model';
  await expect(client.match(catalog, query, ['1'], 'stale')).rejects.toThrow(
    'Invalid matcher result',
  );
});

it('checks the worker identity after inference and before the caller commits', async () => {
  mutateResponse = () => {
    modelVersion = 'new-config';
  };
  await expect(client.match(catalog, query, ['1'], 'changed')).rejects.toThrow(
    'Matcher identity changed',
  );
  mutateResponse = undefined;
  const response = await client.match(catalog, query, ['1'], 'current');
  expect(client.isCurrent(response)).toBe(true);
  modelVersion = 'another-config';
  await client.load(catalog);
  expect(client.isCurrent(response)).toBe(false);
});

it('retains bounded usage diagnostics without arbitrary text', async () => {
  mutateResponse = (response) => {
    response.diagnostics = {
      elapsedMs: 50,
      attempts: [
        {
          stage: 'primary',
          attempt: 1,
          model: 'mock',
          elapsedMs: 50,
          promptTokens: 20,
          completionTokens: 3,
          reasoning: 'private reasoning',
        },
      ],
      promptHashes: { primary: 'abc' },
      prompt: 'private prompt',
    };
  };
  const response = await client.match(catalog, query, ['1'], 'usage');
  expect(response.diagnostics).toEqual({
    elapsedMs: 50,
    attempts: [
      {
        stage: 'primary',
        attempt: 1,
        model: 'mock',
        elapsedMs: 50,
        promptTokens: 20,
        completionTokens: 3,
      },
    ],
    promptHashes: { primary: 'abc' },
  });
  mutateResponse = (response) => {
    response.diagnostics = {
      elapsedMs: 1,
      attempts: Array(5).fill({ stage: 'primary', attempt: 1, elapsedMs: 1 }),
    };
  };
  await expect(
    client.match(catalog, query, ['1'], 'unbounded'),
  ).rejects.toThrow('Invalid matcher diagnostics');
});

it('accepts opaque backend mode identities and rejects the legacy protocol', async () => {
  mode = 'external-compatible-model';
  expect((await client.match(catalog, query, ['1'], 'opaque')).mode).toBe(mode);
  responseOverride = JSON.stringify({
    protocolVersion: 1,
    mode: 'lexical',
    modelVersion: 'legacy',
    catalogVersion: 'abc',
  });
  await expect(client.load(catalog)).rejects.toThrow(
    'Incompatible matcher protocol',
  );
});
