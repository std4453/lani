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
      episodes: [],
    },
  ],
};
const query = { aliases: ['动画'], publishedAt: '2026-10-21T00:00:00Z' };

beforeEach(async () => {
  version = null;
  requests = [];
  resultId = '1';
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
      if (req.url === '/v1/catalog') version = body.catalogVersion;
      const status = {
        protocolVersion: 1,
        mode: 'lexical',
        modelVersion: 'test-model',
        catalogVersion: version,
      };
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify(
          req.url === '/v1/match'
            ? {
                ...status,
                requestId: body.requestId,
                result: { seasonId: resultId },
              }
            : status,
        ),
      );
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
  expect(requests.filter((r) => r === 'PUT /v1/catalog')).toHaveLength(1);
  version = null;
  await client.match(catalog, query, ['1'], 'third');
  expect(requests.filter((r) => r === 'PUT /v1/catalog')).toHaveLength(2);
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
  expect(requests).toEqual(['GET /v1/status']);
});

it('cancels a stalled request at the matching timeout and preserves the error code', async () => {
  hold = true;
  const result = client.load(catalog);
  await expect(result).rejects.toMatchObject({ code: 'ETIMEDOUT' });
  expect(requests).toEqual(['GET /v1/status']);
});

it('close cancels the active request and prevents queued requests from starting', async () => {
  hold = true;
  const active = client.load(catalog).catch((error) => error);
  const queued = client.load(catalog).catch((error) => error);
  await requestReceived;
  await client.close();
  expect(axios.isCancel(await active)).toBe(true);
  expect(await queued).toEqual(new Error('Matcher transport is closed'));
  expect(requests).toEqual(['GET /v1/status']);
});

it('rejects malformed JSON rather than treating it as a successful response', async () => {
  responseOverride = '{';
  await expect(client.load(catalog)).rejects.toThrow('Invalid matcher JSON');
});

it('rejects oversized responses and requests without retrying', async () => {
  responseOverride = 'x'.repeat(16 * 1024 * 1024 + 1);
  await expect(client.load(catalog)).rejects.toBeInstanceOf(HttpRequestError);
  expect(requests).toEqual(['GET /v1/status']);
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
  expect(requests).toEqual(['GET /v1/status', 'GET /v1/status']);
});
