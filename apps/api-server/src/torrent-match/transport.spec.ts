import { createServer, Server } from 'http';
import { AddressInfo } from 'net';
import { MatcherTransport } from './transport';

let server: Server;
let client: MatcherTransport;
let version: string | null;
let requests: string[];
let resultId: string | null;
let fail: boolean;
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
  server = createServer((req, res) => {
    requests.push(`${req.method} ${req.url}`);
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
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
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  client = new MatcherTransport({
    endpoint: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    timeoutMs: 500,
  });
});
afterEach(async () => {
  await client.close();
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
  await expect(client.match(catalog, query, ['1'], 'fail')).rejects.toThrow();
  expect(requests).toEqual(['GET /v1/status']);
});
