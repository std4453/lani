jest.mock('@/config', () => ({
  __esModule: true,
  default: { matching: {}, llm: { concurrency: 2, timeoutMs: 45000 } },
}));

import { Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import config from '@/config';
import { MatchingLlmConfig } from '@/config/matching';
import { LlmError } from '@/llm/llm.errors';
import { LlmService } from '@/llm/llm.service';
import { CatalogSnapshot, MatchQuery } from '../protocol';
import { LlmMatcher, matchAnswer, usageRecord } from './llm-matcher';

const catalog: CatalogSnapshot = {
  version: 'v1',
  catalog: [
    {
      id: 'new',
      title: '新篇',
      aliases: ['New'],
      year: 2026,
      quarter: 4,
      declaredEpisodeCount: 12,
      premiereDate: '2026-10-01',
    },
    { id: 'old', title: '旧篇', aliases: ['Old'], year: 2025, quarter: 3 },
  ],
};
const query: MatchQuery = {
  rawTitle: 'New Season 2 - 03',
  aliases: ['New Season 2'],
  publishedAt: '2026-10-29T00:00:00+08:00',
  episode: 3,
  publisherSeason: 2,
};
const settings = (
  overrides: Partial<MatchingLlmConfig> = {},
): MatchingLlmConfig => ({
  apiBase: 'https://example.test/v1',
  apiKey: 'private-test-key',
  model: 'synthetic',
  deadlineMs: 100000,
  fallbackEnabled: true,
  firstParameters: {},
  reviewParameters: {},
  ...overrides,
});
const completion = (value: string | null) => ({
  model: 'synthetic',
  choices: [
    {
      finish_reason: 'stop',
      message: { content: JSON.stringify({ s: value }) },
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 10,
    prompt_cache_hit_tokens: 90,
    prompt_cache_miss_tokens: 10,
  },
});

let events: any[];
let failures: string[];
beforeEach(() => {
  config.matching.llm = settings();
  events = [];
  failures = [];
  jest.spyOn(Logger.prototype, 'log').mockImplementation((message) => {
    events.push(JSON.parse(message));
  });
  jest.spyOn(Logger.prototype, 'error').mockImplementation((message) => {
    failures.push(String(message));
  });
});
afterEach(() => jest.restoreAllMocks());

function fixture(responses: any[]) {
  const calls: { channel: unknown; payload: any; signal: AbortSignal }[] = [];
  const service = {
    complete: jest.fn(async (channel, payload, signal) => {
      calls.push({
        channel,
        payload: JSON.parse(JSON.stringify(payload)),
        signal,
      });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return typeof response === 'function' ? response(signal) : response;
    }),
  };
  const matcher = new LlmMatcher(service as unknown as LlmService);
  const match = (
    patch: Partial<MatchQuery> = {},
    ids = ['new'],
    snapshot = catalog,
  ) => matcher.match(snapshot, { ...query, ...patch }, ids, 'test');
  return { matcher, calls, service, match };
}

test('preserves the frozen prompt bytes', () => {
  for (const [file, hash] of Object.entries({
    'first.system.txt':
      'cb1c7b157d0840cab3ca2d9724d03e0c9b8f917157cbdc6300dbef6fe8a24dc3',
    'review.system.txt':
      '03d72de21599c6aa1e5ca35575a4696e9b2829655d94ee69c42b8450273655f7',
  })) {
    expect(
      createHash('sha256')
        .update(readFileSync(join(__dirname, 'prompts', file)))
        .digest('hex'),
    ).toBe(hash);
  }
});

test('constructs lazily when the external backend has no LLM configuration', () => {
  config.matching.llm = undefined;
  expect(() => new LlmMatcher({} as LlmService)).not.toThrow();
});

test('projects primary input and forwards a single channel and abort signal', async () => {
  const f = fixture([completion('new')]);
  const result = await f.match();
  expect(result.result.seasonId).toBe('new');
  expect(result.decision).toEqual({ stage: 'primary' });
  expect(f.calls[0].channel).toEqual({
    apiBase: 'https://example.test/v1',
    apiKey: 'private-test-key',
  });
  expect(f.calls[0].signal).toBeInstanceOf(AbortSignal);
  const payload = f.calls[0].payload;
  expect(payload.messages[0].content).toContain(
    '{"id":"new","aliases":["新篇","New"],"y":2026,"q":4}',
  );
  expect(payload.messages[0].content).not.toContain('"count":12');
  expect(payload.messages[0].content).not.toContain('"id":"old"');
  expect(payload).toMatchObject({
    stream: false,
    response_format: { type: 'json_object' },
    temperature: 0,
    max_tokens: 128,
  });
  expect((result.diagnostics as any).attempts[0].cacheHitTokens).toBe(90);
  expect(JSON.stringify([result, events])).not.toContain('private-test-key');
});

test('null falls back independently to the complete snapshot', async () => {
  const f = fixture([completion(null), completion('old')]);
  const result = await f.match();
  expect(result.result.seasonId).toBe('old');
  expect(result.decision).toEqual({
    stage: 'fallback',
    fallbackReason: 'primary_null',
  });
  expect(f.calls[1].payload.messages[0].content).toContain(
    '"count":12,"premiere":"2026-10-01"',
  );
  expect(f.calls[1].payload.messages[1]).toEqual(
    f.calls[0].payload.messages[1],
  );
  expect(f.calls[1].payload.messages).toHaveLength(2);
  expect(f.calls[1].signal).toBe(f.calls[0].signal);
});

test('empty recent candidates use fallback, while empty catalogs incur no request', async () => {
  const f = fixture([completion('old')]);
  expect((await f.match({}, [])).result.seasonId).toBe('old');
  expect(
    (await f.match({}, [], { version: 'empty', catalog: [] })).result.seasonId,
  ).toBeNull();
  expect(f.calls).toHaveLength(1);
});

test('numbering conflict requires an explicit season and never emits confidence', async () => {
  const f = fixture([completion('new'), completion('new'), completion(null)]);
  const ordinary = {
    rawTitle: 'New - 15',
    episode: 15,
    publisherSeason: undefined,
  };
  expect((await f.match(ordinary)).decision).toEqual({ stage: 'primary' });
  const result = await f.match({ episode: 15 });
  expect(result.decision).toEqual({
    stage: 'fallback',
    fallbackReason: 'numbering_conflict',
  });
  expect(result.result.seasonId).toBeNull();
  expect(result.result.score).toBeUndefined();
});

test('technical failures cap each stage at two attempts and remain failures', async () => {
  const f = fixture(
    Array.from({ length: 4 }, () => new LlmError('INVALID_RESPONSE')),
  );
  await expect(f.match()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
  expect(f.calls).toHaveLength(4);
  expect(new Set(f.calls.map((call) => call.signal)).size).toBe(1);
});

test('authentication failure is immediate and valid null is not retried', async () => {
  const auth = fixture([new LlmError('HTTP_401', false)]);
  await expect(auth.match()).rejects.toMatchObject({ code: 'HTTP_401' });
  expect(auth.calls).toHaveLength(1);
  const empty = fixture([completion(null), completion(null)]);
  expect((await empty.match()).result.seasonId).toBeNull();
  expect(empty.calls).toHaveLength(2);
});

test('fallback and provider parameters belong to matcher configuration', async () => {
  config.matching.llm = settings({
    fallbackEnabled: false,
    firstParameters: { thinking: { type: 'disabled' } },
  });
  const f = fixture([completion(null)]);
  expect((await f.match()).result.seasonId).toBeNull();
  expect(f.calls).toHaveLength(1);
  expect(f.calls[0].payload.thinking).toEqual({ type: 'disabled' });
});

test('provider parameters cannot replace the model, messages or structured output contract', async () => {
  const unsafe = {
    model: 'other',
    messages: [],
    stream: true,
    response_format: { type: 'text' },
  };
  config.matching.llm = settings({
    firstParameters: unsafe,
    reviewParameters: unsafe,
  });
  const f = fixture([completion(null), completion('old')]);
  await f.match();
  for (const call of f.calls) {
    expect(call.payload.model).toBe('synthetic');
    expect(call.payload.messages).toHaveLength(2);
    expect(call.payload.stream).toBe(false);
    expect(call.payload.response_format).toEqual({ type: 'json_object' });
  }
});

test('total deadline aborts time spent waiting in the shared LLM service', async () => {
  config.matching.llm = settings({ deadlineMs: 25 });
  const f = fixture([
    (signal: AbortSignal) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => reject(new LlmError('ABORTED', false)),
          { once: true },
        );
      }),
  ]);
  await expect(f.match()).rejects.toMatchObject({
    code: 'TIMEOUT',
    retryable: false,
  });
  expect(f.calls[0].signal.aborted).toBe(true);
  expect(f.calls).toHaveLength(1);
  expect(
    events.some(
      (event) => event.event === 'llm_failure' && event.code === 'TIMEOUT',
    ),
  ).toBe(true);
});

