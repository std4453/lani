const assert = require("node:assert/strict");
const { test } = require("node:test");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { Readable, Writable } = require("node:stream");
const { Engine, settingsFromEnv, answer, digest } = require("../dist/engine");
const { Worker, makeHttpServer, serveJsonl } = require("../dist");
const { complete, AttemptError } = require("../dist/transport");
const {
  catalogRows,
  queryInput,
  decode,
  MAX_BYTES,
} = require("../dist/protocol");

const catalog = [
  {
    id: "new",
    title: "新篇",
    aliases: ["New"],
    year: 2026,
    quarter: 4,
    declaredEpisodeCount: 12,
    premiereDate: "2026-10-01",
  },
  { id: "old", title: "旧篇", aliases: ["Old"], year: 2025, quarter: 3 },
];
const query = {
  rawTitle: "New Season 2 - 03",
  aliases: ["New Season 2"],
  publishedAt: "2026-10-29T00:00:00+08:00",
  episode: 3,
  publisherSeason: 2,
};
const settings = (overrides = {}) => ({
  endpoint: "http://example.test/chat/completions",
  model: "synthetic",
  apiKey: "private-test-key",
  deadlineSeconds: 100,
  attemptSeconds: 45,
  concurrency: 2,
  fallbackEnabled: true,
  firstParameters: {},
  reviewParameters: {},
  ...overrides,
});
const completion = (value) => ({
  model: "synthetic",
  choices: [
    {
      finish_reason: "stop",
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
const request = (overrides = {}) => ({
  protocolVersion: 2,
  catalogVersion: "v1",
  requestId: "test",
  query,
  candidateIds: ["new"],
  ...overrides,
});

async function fixture(responses, overrides = {}) {
  const calls = [],
    events = [];
  const engine = new Engine(
    settings(overrides),
    async (_settings, payload, timeout) => {
      calls.push({ payload: structuredClone(payload), timeout });
      const response = responses.shift();
      if (response instanceof Error) throw response;
      return typeof response === "function" ? response() : response;
    },
    (event) => events.push(event)
  );
  const worker = new Worker(engine);
  await worker.dispatch("configure", {
    protocolVersion: 2,
    catalogVersion: "v1",
    catalog,
  });
  return { engine, worker, calls, events };
}

async function listen(t, handler) {
  const server =
    typeof handler === "function" ? http.createServer(handler) : handler;
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  return `http://127.0.0.1:${server.address().port}`;
}

function httpRequest(url, method = "GET", payload) {
  return new Promise((resolve, reject) => {
    const body =
      payload === undefined ? undefined : Buffer.from(JSON.stringify(payload));
    const req = http.request(
      url,
      { method, headers: body ? { "content-length": body.length } : {} },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode,
            data: JSON.parse(Buffer.concat(chunks)),
          })
        );
      }
    );
    req.on("error", reject);
    req.end(body);
  });
}

