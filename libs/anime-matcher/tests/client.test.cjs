const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { AnimeMatcherClient, AnimeMatcherError } = require("../dist/index.js");

const catalog = [
  {
    id: "s1",
    title: "独立候选火星邮递员 XYZ",
    aliases: [],
    year: null,
    quarter: null,
  },
];
const configure = () => ({
  protocolVersion: 1,
  catalogVersion: "a".repeat(64),
  catalog: structuredClone(catalog),
});
const match = (extra = {}) => ({
  protocolVersion: 1,
  catalogVersion: "a".repeat(64),
  requestId: "torrent:1:v1",
  query: {
    aliases: [catalog[0].title],
    publishedAt: "2026-10-21T12:00:00+08:00",
    episode: 1.5,
  },
  candidateIds: ["s1"],
  ...extra,
});
const status = (version = null) => ({
  protocolVersion: 1,
  catalogVersion: version,
  modelVersion: "test-model-v1",
  mode: "lexical",
});
const response = (request, extra = {}) => ({
  ...status(request.catalogVersion),
  requestId: request.requestId,
  result: { seasonId: request.candidateIds[0] ?? null },
  ...extra,
});
const hasCode = (code) => (error) =>
  error instanceof AnimeMatcherError && error.code === code;
const configureV2 = () => ({ ...configure(), protocolVersion: 2 });
const matchV2 = (extra = {}) => {
  const request = match();
  return {
    ...request,
    protocolVersion: 2,
    query: { ...request.query, rawTitle: "[发布组] 独立候选火星邮递员 XYZ - 01.5" },
    ...extra,
  };
};
const statusV2 = (version = null) => ({
  ...status(version), protocolVersion: 2, mode: "external-openai-compatible",
});
const responseV2 = (request, extra = {}) => ({
  ...statusV2(request.catalogVersion),
  requestId: request.requestId,
  result: { seasonId: request.candidateIds[0] ?? null },
  ...extra,
});

function fakeWorker(t, behavior = "normal") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "anime-v1-"));
  const file = path.join(dir, "python");
  const capture = path.join(dir, "requests.jsonl");
  const starts = path.join(dir, "starts");
  const argv = path.join(dir, "argv.json");
  fs.writeFileSync(
    file,
    `#!/usr/bin/env node
const fs = require('node:fs');
const rl = require('node:readline');
const behavior = ${JSON.stringify(behavior)};
const capture = ${JSON.stringify(capture)};
fs.appendFileSync(${JSON.stringify(starts)}, 'start\\n');
fs.writeFileSync(${JSON.stringify(argv)}, JSON.stringify(process.argv.slice(2)));
let version = null;
const status = (protocolVersion=1) => ({protocolVersion,catalogVersion:version,modelVersion:'test-model-v1',mode:'lexical'});
rl.createInterface({input:process.stdin}).on('line', line => {
  const r = JSON.parse(line); fs.appendFileSync(capture,line+'\\n');
  if (behavior === 'null') { process.stdout.write('null\\n'); return; }
  if (behavior === 'wrong-id') { process.stdout.write(JSON.stringify({id:r.id+1,result:status()})+'\\n'); return; }
  let reply;
  if (r.method === 'status') reply = {id:r.id,result:status(r.protocolVersion)};
  else if (r.method === 'configure') {
    if (behavior === 'configure-error') reply = {id:r.id,error:{code:'INTERNAL_ERROR',message:'构建失败'}};
    else { version = r.catalogVersion; reply = {id:r.id,result:status(r.protocolVersion)}; }
  } else {
    if (behavior === 'hang') return;
    if (!version) reply = {id:r.id,error:{code:'CATALOG_MISSING',message:'目录为空'}};
    else if (version !== r.catalogVersion) reply = {id:r.id,error:{code:'CATALOG_MISMATCH',message:'目录版本不符'}};
    else reply = {id:r.id,result:{...status(r.protocolVersion),requestId:r.requestId,result:{seasonId:r.candidateIds[0]??null,reason:'中文原因'}}};
  }
  const bytes = Buffer.from(JSON.stringify(reply)+'\\n');
  if (behavior === 'split-utf8') {
    let i = bytes.indexOf(Buffer.from('中'));
    if (i >= 0) { process.stdout.write(bytes.subarray(0,i+1)); setTimeout(()=>process.stdout.write(bytes.subarray(i+1)),5); return; }
  }
  process.stdout.write(bytes);
});
`,
    { mode: 0o755 }
  );
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return {
    file,
    capture,
    starts,
    argv: () => JSON.parse(fs.readFileSync(argv, "utf8")),
    requests: () =>
      fs.existsSync(capture)
        ? fs.readFileSync(capture, "utf8").trim().split("\n").map(JSON.parse)
        : [],
  };
}

