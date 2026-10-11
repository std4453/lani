const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { randomBytes } = require("node:crypto");
const express = require("express");
const { generateKeyPair, exportJWK, SignJWT } = require("jose");
const { createAuth, safeReturnTo } = require("../dist/auth-tests/index");

let provider,
  server,
  replica,
  base,
  issuer,
  privateKey,
  publicKey,
  options,
  auth;
let tokenRequests = 0,
  discoveryRequests = 0,
  jwksRequests = 0,
  unavailable = false;
let lifetime = 300,
  refreshLifetime = 3600,
  roles = ["user"];
const codes = new Map(),
  refreshTokens = new Map();
const key = randomBytes(32).toString("base64");
const listen = (app) =>
  new Promise((resolve) => {
    const server = http
      .createServer(app)
      .listen(0, "127.0.0.1", () => resolve(server));
  });
const address = (server) => `http://127.0.0.1:${server.address().port}`;
async function token(claims = {}, ttl = lifetime, audience = "lani-api") {
  return new SignJWT({ sub: "alice", roles, ...claims })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
    .sign(privateKey);
}
async function tokenSet(nonce) {
  const rt = randomBytes(20).toString("hex");
  refreshTokens.set(rt, true);
  return {
    access_token: await token(),
    refresh_token: rt,
    refresh_expires_in: refreshLifetime,
    expires_in: lifetime,
    token_type: "Bearer",
    id_token: await token(
      { nonce, preferred_username: "Alice" },
      300,
      "lani-web"
    ),
  };
}
class Browser {
  cookies = new Map();
  header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async request(path, init = {}, target = base) {
    const response = await fetch(`${target}${path}`, {
      ...init,
      redirect: "manual",
      headers: { cookie: this.header(), ...init.headers },
    });
    for (const item of response.headers.getSetCookie()) {
      const pair = item.split(";")[0],
        at = pair.indexOf("=");
      if (!pair.slice(at + 1)) this.cookies.delete(pair.slice(0, at));
      else this.cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
    return response;
  }
  post(path, target) {
    return this.request(
      path,
      { method: "POST", headers: { origin: base, "x-lani-csrf": "1" } },
      target
    );
  }
}
function gateway(config = options) {
  const app = express();
  const instance = createAuth(config);
  app.use(instance.middleware);
  app.use("/api/gateway/auth", instance.router);
  app.post("/graphql", async (req, res) => {
    try {
      const claims = await instance.authenticate(req);
      res.json({ sub: claims.sub });
    } catch (e) {
      res.status(e.status || 500).json({ error: e.code });
    }
  });
  return { app, instance };
}
async function login(
  browser = new Browser(),
  returnTo = "/seasons?q=test#list"
) {
  const start = await browser.request(
    `/api/gateway/auth/login?returnTo=${encodeURIComponent(returnTo)}`
  );
  assert.equal(start.status, 302);
  const url = new URL(start.headers.get("location"));
  assert.equal(url.origin, new URL(issuer).origin);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  const code = randomBytes(12).toString("hex");
  codes.set(code, {
    nonce: url.searchParams.get("nonce"),
    challenge: url.searchParams.get("code_challenge"),
  });
  const callback = `/api/gateway/auth/callback?code=${code}&state=${url.searchParams.get(
    "state"
  )}`;
  const response = await browser.request(callback);
  assert.equal(response.status, 302);
  assert.equal(response.headers.get("location"), returnTo);
  return { browser, callback, response };
}

before(async () => {
  ({ privateKey, publicKey } = await generateKeyPair("RS256"));
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: "test-key",
    alg: "RS256",
    use: "sig",
  };
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.get("/auth/realms/apps/.well-known/openid-configuration", (_req, res) => {
    discoveryRequests++;
    res.sendStatus(503);
  });
  app.get("/auth/realms/apps/protocol/openid-connect/certs", (_req, res) => {
    jwksRequests++;
    unavailable ? res.sendStatus(503) : res.json({ keys: [jwk] });
  });
  app.post(
    "/auth/realms/apps/protocol/openid-connect/token",
    async (req, res) => {
      tokenRequests++;
      if (unavailable) return res.sendStatus(503);
      assert.equal(
        decodeURIComponent(
          Buffer.from(req.headers.authorization.slice(6), "base64").toString()
        ),
        "lani-web:secret"
      );
      if (req.body.grant_type === "authorization_code") {
        const data = codes.get(req.body.code);
        codes.delete(req.body.code);
        if (!data) return res.status(400).json({ error: "invalid_grant" });
        const challenge = require("crypto")
          .createHash("sha256")
          .update(req.body.code_verifier)
          .digest("base64url");
        assert.equal(challenge, data.challenge);
        assert.equal(
          req.body.redirect_uri,
          `${base}/api/gateway/auth/callback`
        );
        res.json(await tokenSet(data.nonce));
      } else {
        if (!refreshTokens.delete(req.body.refresh_token))
          return res.status(400).json({ error: "invalid_grant" });
        const data = await tokenSet();
        delete data.id_token;
        res.json(data);
      }
    }
  );
  app.post("/auth/realms/apps/protocol/openid-connect/revoke", (req, res) => {
    refreshTokens.delete(req.body.token);
    res.sendStatus(200);
  });
  provider = await listen(app);
  issuer = `${address(provider)}/auth/realms/apps`;
  // Reserve the public origin before installing auth routes.
  const placeholder = express();
  server = await listen(placeholder);
  base = address(server);
  options = {
    authority: issuer,
    backchannelAuthority: issuer,
    publicOrigin: base,
    clientId: "lani-web",
    clientSecret: "secret",
    audience: "lani-api",
    scope: "openid profile",
    sessionMaxAge: 3600,
    cookieKeys: [key],
    authz: { enabled: true, query: "contains(roles, 'user')", result: true },
  };
  const built = gateway();
  auth = built.instance;
  placeholder.use(built.app);
  replica = await listen(gateway().app);
});
after(async () => {
  await Promise.all(
    [provider, server, replica].map(
      (s) =>
        new Promise((resolve) => {
          s.close(resolve);
          s.closeAllConnections();
        })
    )
  );
});