test("environment uses one prefix and validates configuration", () => {
  const env = {
    LANI_LLM_MATCHER_ENDPOINT: "http://example.test/complete",
    LANI_LLM_MATCHER_MODEL: "test",
    LANI_LLM_MATCHER_API_KEY: "key",
  };
  assert.equal(settingsFromEnv(env).concurrency, 2);
  assert.equal(
    settingsFromEnv({ ...env, LANI_LLM_MATCHER_API_KEY: " \tkey\r\n" }).apiKey,
    "key"
  );
  for (const apiKey of ["key\nembedded", "key with space", "密钥", "key\x7f"])
    assert.throws(() =>
      settingsFromEnv({ ...env, LANI_LLM_MATCHER_API_KEY: apiKey })
    );
  for (const [value, expected] of [
    ["true", true],
    [" 1 ", true],
    ["YES", true],
    ["false", false],
    ["0", false],
    ["no", false],
  ])
    assert.equal(
      settingsFromEnv({ ...env, LANI_LLM_MATCHER_FALLBACK_ENABLED: value })
        .fallbackEnabled,
      expected
    );
  for (const value of ["", "ture", "2"])
    assert.throws(() =>
      settingsFromEnv({ ...env, LANI_LLM_MATCHER_FALLBACK_ENABLED: value })
    );
  for (const [key, value] of [
    ["ENDPOINT", "https://user:key@example.test"],
    ["MODEL", ""],
    ["API_KEY", ""],
    ["CONCURRENCY", "1.5"],
    ["DEADLINE_SECONDS", "Infinity"],
    ["ATTEMPT_SECONDS", "0"],
    ["FIRST_PARAMETERS", '{"messages":[]}'],
    ["REVIEW_PARAMETERS", "[]"],
  ])
    assert.throws(() =>
      settingsFromEnv({ ...env, [`LANI_LLM_MATCHER_${key}`]: value })
    );
  assert.throws(() =>
    settingsFromEnv({
      LLM_ENDPOINT: env.LANI_LLM_MATCHER_ENDPOINT,
      LLM_MODEL: "test",
      LLM_API_KEY: "key",
    })
  );
});

test("frozen prompt bytes are unchanged", () => {
  for (const [file, hash] of Object.entries({
    "first.system.txt":
      "cb1c7b157d0840cab3ca2d9724d03e0c9b8f917157cbdc6300dbef6fe8a24dc3",
    "review.system.txt":
      "03d72de21599c6aa1e5ca35575a4696e9b2829655d94ee69c42b8450273655f7",
  }))
    assert.equal(
      digest(fs.readFileSync(path.join(__dirname, "../prompts", file), "utf8")),
      hash
    );
});

test("primary projection and opaque diagnostics exclude prompts and secrets", async () => {
  const f = await fixture([completion("new")]);
  const result = await f.worker.dispatch(
    "match",
    request({ mode: "ignored-client-choice" })
  );
  assert.equal(result.result.seasonId, "new");
  assert.equal(result.decision.stage, "primary");
  const prompt = f.calls[0].payload.messages[0].content;
  assert.ok(
    prompt.includes('{"id":"new","aliases":["新篇","New"],"y":2026,"q":4}')
  );
  assert.ok(!prompt.includes('"count":12'));
  assert.ok(!prompt.includes('"id":"old"'));
  assert.equal(result.diagnostics.attempts[0].cacheHitTokens, 90);
  assert.ok(!("promptHashes" in result.diagnostics));
  assert.equal(
    f.events.find((event) => event.event === "llm_prompt").hash,
    digest(prompt)
  );
  assert.ok(!JSON.stringify([result, f.events]).includes("private-test-key"));
});

test("null falls back to complete cached catalog independently", async () => {
  const f = await fixture([completion(null), completion("old")]);
  const result = await f.worker.dispatch("match", request());
  assert.equal(result.result.seasonId, "old");
  assert.deepEqual(result.decision, {
    stage: "fallback",
    fallbackReason: "primary_null",
  });
  assert.ok(
    f.calls[1].payload.messages[0].content.includes(
      '"count":12,"premiere":"2026-10-01"'
    )
  );
  assert.deepEqual(
    f.calls[0].payload.messages[1],
    f.calls[1].payload.messages[1]
  );
  assert.equal(f.calls[1].payload.messages.length, 2);
});

test("empty window falls back and empty catalog makes no paid request", async () => {
  const f = await fixture([completion("old")]);
  assert.equal(
    (await f.worker.dispatch("match", request({ candidateIds: [] }))).result
      .seasonId,
    "old"
  );
  await f.worker.dispatch("configure", {
    protocolVersion: 2,
    catalogVersion: "empty",
    catalog: [],
  });
  assert.equal(
    (
      await f.worker.dispatch(
        "match",
        request({ catalogVersion: "empty", candidateIds: [] })
      )
    ).result.seasonId,
    null
  );
  assert.equal(f.calls.length, 1);
});