test('total deadline includes retry backoff and prevents additional calls', async () => {
  config.matching.llm = settings({ deadlineMs: 25 });
  const f = fixture([new LlmError('NETWORK_ERROR')]);
  await expect(f.match()).rejects.toMatchObject({ code: 'TIMEOUT' });
  expect(f.calls).toHaveLength(1);
});

test('late provider success after the deadline cannot become a match', async () => {
  config.matching.llm = settings({ deadlineMs: 10 });
  const f = fixture([
    () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(completion('new')), 25);
      }),
  ]);
  await expect(f.match()).rejects.toMatchObject({ code: 'TIMEOUT' });
  expect(f.calls).toHaveLength(1);
  expect(f.calls[0].signal.aborted).toBe(true);
  expect(events.some((event) => event.event === 'llm_match')).toBe(false);
});

test('close aborts active requests, waits for settlement, and stops new work', async () => {
  let entered: () => void;
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const f = fixture([
    (signal: AbortSignal) =>
      new Promise((_resolve, reject) => {
        entered();
        signal.addEventListener(
          'abort',
          () => reject(new LlmError('ABORTED', false)),
          { once: true },
        );
      }),
  ]);
  const matching = f.match();
  await started;
  const rejection = expect(matching).rejects.toMatchObject({ code: 'ABORTED' });
  await f.matcher.close();
  await rejection;
  await expect(f.match()).rejects.toMatchObject({ code: 'CLOSED' });
  await expect(f.matcher.load(catalog)).rejects.toMatchObject({
    code: 'CLOSED',
  });
});