test("startup and anonymous session need no discovery or JWKS", async () => {
  assert.equal(discoveryRequests, 0);
  assert.equal(jwksRequests, 0);
  const response = await new Browser().request("/api/gateway/auth/session");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).authenticated, false);
  assert.equal(jwksRequests, 0);
});

test("login, clean redirect, encrypted cookie and cross-replica recovery", async () => {
  const { browser, response } = await login();
  assert.ok(
    response.headers
      .getSetCookie()
      .filter((c) => !c.split(";")[0].endsWith("="))
      .every((c) => c.includes("HttpOnly") && c.includes("SameSite=Lax"))
  );
  assert.ok(!browser.header().includes("Alice"));
  const session = await (
    await browser.request("/api/gateway/auth/session", {}, address(replica))
  ).json();
  assert.equal(session.profile.preferred_username, "Alice");
  assert.equal(session.authenticated, true);
  assert.equal(session.authorized, true);
  assert.equal(session.access_token, undefined);
  assert.equal(session.refresh_token, undefined);
  assert.equal((await browser.post("/graphql", address(replica))).status, 200);
  assert.equal(discoveryRequests, 0);
});

test("refreshing an already-consumed callback does not exchange code again", async () => {
  const { browser, callback } = await login();
  const before = tokenRequests;
  const repeated = await browser.request(callback);
  assert.equal(repeated.status, 303);
  assert.equal(repeated.headers.get("location"), "/");
  assert.equal(tokenRequests, before);
});

test("missing state and copied callback cannot log another browser in", async () => {
  const { callback } = await login();
  const response = await new Browser().request(callback);
  assert.equal(response.headers.get("location"), "/?auth_error=login_failed");
});

