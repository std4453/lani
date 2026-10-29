import { Logger } from '@nestjs/common';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { Socket } from 'net';
import config from '@/config';
import { describeLlmError } from './llm.errors';
import { LlmChannel, LlmService } from './llm.service';

jest.mock('@/config', () => ({
  __esModule: true,
  default: { llm: { concurrency: 1, timeoutMs: 1000 } },
}));

describe('LlmService', () => {
  let server: Server;
  let service: LlmService;
  let channel: LlmChannel;
  let handle: (req: IncomingMessage, res: ServerResponse) => void;
  let sockets: Set<Socket>;
  const payload = {
    model: 'compatible-model',
    messages: [{ role: 'user', content: 'title' }],
    thinking: { type: 'disabled' },
    stream: false,
  };
  const reply = (res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({ choices: [{ message: { content: '{"s":"a"}' } }] }),
    );
  };

  beforeEach(async () => {
    config.llm = { concurrency: 1, timeoutMs: 1000 };
    sockets = new Set();
    server = createServer((req, res) => handle(req, res));
    server.on('connection', (socket) => sockets.add(socket));
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No test port');
    channel = {
      apiBase: `http://127.0.0.1:${address.port}/v1`,
      apiKey: 'test-key',
    };
    service = new LlmService();
  });

  afterEach(async () => {
    service.onModuleDestroy();
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    jest.restoreAllMocks();
  });

  it('uses the SDK with an arbitrary compatible base and provider parameters', async () => {
    let request: unknown;
    handle = (req, res) => {
      expect(req.url).toBe('/v1/chat/completions');
      expect(req.headers.authorization).toBe('Bearer test-key');
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        request = JSON.parse(Buffer.concat(chunks).toString());
        reply(res);
      });
    };
    await expect(service.complete(channel, payload)).resolves.toMatchObject({
      choices: [{ message: { content: '{"s":"a"}' } }],
    });
    expect(request).toEqual(payload);
  });

  it.each([
    [429, true],
    [401, false],
  ])(
    'leaves retry decisions to the caller for HTTP %s',
    async (status, retryable) => {
      let requests = 0;
      handle = (_req, res) => {
        requests++;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end('{"error":{"message":"busy"}}');
      };
      await expect(service.complete(channel, payload)).rejects.toMatchObject({
        code: `HTTP_${status}`,
        retryable,
      });
      expect(requests).toBe(1);
    },
  );

  it('bounds reading a slow response body and releases the concurrency slot', async () => {
    config.llm = { concurrency: 1, timeoutMs: 50 };
    let requests = 0;
    handle = (_req, res) => {
      if (++requests === 1) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write('{');
      } else reply(res);
    };
    await expect(service.complete(channel, payload)).rejects.toMatchObject({
      code: 'TIMEOUT',
    });
    await expect(service.complete(channel, payload)).resolves.toBeDefined();
    expect(requests).toBe(2);
  });

  it('cancels a queued call without sending it', async () => {
    let started!: () => void;
    const firstStarted = new Promise<void>((resolve) => (started = resolve));
    let firstResponse!: ServerResponse;
    let requests = 0;
    handle = (_req, res) => {
      requests++;
      firstResponse = res;
      started();
    };
    const first = service.complete(channel, payload);
    await firstStarted;
    const controller = new AbortController();
    const queued = service.complete(channel, payload, controller.signal);
    controller.abort();
    await expect(queued).rejects.toMatchObject({ code: 'ABORTED' });
    reply(firstResponse);
    await first;
    await new Promise((resolve) => setImmediate(resolve));
    expect(requests).toBe(1);
  });

  it('cancels active and queued calls on shutdown', async () => {
    let started!: () => void;
    const firstStarted = new Promise<void>((resolve) => (started = resolve));
    handle = () => started();
    const first = service.complete(channel, payload);
    await firstStarted;
    const queued = service.complete(channel, payload);
    service.onModuleDestroy();
    await expect(first).rejects.toMatchObject({ code: 'ABORTED' });
    await expect(queued).rejects.toMatchObject({ code: 'ABORTED' });
    await expect(service.complete(channel, payload)).rejects.toMatchObject({
      code: 'ABORTED',
    });
  });

  it('logs unknown errors with details while redacting the channel key', async () => {
    const log = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    handle = (_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('invalid-json-test-key');
    };
    await expect(service.complete(channel, payload)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
    });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('FetchError'));
    expect(JSON.stringify(log.mock.calls)).not.toContain('test-key');
    expect(describeLlmError({ reason: 'test-key' }, 'test-key')).toContain(
      '[REDACTED]',
    );
  });
});