test('catalog replacement preserves the snapshot of an in-flight request', async () => {
  let release!: (response: unknown) => void;
  const f = fixture([
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  ]);
  const pending = f.match();
  await f.matcher.load({ version: 'empty', catalog: [] });
  release(completion('new'));
  const result = await pending;
  expect(result.catalogVersion).toBe('v1');
  expect(result.result.seasonId).toBe('new');
});

test('metadata only changes the fallback projection', async () => {
  const f = fixture([
    completion(null),
    completion('new'),
    completion(null),
    completion('new'),
  ]);
  await f.match();
  await f.match({}, ['new'], {
    version: 'v2',
    catalog: [
      {
        ...catalog.catalog[0],
        declaredEpisodeCount: 24,
        premiereDate: '2026-10-02',
      },
      catalog.catalog[1],
    ],
  });
  expect(f.calls[0].payload.messages[0]).toEqual(
    f.calls[2].payload.messages[0],
  );
  expect(f.calls[1].payload.messages[0]).not.toEqual(
    f.calls[3].payload.messages[0],
  );
});

test('model version tracks prompts and public settings but excludes the key', async () => {
  const f = fixture([]);
  const first = await f.matcher.load(catalog);
  config.matching.llm = settings({ apiKey: 'another-private-key' });
  expect((await f.matcher.load(catalog)).modelVersion).toBe(first.modelVersion);
  config.matching.llm = settings({ model: 'changed-model' });
  expect((await f.matcher.load(catalog)).modelVersion).not.toBe(
    first.modelVersion,
  );
});

test('unknown errors are logged with details and redaction, then fail generically', async () => {
  const f = fixture([new Error('synthetic failure private-test-key')]);
  await expect(f.match()).rejects.toMatchObject({
    code: 'UPSTREAM_ERROR',
    retryable: false,
  });
  expect(f.calls).toHaveLength(1);
  expect(failures.join('\n')).toContain('synthetic failure');
  expect(failures.join('\n')).not.toContain('private-test-key');
});

test('strict model answer parsing rejects malformed JSON, extra keys, unknown IDs and truncation', () => {
  for (const response of [
    null,
    [],
    { choices: [] },
    { choices: [null] },
    { choices: [{}] },
  ])
    expect(() => matchAnswer(response, new Set(['new']))).toThrow(LlmError);
  for (const content of [
    '{"s":"null"}',
    '{"s":4}',
    '{"s":null,"episode":1}',
    '{"s":null,"s":"new"}',
    '[]',
    '{"s":"other"}',
    '{"s":false}',
    '{"s":"new"',
  ]) {
    const response = completion(null);
    response.choices[0].message.content = content;
    expect(() => matchAnswer(response, new Set(['new']))).toThrow(LlmError);
  }
  const truncated = completion('new');
  truncated.choices[0].finish_reason = 'length';
  expect(() => matchAnswer(truncated, new Set(['new']))).toThrow(LlmError);
  const escaped = completion(null);
  escaped.choices[0].message.content = ' { "\\u0073" : "n\\u0065w" } ';
  expect(matchAnswer(escaped, new Set(['new']))).toBe('new');
});

test('usage accepts only finite nonnegative counters without inventing missing values', () => {
  expect(usageRecord({})).toEqual({});
  expect(
    usageRecord({
      usage: {
        prompt_tokens: 10,
        completion_tokens: -1,
        prompt_tokens_details: { cached_tokens: 4 },
        completion_tokens_details: { reasoning_tokens: 3 },
      },
    }),
  ).toEqual({ promptTokens: 10, cacheHitTokens: 4, reasoningTokens: 3 });
});