test("cookie requests reject CSRF; bearer API clients remain supported", async () => {
  const { browser } = await login();
  assert.equal(
    (await browser.request("/graphql", { method: "POST" })).status,
    403
  );
  assert.equal(
    (
      await browser.request("/api/gateway/auth/refresh", {
        method: "POST",
        headers: { origin: "https://evil.example", "x-lani-csrf": "1" },
      })
    ).status,
    403
  );
  assert.equal(
    (
      await browser.request("/api/gateway/auth/logout", {
        method: "POST",
        headers: { origin: base },
      })
    ).status,
    403
  );
  assert.equal(
    (
      await new Browser().request("/graphql", {
        method: "POST",
        headers: { authorization: `Bearer ${await token()}` },
      })
    ).status,
    200
  );
});

test("audience, expiry, signature and permissions are enforced", async () => {
  for (const jwt of [
    await token({}, 300, "wrong-api"),
    await token({}, -1),
    `${await token()}broken`,
  ]) {
    assert.equal(
      (
        await new Browser().request("/graphql", {
          method: "POST",
          headers: { authorization: `Bearer ${jwt}` },
        })
      ).status,
      401
    );
  }
  const forbidden = await token({ roles: [] });
  assert.equal(
    (
      await new Browser().request("/graphql", {
        method: "POST",
        headers: { authorization: `Bearer ${forbidden}` },
      })
    ).status,
    403
  );
});

test("refresh rotates cookie once; following requests on another replica reuse it", async () => {
  lifetime = 10;
  const { browser } = await login();
  lifetime = 300;
  const before = tokenRequests;
  assert.equal(
    (await (await browser.request("/api/gateway/auth/session")).json())
      .refreshRequired,
    true
  );
  assert.equal((await browser.post("/api/gateway/auth/refresh")).status, 200);
  assert.equal(
    (await browser.post("/api/gateway/auth/refresh", address(replica))).status,
    200
  );
  assert.equal(tokenRequests, before + 1);
});

test("accounts outage keeps valid sessions usable and preserves refresh cookie for retry", async () => {
  const valid = await login();
  lifetime = 10;
  const expiring = await login();
  lifetime = 300;
  unavailable = true;
  try {
    assert.equal((await valid.browser.post("/graphql")).status, 200);
    const cookie = expiring.browser.header();
    const result = await expiring.browser.post("/api/gateway/auth/refresh");
    assert.equal(result.status, 503);
    assert.equal(expiring.browser.header(), cookie);
  } finally {
    unavailable = false;
  }
  assert.equal(
    (await expiring.browser.post("/api/gateway/auth/refresh")).status,
    200
  );
});

test("logout removes local credentials and cannot silently restore them", async () => {
  const { browser } = await login();
  const response = await browser.post("/api/gateway/auth/logout");
  assert.equal((await response.json()).redirectTo, "/?signed_out=1");
  assert.equal(
    (await (await browser.request("/api/gateway/auth/session")).json())
      .authenticated,
    false
  );
});

test("tampering and key rotation", async () => {
  const { browser } = await login();
  for (const [cookieKeys, expected] of [
    [[randomBytes(32).toString("base64"), key], true],
    [[randomBytes(32).toString("base64")], false],
  ]) {
    const rotated = await listen(gateway({ ...options, cookieKeys }).app);
    try {
      const response = await browser.request(
        "/api/gateway/auth/session",
        {},
        address(rotated)
      );
      assert.equal((await response.json()).authenticated, expected);
      assert.equal(response.headers.get("set-cookie"), null);
    } finally {
      await new Promise((resolve) => rotated.close(resolve));
    }
  }
  for (const [name, value] of browser.cookies)
    browser.cookies.set(name, value.slice(0, 25) + "x" + value.slice(26));
  assert.equal(
    (await (await browser.request("/api/gateway/auth/session")).json())
      .authenticated,
    false
  );
});

test("return paths cannot escape origin or lead into auth endpoints", () => {
  for (const value of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/api/gateway/auth/login",
    "/redirect?code=used",
  ])
    assert.equal(safeReturnTo(value, base), "/");
  assert.equal(
    safeReturnTo("/seasons?q=1&code=used&state=used#list", base),
    "/seasons?q=1#list"
  );
});