test("local runtime options are passed as distinct process arguments", async (t) => {
  const fake = fakeWorker(t);
  const client = new AnimeMatcherClient({
    python: fake.file,
    device: "cuda",
    dtype: "bfloat16",
    modelDir: "/models with spaces",
    profile: "/profiles with spaces/model.json",
  });
  t.after(() => client.close());
  await client.status();
  assert.deepEqual(fake.argv(), [
    "-m", "lani_anime_matcher.worker",
    "--model-dir", "/models with spaces",
    "--device", "cuda",
    "--dtype", "bfloat16",
    "--profile", "/profiles with spaces/model.json",
  ]);
});

async function httpFixture(t, handler) {
  const requests = [];
  const sockets = new Set();
  const server = http.createServer((req, res) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = body ? JSON.parse(body) : undefined;
      requests.push({ method: req.method, path: req.url, body: data });
      handler(req, res, data, requests.length);
    });
  });
  server.on("connection", (s) => {
    sockets.add(s);
    s.on("close", () => sockets.delete(s));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => {
    for (const s of sockets) s.destroy();
    await new Promise((resolve) => server.close(resolve));
  });
  return { endpoint: `http://127.0.0.1:${server.address().port}`, requests };
}
function send(res, body, code = 200) {
  res.writeHead(code, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

test("explicit status/configure followed by matches; one worker, no hidden configuration", async (t) => {
  const fake = fakeWorker(t);
  const client = new AnimeMatcherClient({ python: fake.file });
  t.after(() => client.close());
  await assert.rejects(client.match(match()), hasCode("UNAVAILABLE"));
  assert.equal(fake.requests().length, 0);
  assert.equal((await client.status()).catalogVersion, null);
  await assert.rejects(client.match(match()), hasCode("CATALOG_MISSING"));
  const cfg = configure();
  const pending = client.configure(cfg);
  cfg.catalog[0].title = "modified";
  await pending;
  const a = client.match(match());
  const b = client.match(match({ candidateIds: [] }));
  assert.equal((await a).result.seasonId, "s1");
  assert.equal((await b).result.seasonId, null);
  assert.deepEqual(
    fake.requests().map((r) => r.method),
    ["status", "match", "configure", "match", "match"]
  );
  assert.equal(fake.requests()[2].catalog[0].title, catalog[0].title);
  assert.equal(fs.readFileSync(fake.starts, "utf8"), "start\n");
});

test("structured errors are preserved without retry or catalog restoration", async (t) => {
  const fake = fakeWorker(t, "configure-error");
  const client = new AnimeMatcherClient({ python: fake.file });
  t.after(() => client.close());
  await assert.rejects(
    client.configure(configure()),
    hasCode("INTERNAL_ERROR")
  );
  await assert.rejects(client.match(match()), hasCode("CATALOG_MISSING"));
  assert.deepEqual(
    fake.requests().map((r) => r.method),
    ["configure", "match"]
  );
});

test("JSONL preserves static count and publisher season as optional input", async (t) => {
  const fake = fakeWorker(t);
  const client = new AnimeMatcherClient({ python: fake.file });
  t.after(() => client.close());
  const cfg = configure();
  cfg.catalog[0].declaredEpisodeCount = 12;
  await client.configure(cfg);
  const request = match();
  request.query.publisherSeason = 2;
  await client.match(request);
  assert.equal(fake.requests()[0].catalog[0].declaredEpisodeCount, 12);
  assert.equal(fake.requests()[1].query.publisherSeason, 2);
  assert.equal(fake.requests()[1].query.episode, 1.5);
});

test("timeout kills child; only explicit status/configure can recover", async (t) => {
  const fake = fakeWorker(t, "hang");
  const client = new AnimeMatcherClient({ python: fake.file, timeoutMs: 250 });
  t.after(() => client.close());
  await client.configure(configure());
  const old = client.worker;
  await assert.rejects(client.match(match()), hasCode("TIMEOUT"));
  await assert.rejects(client.match(match()), hasCode("UNAVAILABLE"));
  assert.equal((await client.status()).catalogVersion, null);
  const replacement = client.worker;
  old.stdout.emit("data", Buffer.from('{"id":4,"result":{}}\n'));
  old.emit("exit", null, "SIGKILL");
  assert.equal(client.worker, replacement);
  await client.configure(configure());
  assert.deepEqual(
    fake.requests().map((r) => r.method),
    ["configure", "match", "status", "configure"]
  );
});

test("JSONL supports split UTF-8 and rejects malformed/correlated envelopes", async (t) => {
  for (const behavior of ["split-utf8", "null", "wrong-id"]) {
    const fake = fakeWorker(t, behavior);
    const client = new AnimeMatcherClient({ python: fake.file });
    if (behavior === "split-utf8") {
      await client.configure(configure());
      assert.equal((await client.match(match())).result.reason, "中文原因");
    } else await assert.rejects(client.status(), hasCode("INVALID_RESPONSE"));
    await client.close();
  }
});

test("HTTP routes use full v1 payloads and never resend catalog on match", async (t) => {
  let version = null;
  const fixture = await httpFixture(t, (req, res, body) => {
    if (req.method === "GET") send(res, status(version));
    else if (req.method === "PUT") {
      version = body.catalogVersion;
      send(res, status(version));
    } else send(res, response(body));
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  t.after(() => client.close());
  assert.equal((await client.status()).catalogVersion, null);
  await client.configure(configure());
  assert.equal((await client.match(match())).result.seasonId, "s1");
  assert.equal(
    (await client.match(match({ candidateIds: [] }))).result.seasonId,
    null
  );
  assert.deepEqual(
    fixture.requests.map((r) => [r.method, r.path]),
    [
      ["GET", "/v1/status"],
      ["PUT", "/v1/catalog"],
      ["POST", "/v1/match"],
      ["POST", "/v1/match"],
    ]
  );
  assert.deepEqual(fixture.requests[2].body, match());
});

test("v2 HTTP routes preserve metadata and leave backend configuration to the server", async (t) => {
  let version = null;
  const fixture = await httpFixture(t, (req, res, body) => {
    if (req.method === "GET") send(res, statusV2(version));
    else if (req.method === "PUT") {
      version = body.catalogVersion;
      send(res, statusV2(version));
    } else send(res, responseV2(body));
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint, semantic: false });
  t.after(() => client.close());
  assert.equal((await client.status(2)).protocolVersion, 2);
  const cfg = configureV2();
  cfg.catalog[0].premiereDate = "2026-10-01";
  await client.configure(cfg);
  assert.equal((await client.match(matchV2())).result.seasonId, "s1");
  assert.deepEqual(fixture.requests.map((r) => [r.method, r.path]), [
    ["GET", "/v2/status"], ["PUT", "/v2/catalog"], ["POST", "/v2/match"],
  ]);
  assert.deepEqual(fixture.requests[1].body, cfg);
  assert.deepEqual(fixture.requests[2].body, matchV2());
});

test("v2 JSONL envelopes retain the recent candidate list", async (t) => {
  const fake = fakeWorker(t);
  const client = new AnimeMatcherClient({ python: fake.file });
  t.after(() => client.close());
  assert.equal((await client.status(2)).protocolVersion, 2);
  await client.configure(configureV2());
  assert.equal((await client.match(matchV2())).result.seasonId, "s1");
  assert.deepEqual(fake.requests().map((r) => r.protocolVersion), [2, 2, 2]);
  assert.deepEqual(fake.requests()[2].candidateIds, ["s1"]);
});

test("v2 validates core identity and the configured full catalog", async (t) => {
  const request = matchV2();
  const malformed = [
    responseV2(request, { protocolVersion: 1 }),
    responseV2(request, { catalogVersion: "stale" }),
    responseV2(request, { requestId: "stale" }),
    responseV2(request, { result: {} }),
    responseV2(request, { result: { seasonId: "outside" } }),
  ];
  for (const body of malformed) {
    const fixture = await httpFixture(t, (req, res) => send(res,
      req.method === "PUT" ? statusV2(request.catalogVersion) : body));
    const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
    await client.configure(configureV2());
    await assert.rejects(client.match(request), hasCode("INVALID_RESPONSE"));
    await client.close();
  }
  const fixture = await httpFixture(t, (req, res) => send(res,
    req.method === "PUT" ? statusV2(request.catalogVersion) : responseV2(request, {
      result: { seasonId: "s2" },
    })));
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  const cfg = configureV2();
  cfg.catalog.push({ ...cfg.catalog[0], id: "s2" });
  await client.configure(cfg);
  assert.equal((await client.match(request)).result.seasonId, "s2");
  await client.close();
});

test("v2 needs an acknowledged catalog and snapshots IDs before queued configuration", async (t) => {
  const fixture = await httpFixture(t, (req, res, body) => {
    if (req.method === "POST") send(res, responseV2(body));
    else send(res, { protocolVersion: 2, catalogVersion: configureV2().catalogVersion });
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  t.after(() => client.close());
  await client.status(2);
  await assert.rejects(client.match(matchV2()), hasCode("CATALOG_MISSING"));
  assert.equal(fixture.requests.length, 1);
  const cfg = configureV2();
  const configuring = client.configure(cfg);
  cfg.catalog[0].id = "changed-after-enqueue";
  const matching = client.match(matchV2());
  await configuring;
  assert.equal((await matching).result.seasonId, "s1");
  await assert.rejects(client.match(matchV2({ catalogVersion: "unknown" })), hasCode("CATALOG_MISSING"));
  assert.equal(fixture.requests.length, 3);
});

test("failed configure leaves the last acknowledged catalog available", async (t) => {
  const fixture = await httpFixture(t, (req, res, body) => {
    if (body.catalogVersion === "failed") {
      send(res, { protocolVersion: 2, error: { code: "INTERNAL_ERROR", message: "配置失败" } }, 500);
    } else send(res, req.method === "PUT" ? statusV2(body.catalogVersion) : responseV2(body));
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  t.after(() => client.close());
  await client.configure(configureV2());
  await assert.rejects(client.configure({ ...configureV2(), catalogVersion: "failed" }), hasCode("INTERNAL_ERROR"));
  assert.equal((await client.match(matchV2())).result.seasonId, "s1");
});

test("both protocols preserve optional JSON extensions without backend identity checks", async (t) => {
  for (const protocolVersion of [1, 2]) {
    for (const extensions of [{}, {
      mode: { provider: "arbitrary" }, modelVersion: null,
      decision: ["custom"], diagnostics: { nested: [true, null, 3] },
    }]) {
      const version = configure().catalogVersion;
      const fixture = await httpFixture(t, (req, res, body) => {
        const core = { protocolVersion, catalogVersion: req.method === "GET" ? null : version };
        send(res, {
          ...core, ...extensions,
          ...(req.method === "POST" ? {
            requestId: body.requestId,
            result: { seasonId: "s1", score: { custom: true }, reason: ["custom"] },
          } : {}),
        });
      });
      const client = new AnimeMatcherClient({ endpoint: fixture.endpoint, semantic: true });
      await client.status(protocolVersion);
      await client.configure(protocolVersion === 1 ? configure() : configureV2());
      const result = await client.match(protocolVersion === 1 ? match() : matchV2());
      assert.equal(result.result.seasonId, "s1");
      assert.deepEqual(result.result.score, { custom: true });
      for (const [key, value] of Object.entries(extensions)) assert.deepEqual(result[key], value);
      await client.close();
    }
  }
});

test("HTTP errors retain code and HTTP status, with exactly one attempt", async (t) => {
  const fixture = await httpFixture(t, (_req, res) =>
    send(
      res,
      {
        protocolVersion: 1,
        error: { code: "CATALOG_MISMATCH", message: "目录版本不符" },
      },
      409
    )
  );
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  t.after(() => client.close());
  await assert.rejects(
    client.match(match()),
    (e) => hasCode("CATALOG_MISMATCH")(e) && e.status === 409
  );
  assert.equal(fixture.requests.length, 1);
});

test("v1 validates core identity and the requested candidate scope", async (t) => {
  const malformed = [
    null,
    { protocolVersion: 2 },
    response(match(), { catalogVersion: "stale" }),
    response(match(), { requestId: "stale" }),
    response(match(), { result: { seasonId: "outside" } }),
    response(match(), { result: {} }),
  ];
  for (const body of malformed) {
    const fixture = await httpFixture(t, (_req, res) => send(res, body));
    const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
    await assert.rejects(client.match(match()), hasCode("INVALID_RESPONSE"));
    await client.close();
  }
  const fixture = await httpFixture(t, (_req, res) =>
    send(
      res,
      response(match(), {
        mode: "semantic",
        result: { seasonId: null, reason: null, score: null },
      })
    )
  );
  const client = new AnimeMatcherClient({
    endpoint: fixture.endpoint,
    semantic: false,
  });
  assert.equal((await client.match(match())).mode, "semantic");
  await client.close();
  const inferred = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  assert.equal((await inferred.match(match())).mode, "semantic");
  await inferred.close();
});

test("absolute HTTP timeout includes streaming response, without retries", async (t) => {
  const fixture = await httpFixture(t, (_req, res) => {
    res.writeHead(200);
    res.write("{");
    const tick = setInterval(() => res.write(" "), 10);
    res.on("close", () => clearInterval(tick));
  });
  const client = new AnimeMatcherClient({
    endpoint: fixture.endpoint,
    timeoutMs: 80,
  });
  await assert.rejects(client.status(), hasCode("TIMEOUT"));
  assert.equal(fixture.requests.length, 1);
  await client.close();
});

test("enforces UTF-8 request/response size limits and aborted responses", async (t) => {
  const fixture = await httpFixture(t, (_req, res, _body, n) => {
    if (n === 1) res.end("中".repeat(6 * 1024 * 1024));
    else {
      res.writeHead(200, { "content-length": 100 });
      res.write("{");
      res.socket.destroy();
    }
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  t.after(() => client.close());
  await assert.rejects(
    client.configure({ ...configure(), extra: "中".repeat(6 * 1024 * 1024) }),
    hasCode("INVALID_REQUEST")
  );
  assert.equal(fixture.requests.length, 0);
  await assert.rejects(client.status(), hasCode("INVALID_RESPONSE"));
  await assert.rejects(client.status(), hasCode("UNAVAILABLE"));
});

test("close prevents subsequent requests", async () => {
  const client = new AnimeMatcherClient();
  await client.close();
  await client.close();
  await assert.rejects(client.status(), hasCode("UNAVAILABLE"));
});

test(
  "real Python JSONL v1 round trip",
  { skip: !process.env.MATCHER_TEST_PYTHON },
  async (t) => {
    const client = new AnimeMatcherClient({
      python: process.env.MATCHER_TEST_PYTHON,
    });
    t.after(() => client.close());
    const initial = await client.status();
    assert.equal(initial.catalogVersion, null);
    const configured = await client.configure(configure());
    assert.equal(configured.modelVersion, initial.modelVersion);
    const result = await client.match(match());
    assert.equal(result.result.seasonId, "s1");
    assert.equal(
      (await client.match(match({ candidateIds: [] }))).result.seasonId,
      null
    );
    await assert.rejects(
      client.match(match({ catalogVersion: "stale" })),
      hasCode("CATALOG_MISMATCH")
    );
  }
);

test(
  "real Python JSONL v2 preserves the legacy candidate restriction",
  { skip: !process.env.MATCHER_TEST_PYTHON },
  async (t) => {
    const client = new AnimeMatcherClient({ python: process.env.MATCHER_TEST_PYTHON });
    t.after(() => client.close());
    assert.equal((await client.status(2)).protocolVersion, 2);
    await client.configure(configureV2());
    const request = matchV2();
    const result = await client.match(request);
    assert.equal(result.result.seasonId, "s1");
    const rejected = await client.match({ ...request, candidateIds: [] });
    assert.equal(rejected.result.seasonId, null);
  }
);

test(
  "real Python HTTP and JSONL return identical v1 responses",
  { skip: !process.env.MATCHER_TEST_PYTHON },
  async (t) => {
    const { spawn } = require("node:child_process");
    const { createInterface } = require("node:readline");
    const child = spawn(
      process.env.MATCHER_TEST_PYTHON,
      [
        "-u",
        "-c",
        "from lani_anime_matcher.worker import make_http_server; s=make_http_server('127.0.0.1',0); print(s.server_port,flush=True); s.serve_forever()",
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    child.stderr.resume();
    t.after(() => child.kill("SIGKILL"));
    const port = await new Promise((resolve, reject) => {
      const lines = createInterface({ input: child.stdout });
      const timer = setTimeout(
        () => reject(new Error("HTTP fixture startup timeout")),
        5000
      );
      child.once("error", (e) => {
        clearTimeout(timer);
        reject(e);
      });
      child.once("exit", () => {
        clearTimeout(timer);
        reject(new Error("HTTP fixture exited"));
      });
      lines.once("line", (line) => {
        clearTimeout(timer);
        lines.close();
        resolve(Number(line));
      });
    });
    const clients = [
      new AnimeMatcherClient({ python: process.env.MATCHER_TEST_PYTHON }),
      new AnimeMatcherClient({ endpoint: `http://127.0.0.1:${port}` }),
    ];
    t.after(() => Promise.all(clients.map((c) => c.close())));
    assert.deepEqual(await clients[0].status(), await clients[1].status());
    assert.deepEqual(
      await clients[0].configure(configure()),
      await clients[1].configure(configure())
    );
    for (const request of [match(), match({ candidateIds: [] })]) {
      assert.deepEqual(
        await clients[0].match(request),
        await clients[1].match(request)
      );
    }
    for (const client of clients)
      await assert.rejects(
        client.match(match({ catalogVersion: "stale" })),
        hasCode("CATALOG_MISMATCH")
      );
  }
);

test("rejects invalid UTF-8 even inside otherwise valid JSON", async (t) => {
  const fixture = await httpFixture(t, (_req, res) => {
    const prefix = Buffer.from(
      '{"protocolVersion":1,"catalogVersion":null,"modelVersion":"'
    );
    const suffix = Buffer.from('","mode":"lexical"}');
    res.end(Buffer.concat([prefix, Buffer.from([255]), suffix]));
  });
  const client = new AnimeMatcherClient({ endpoint: fixture.endpoint });
  await assert.rejects(client.status(), hasCode("INVALID_RESPONSE"));
  await client.close();
});