test("numbering conflict requires explicit season and never produces confidence", async () => {
  const f = await fixture([
    completion("new"),
    completion("new"),
    completion(null),
  ]);
  const ordinary = {
    ...query,
    rawTitle: "New - 15",
    episode: 15,
    publisherSeason: null,
  };
  assert.equal(
    (await f.worker.dispatch("match", request({ query: ordinary }))).decision
      .stage,
    "primary"
  );
  const result = await f.worker.dispatch(
    "match",
    request({ query: { ...query, episode: 15 } })
  );
  assert.equal(result.decision.fallbackReason, "numbering_conflict");
  assert.equal(result.result.seasonId, null);
  assert.equal(result.result.score, undefined);
});

test("technical retries have a four-attempt cap and final errors are not null", async () => {
  const f = await fixture(
    Array.from({ length: 4 }, () => new AttemptError("INVALID_RESPONSE"))
  );
  await assert.rejects(f.worker.dispatch("match", request()), {
    code: "UPSTREAM_ERROR",
  });
  assert.equal(f.calls.length, 4);
  assert.equal(
    f.events.filter((event) => event.event === "llm_failure").length,
    1
  );
});

test("authentication failure is immediate and valid null has no technical retry", async () => {
  const auth = await fixture([new AttemptError("UPSTREAM_HTTP_401", false)]);
  await assert.rejects(auth.worker.dispatch("match", request()), {
    code: "UPSTREAM_ERROR",
  });
  assert.equal(auth.calls.length, 1);
  const empty = await fixture([completion(null), completion(null)]);
  assert.equal(
    (await empty.worker.dispatch("match", request())).result.seasonId,
    null
  );
  assert.equal(empty.calls.length, 2);
});

test("fallback can be disabled inside matcher configuration", async () => {
  const f = await fixture([completion(null)], { fallbackEnabled: false });
  assert.equal(
    (await f.worker.dispatch("match", request())).result.seasonId,
    null
  );
  assert.equal(f.calls.length, 1);
});

test("total deadline includes backoff and expires queued requests without calling provider", async () => {
  const f = await fixture(
    Array.from({ length: 4 }, () => new AttemptError("INVALID_RESPONSE")),
    { deadlineSeconds: 0.025, attemptSeconds: 0.01 }
  );
  await assert.rejects(f.worker.dispatch("match", request()), {
    code: "TIMEOUT",
  });
  assert.ok(f.calls.length < 4);
  let release;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  const queued = await fixture([() => pending], {
    deadlineSeconds: 0.04,
    attemptSeconds: 0.04,
    concurrency: 1,
  });
  const first = queued.worker.dispatch("match", request());
  await assert.rejects(
    queued.worker.dispatch("match", request({ requestId: "queued" })),
    { code: "TIMEOUT" }
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
  release(completion("new"));
  await assert.rejects(first, { code: "TIMEOUT" });
  assert.equal(queued.calls.length, 1);
});

test("concurrency slots are released after success and failure", async () => {
  let active = 0,
    peak = 0;
  const events = [];
  const engine = new Engine(
    settings({ concurrency: 2 }),
    async () => {
      peak = Math.max(peak, ++active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return completion("new");
    },
    (event) => events.push(event)
  );
  const worker = new Worker(engine);
  await worker.dispatch("configure", {
    protocolVersion: 2,
    catalogVersion: "v1",
    catalog,
  });
  await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      worker.dispatch("match", request({ requestId: String(i) }))
    )
  );
  assert.equal(peak, 2);
  assert.equal(active, 0);
});