test("cold JWKS outage fails closed without taking down session endpoint", async () => {
  const cold = createAuth(options);
  const jwt = await token();
  unavailable = true;
  try {
    await assert.rejects(
      cold.authenticate({ headers: { authorization: `Bearer ${jwt}` } }),
      (error) => error.status === 503
    );
    const response = await new Browser().request("/api/gateway/auth/session");
    assert.equal(response.status, 200);
  } finally {
    unavailable = false;
  }
});

test("HTTPS login cookies are host-only and oversized sessions fail closed", async () => {
  const secure = await listen(
    gateway({ ...options, publicOrigin: "https://lani.example" }).app
  );
  try {
    const start = await new Browser().request(
      "/api/gateway/auth/login",
      {},
      address(secure)
    );
    const cookie = start.headers.get("set-cookie");
    assert.ok(cookie.startsWith("__Host-lani-oidc-login="));
    for (const attr of ["Secure", "HttpOnly", "SameSite=Lax", "Path=/"])
      assert.ok(cookie.includes(attr));
    assert.ok(!cookie.includes("Domain="));
  } finally {
    await new Promise((resolve) => secure.close(resolve));
  }
  roles = ["user", "x".repeat(6000)];
  const browser = new Browser();
  try {
    const start = await browser.request("/api/gateway/auth/login");
    const url = new URL(start.headers.get("location"));
    codes.set("oversized", {
      nonce: url.searchParams.get("nonce"),
      challenge: url.searchParams.get("code_challenge"),
    });
    const response = await browser.request(
      `/api/gateway/auth/callback?code=oversized&state=${url.searchParams.get(
        "state"
      )}`
    );
    assert.equal(response.headers.get("location"), "/?auth_error=login_failed");
    assert.equal(browser.cookies.size, 0);
  } finally {
    roles = ["user"];
  }
});

test("refresh preserves the absolute cookie expiry; ordinary reads never overwrite rotated tokens", async () => {
  lifetime = 10;
  const { browser, response } = await login();
  lifetime = 300;
  const expiry = (res) =>
    res.headers
      .getSetCookie()
      .find((c) => c.startsWith("lani-local-oidc="))
      ?.match(/Expires=([^;]+)/)[1];
  const original = browser.header();
  const stale = new Browser();
  stale.cookies = new Map(browser.cookies);
  const refreshed = await browser.post("/api/gateway/auth/refresh");
  assert.equal(expiry(refreshed), expiry(response));
  assert.notEqual(browser.header(), original);
  for (const res of [
    await stale.request("/api/gateway/auth/session"),
    await stale.post("/graphql"),
    await stale.post("/api/gateway/auth/refresh"),
  ])
    assert.equal(res.headers.get("set-cookie"), null);
  const rejected = await stale.post("/api/gateway/auth/refresh");
  assert.equal(rejected.status, 401);
  assert.equal((await browser.post("/graphql")).status, 200);
});

test("mismatched nonce is rejected and chunked sessions survive a replica change", async () => {
  const browser = new Browser();
  const start = await browser.request("/api/gateway/auth/login");
  const url = new URL(start.headers.get("location"));
  codes.set("wrong-nonce", {
    nonce: "wrong",
    challenge: url.searchParams.get("code_challenge"),
  });
  const failed = await browser.request(
    `/api/gateway/auth/callback?code=wrong-nonce&state=${url.searchParams.get(
      "state"
    )}`
  );
  assert.equal(failed.headers.get("location"), "/?auth_error=login_failed");
  assert.equal(browser.cookies.size, 0);
  roles = ["user", "x".repeat(800)];
  try {
    const { browser: chunked } = await login();
    assert.ok(chunked.cookies.has("lani-local-oidc.1"));
    assert.ok(
      [...chunked.cookies.values()].every((value) => value.length < 4096)
    );
    assert.equal(
      (await chunked.post("/graphql", address(replica))).status,
      200
    );
  } finally {
    roles = ["user"];
  }
});
