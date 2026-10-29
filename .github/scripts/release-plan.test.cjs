const test = require("node:test");
const assert = require("node:assert/strict");
const {
  planImages,
  imageExists,
  imageTargets,
  splitBuildMatrix,
} = require("./release-plan.cjs");
test("matcher reuse is keyed by fingerprint and variant", async () => {
  const variants = ["lexical", "semantic-cpu", "semantic-cu126"];
  const calls = [];
  const result = await planImages(
    "Owner",
    variants.map((variant) => ({
      app: "anime-matcher",
      fingerprint: "a".repeat(64),
      variant,
    })),
    async (name, fp, _request, variant) => {
      calls.push(variant);
      return variant === "semantic-cpu";
    }
  );
  assert.deepEqual(calls, variants);
  assert.deepEqual(
    result.matrix.map((x) => x.variant),
    ["lexical", "semantic-cu126"]
  );
  assert(
    result.report.every((x) =>
      x.image.endsWith(variants[result.report.indexOf(x)])
    )
  );
});
test("registry lookup includes canonical suffix and keeps ordinary app tags", async () => {
  for (const variant of ["", "lexical", "semantic-cpu", "semantic-cu126"]) {
    let lookup;
    const request = async (url) =>
      url.includes("/token?")
        ? { ok: true, json: async () => ({ token: "test" }) }
        : ((lookup = url), { ok: true, status: 200 });
    assert(await imageExists("owner/lani-test", "fp", request, variant));
    assert(lookup.endsWith(`/manifests/fp-fp${variant ? "-" + variant : ""}`));
  }
});
test("only 404 triggers build; registry faults fail planning", async () => {
  for (const status of [404, 401, 429, 500]) {
    const request = async (url) =>
      url.includes("/token?")
        ? { ok: true, json: async () => ({ token: "test" }) }
        : { ok: false, status };
    if (status === 404)
      assert.equal(await imageExists("owner/image", "fp", request), false);
    else await assert.rejects(imageExists("owner/image", "fp", request));
  }
});

test("only application and legacy matcher images are planned", async () => {
  const images = Object.fromEntries(
    [
      "admin",
      "api-server",
      "data-server",
      "gateway",
      "db",
      "anime-matcher",
      "llm-matcher",
    ].map((app) => [app, { fingerprint: app + "-fp" }])
  );
  const targets = imageTargets({ images });
  assert(!targets.some((x) => x.app === "llm-matcher"));
  const planned = await planImages("Owner", targets, async () => false);
  assert(!planned.report.some((x) => x.app === "llm-matcher"));
  const split = splitBuildMatrix(planned.matrix);
  assert(!Object.hasOwn(split, "llmMatcherMatrix"));
  assert.deepEqual(
    split.matrix.map((x) => x.app),
    ["admin", "api-server", "data-server", "gateway", "db"]
  );
  assert.deepEqual(
    split.matcherMatrix.map((x) => x.variant),
    ["lexical", "semantic-cpu", "semantic-cu126"]
  );
});

test("registry authentication can probe a not-yet-published package", async () => {
  const calls = [];
  const request = async (url, options) => {
    calls.push({ url, options });
    return url.includes("/token?")
      ? { ok: true, json: async () => ({ token: "registry-token" }) }
      : { ok: false, status: 404 };
  };
  assert.equal(
    await imageExists("owner/new-package", "fp", request, "", {
      username: "actor",
      token: "github-token",
    }),
    false
  );
  assert.equal(
    calls[0].options.headers.Authorization,
    "Basic " + Buffer.from("actor:github-token").toString("base64")
  );
  assert.equal(calls[1].options.headers.Authorization, "Bearer registry-token");
});