test("answer rejects malformed containers, duplicate keys, extra fields, unknown ids and truncation", () => {
  for (const response of [
    null,
    [],
    { choices: "bad" },
    { choices: [null] },
    { choices: [{}] },
    { choices: [{ finish_reason: "stop", message: null }] },
    { ...completion("new"), choices: [] },
  ])
    assert.throws(() => answer(response, new Set(["new"])), {
      code: "INVALID_RESPONSE",
    });
  for (const content of [
    '{"s":"null"}',
    '{"s":4}',
    '{"s":null,"episode":1}',
    '{"s":null,"s":"new"}',
    "[]",
    '{"s":"other"}',
    '{"s":false}',
    '{"s":"new"',
  ]) {
    const response = completion(null);
    response.choices[0].message.content = content;
    assert.throws(() => answer(response, new Set(["new"])), {
      code: "INVALID_RESPONSE",
    });
  }
  const truncated = completion("new");
  truncated.choices[0].finish_reason = "length";
  assert.throws(() => answer(truncated, new Set(["new"])), {
    code: "INVALID_RESPONSE",
  });
  const escaped = completion(null);
  escaped.choices[0].message.content = ' { "\\u0073" : "n\\u0065w" } ';
  assert.equal(answer(escaped, new Set(["new"])), "new");
});

test("malformed responses retry and provider model names are diagnostic only", async () => {
  const valid = { ...completion("old"), model: "x".repeat(500) };
  const f = await fixture([{ choices: [null] }, { choices: [null] }, valid]);
  assert.equal(
    (await f.worker.dispatch("match", request())).result.seasonId,
    "old"
  );
  assert.equal(f.calls.length, 3);
});

test("catalog replacement is atomic and running requests retain their captured version", async () => {
  let release;
  const f = await fixture([
    () =>
      new Promise((resolve) => {
        release = resolve;
      }),
  ]);
  await assert.rejects(
    f.worker.dispatch("configure", {
      protocolVersion: 2,
      catalogVersion: "bad",
      catalog: [...catalog, catalog[0]],
    }),
    { code: "INVALID_REQUEST" }
  );
  assert.equal(f.worker.status().catalogVersion, "v1");
  for (const ids of [["missing"], ["new", "new"], undefined])
    await assert.rejects(
      f.worker.dispatch("match", request({ candidateIds: ids })),
      { code: "INVALID_REQUEST" }
    );
  const pending = f.worker.dispatch("match", request());
  await new Promise((resolve) => setImmediate(resolve));
  await f.worker.dispatch("configure", {
    protocolVersion: 2,
    catalogVersion: "v2",
    catalog: [],
  });
  release(completion("new"));
  assert.equal((await pending).catalogVersion, "v1");
  await assert.rejects(f.worker.dispatch("match", request()), {
    code: "CATALOG_MISMATCH",
  });
});

test("metadata only changes review projection and ignored episode fields are not read", () => {
  const engine = new Engine(settings(), undefined, () => {});
  const before = catalogRows(catalog);
  const after = catalogRows([
    {
      ...catalog[0],
      declaredEpisodeCount: 24,
      premiereDate: "2026-10-02",
      episodes: [{ ignored: true }],
    },
    catalog[1],
  ]);
  assert.equal(
    engine.prompt(before, ["new"], "primary"),
    engine.prompt(after, ["new"], "primary")
  );
  assert.notEqual(
    engine.prompt(before, ["new"], "fallback"),
    engine.prompt(after, ["new"], "fallback")
  );
});

test("query validates Unicode character bounds and published episode metadata", () => {
  assert.throws(
    () => decode(Buffer.from([123, 34, 120, 34, 58, 34, 255, 34, 125])),
    { code: "INVALID_REQUEST" }
  );
  assert.equal(
    queryInput({ ...query, rawTitle: "😀".repeat(2048) }).rawTitle.length,
    4096
  );
  for (const patch of [
    { rawTitle: "😀".repeat(2049) },
    { rawTitle: "\ud800" },
    { episode: Infinity },
    { episode: -1 },
    { publisherSeason: 1.5 },
    { publishedAt: "2026-10-29" },
    { publishedAt: "2026-10-29Z" },
    { publishedAt: "2026-02-30T00:00:00Z" },
    { publishedAt: "2026-10-29T24:00:00Z" },
  ])
    assert.throws(() => queryInput({ ...query, ...patch }), {
      code: "INVALID_REQUEST",
    });
});

