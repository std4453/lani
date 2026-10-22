const { test } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { waitForMatcher } = require("./wait-matcher.cjs");

test("startup gate waits for readiness and fails within its deadline", async () => {
  let ready = false;
  const server = http.createServer((_req, res) => {
    res.writeHead(ready ? 200 : 503);
    res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const endpoint = `http://127.0.0.1:${server.address().port}/v1/status`;
  try {
    await assert.rejects(waitForMatcher(endpoint, 30), /did not become ready/);
    const waiting = waitForMatcher(endpoint, 1500);
    setTimeout(() => {
      ready = true;
    }, 20);
    await waiting;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("PM2 owns the matcher separately and omits it for external workers", () => {
  const entry = require.resolve("./ecosystem.config.js");
  const previous = {
    local: process.env.LANI_LOCAL_MATCHER,
    mode: process.env.ANIME_MATCHER_MODE,
  };
  try {
    process.env.LANI_LOCAL_MATCHER = "true";
    process.env.ANIME_MATCHER_MODE = "semantic";
    delete require.cache[entry];
    const apps = require(entry);
    assert.ok(
      apps
        .find((app) => app.name === "anime-matcher")
        .args.includes("--semantic")
    );
    assert.equal(
      apps.find((app) => app.name === "api-server").script,
      "/deploy/apps/all-in-one/start-api.sh"
    );
    process.env.LANI_LOCAL_MATCHER = "false";
    delete require.cache[entry];
    assert.ok(!require(entry).some((app) => app.name === "anime-matcher"));
  } finally {
    for (const [key, value] of [
      ["LANI_LOCAL_MATCHER", previous.local],
      ["ANIME_MATCHER_MODE", previous.mode],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    delete require.cache[entry];
  }
});