test("real asynchronous transport preserves Unicode and never follows redirects", async (t) => {
  const seen = [];
  const url = await listen(t, async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    seen.push({
      path: req.url,
      authorization: req.headers.authorization,
      body: JSON.parse(Buffer.concat(chunks)),
    });
    if (req.url === "/redirect") {
      res.writeHead(302, { location: "/stolen" });
      res.end();
    } else res.end(JSON.stringify(completion("中文😀")));
  });
  const response = await complete(
    settings({ endpoint: url }),
    { title: "动画😀" },
    1000
  );
  assert.equal(answer(response, new Set(["中文😀"])), "中文😀");
  await assert.rejects(
    complete(settings({ endpoint: `${url}/redirect` }), {}, 1000),
    { code: "UPSTREAM_HTTP_302", retryable: false }
  );
  assert.deepEqual(
    seen.map((row) => row.path),
    ["/", "/redirect"]
  );
  assert.equal(seen[0].body.title, "动画😀");
  assert.equal(seen[0].authorization, "Bearer private-test-key");
});

test("transport hard deadline covers slow response headers and slow body", async (t) => {
  for (const phase of ["header", "body"]) {
    const url = await listen(t, (req, res) => {
      req.resume();
      if (phase === "header") res.socket.write("HTTP/1.1 200 OK\r\nX-Drip: ");
      else res.write('{"choices":');
      const timer = setInterval(() => {
        if (phase === "header") res.socket?.write("x");
        else res.write(" ");
      }, 20);
      res.on("close", () => clearInterval(timer));
    });
    const started = Date.now();
    await assert.rejects(complete(settings({ endpoint: url }), {}, 100), {
      code: "TIMEOUT",
    });
    assert.ok(Date.now() - started < 800);
  }
});

test("transport rejects oversized and malformed provider bodies", async (t) => {
  const url = await listen(t, (req, res) => {
    req.resume();
    res.end(
      req.url === "/large" ? "x".repeat(4 * 1024 * 1024 + 1) : "invalid json"
    );
  });
  for (const route of ["/large", "/malformed"])
    await assert.rejects(
      complete(settings({ endpoint: url + route }), {}, 1000),
      { code: "INVALID_RESPONSE" }
    );
});

test("HTTP and JSONL share the simplified v2 contract", async (t) => {
  const f = await fixture([completion("new")]);
  const url = await listen(t, makeHttpServer(f.worker));
  assert.equal(
    (await httpRequest(`${url}/v2/status`)).data.catalogVersion,
    "v1"
  );
  assert.equal(
    (await httpRequest(`${url}/v2/match`, "POST", request())).data.result
      .seasonId,
    "new"
  );
  assert.equal(
    (await httpRequest(`${url}/v2/catalog`, "PUT", { protocolVersion: 1 }))
      .status,
    422
  );
  assert.equal((await httpRequest(`${url}/unknown`)).status, 404);
  assert.equal(
    (
      await httpRequest(`${url}/v2/match`, "POST", {
        large: "x".repeat(MAX_BYTES),
      })
    ).status,
    400
  );
  let result = "";
  const output = new Writable({
    write(chunk, _encoding, callback) {
      result += chunk;
      callback();
    },
  });
  await serveJsonl(
    f.worker,
    Readable.from([
      '{"id":1,"method":"status","protocolVersion":2}\n',
      '{"id":2,"method":"status","protocolVersion":2}',
    ]),
    output
  );
  assert.deepEqual(
    result
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line).result.catalogVersion),
    ["v1", "v1"]
  );
});
