import assert from "assert/strict";
import http, { RequestListener, Server } from "http";
import { AddressInfo } from "net";
import { randomBytes } from "crypto";
import express, { Request } from "express";
import {
  generateKeyPair,
  exportJWK,
  SignJWT,
  compactDecrypt,
  KeyLike,
  JWTPayload,
} from "jose";
import { createAuth, safeReturnTo, AuthOptions, AuthError } from "../src/auth";

// Match the existing tests: Node 17 types predate the runtime's test/fetch APIs.
type Run = () => Promise<void> | void;
const {
  test,
  before,
  after,
}: {
  test: (name: string, run: Run) => void;
  before: (run: Run) => void;
  after: (run: Run) => void;
} = require("node:test");
type TestServer = Server & { closeAllConnections(): void };
type TestResponse = Response & {
  headers: Headers & { getSetCookie(): string[] };
};

let provider: TestServer, server: TestServer, replica: TestServer;
let base: string, issuer: string;
let privateKey: KeyLike, publicKey: KeyLike;
let options: AuthOptions;
let tokenRequests = 0,
  discoveryRequests = 0,
  jwksRequests = 0,
  unavailable = false;
let lifetime = 300,
  idLifetime = 300,
  roles = ["user"];
let idClaims: JWTPayload = {};
const accessClaims: JWTPayload = {};
const codes = new Map<
  string,
  { nonce: string | null; challenge: string | null }
>();
const key = randomBytes(32).toString("base64");
const listen = (app: RequestListener) =>
  new Promise<TestServer>((resolve) => {
    const server = http
      .createServer(app)
      .listen(0, "127.0.0.1", () => resolve(server as TestServer));
  });
const address = (server: Server) =>
  `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
async function token(
  claims: JWTPayload = {},
  ttl = lifetime,
  audience = "lani-api"
) {
  return new SignJWT({ sub: "alice", roles, ...claims })
    .setProtectedHeader({ alg: "RS256", kid: "test-key" })
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
    .sign(privateKey);
}
async function tokenSet(nonce: string | null) {
  const rt = randomBytes(20).toString("hex");
  return {
    access_token: await token(accessClaims),
    refresh_token: rt,
    refresh_expires_in: 3600,
    expires_in: lifetime,
    token_type: "Bearer",
    id_token: await token(
      { nonce, preferred_username: "Alice", ...idClaims },
      idLifetime,
      "lani-web"
    ),
  };
}
// HTTP client with a cookie jar; no browser process is involved.
class CookieClient {
  target?: string;
  cookies = new Map<string, string>();
  header() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  async request(
    path: string,
    init: RequestInit = {},
    target = this.target || base
  ) {
    const response = (await fetch(`${target}${path}`, {
      ...init,
      redirect: "manual",
      headers: { cookie: this.header(), ...init.headers },
    })) as TestResponse;
    for (const item of response.headers.getSetCookie()) {
      const pair = item.split(";")[0],
        at = pair.indexOf("=");
      if (!pair.slice(at + 1)) this.cookies.delete(pair.slice(0, at));
      else this.cookies.set(pair.slice(0, at), pair.slice(at + 1));
    }
    return response;
  }
  post(path: string, target?: string) {
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
      res.status(e instanceof AuthError ? e.status : 500).json({
        error: e instanceof AuthError ? e.code : "TEST_FAILURE",
      });
    }
  });
  return { app, instance };
}
async function login(
  browser = new CookieClient(),
  returnTo = "/seasons?q=test#list",
  expected = { status: 302, location: returnTo }
) {
  const start = await browser.request(
    `/api/gateway/auth/login?returnTo=${encodeURIComponent(returnTo)}`
  );
  assert.equal(start.status, 302);
  const url = new URL(start.headers.get("location")!);
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
  assert.equal(response.status, expected.status);
  assert.equal(response.headers.get("location"), expected.location);
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
      assert.equal(req.headers.authorization, undefined);
      assert.equal(req.body.client_id, "lani-web");
      assert.equal(req.body.client_secret, "secret");
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
        res.status(400).json({ error: "unsupported_grant_type" });
      }
    }
  );
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
  placeholder.use(built.app);
  replica = await listen(gateway().app);
});
after(async () => {
  await Promise.all(
    [provider, server, replica].map(
      (s) =>
        new Promise<void>((resolve) => {
          s.close(() => resolve());
          s.closeAllConnections();
        })
    )
  );
});

test("startup and anonymous session need no discovery or JWKS", async () => {
  assert.equal(discoveryRequests, 0);
  assert.equal(jwksRequests, 0);
  const response = await new CookieClient().request("/api/gateway/auth/session");
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
  const response = await new CookieClient().request(callback);
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
      await browser.request("/api/gateway/auth/logout", {
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
      await new CookieClient().request("/graphql", {
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
        await new CookieClient().request("/graphql", {
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
      await new CookieClient().request("/graphql", {
        method: "POST",
        headers: { authorization: `Bearer ${forbidden}` },
      })
    ).status,
    403
  );
});

test("expired provider tokens and accounts outage do not affect a session, even on a cold replica", async () => {
  lifetime = idLifetime = 1;
  const { browser, callback } = await login();
  lifetime = idLifetime = 300;
  const cookie = browser.header();
  const requests = [tokenRequests, jwksRequests];
  unavailable = true;
  const cold = await listen(gateway().app);
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    for (const target of [base, address(cold)]) {
      const info = await (
        await browser.request("/api/gateway/auth/session", {}, target)
      ).json();
      assert.equal(info.authenticated, true);
      assert.ok(info.expiresAt > Date.now() / 1000 + 3500);
      assert.equal(info.refreshRequired, undefined);
      assert.equal((await browser.post("/graphql", target)).status, 200);
      assert.equal((await browser.request(callback, {}, target)).status, 303);
    }
    assert.equal(browser.header(), cookie);
    assert.deepEqual([tokenRequests, jwksRequests], requests);
    assert.equal((await browser.post("/api/gateway/auth/refresh")).status, 404);
  } finally {
    unavailable = false;
    await new Promise<void>((resolve) => cold.close(() => resolve()));
  }
});

test("fixed session expiry rejects access and cannot be extended by activity", async () => {
  const short = await listen(gateway({ ...options, sessionMaxAge: 1 }).app);
  const browser = new CookieClient();
  browser.target = address(short);
  try {
    await login(browser);
    const first = await (
      await browser.request("/api/gateway/auth/session")
    ).json();
    const read = await browser.post("/graphql");
    assert.equal(read.status, 200);
    assert.equal(read.headers.get("set-cookie"), null);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    assert.equal(
      (await (await browser.request("/api/gateway/auth/session")).json())
        .authenticated,
      false
    );
    assert.equal((await browser.post("/graphql")).status, 401);
    assert.ok(first.expiresAt <= Date.now() / 1000);
    assert.equal(
      (await browser.request("/api/gateway/auth/login")).status,
      302
    );
  } finally {
    await new Promise<void>((resolve) => short.close(() => resolve()));
  }
});

test("login checks authorization and token identity before issuing a session", async () => {
  for (const failure of ["permissions", "audience", "expiry", "identity"]) {
    const browser = new CookieClient();
    try {
      if (failure === "permissions") roles = [];
      if (failure === "audience") options.audience = "wrong-api";
      if (failure === "expiry") lifetime = -1;
      if (failure === "identity") idClaims = { sub: "someone-else" };
      // Each instance snapshots configuration, including the audience.
      const isolated = await listen(gateway().app);
      browser.target = address(isolated);
      try {
        await login(browser, "/", {
          status: 303,
          location: "/?auth_error=login_failed",
        });
        assert.equal(
          (await (await browser.request("/api/gateway/auth/session")).json())
            .authenticated,
          false
        );
        assert.equal((await browser.post("/graphql")).status, 401);
        assert.ok(!browser.cookies.has("lani-local-gateway"));
      } finally {
        await new Promise<void>((resolve) => isolated.close(() => resolve()));
      }
    } finally {
      roles = ["user"];
      options.audience = "lani-api";
      lifetime = 300;
      idClaims = {};
    }
  }
});

test("issued session keeps its authorization snapshot; new login and Bearer enforce current claims", async () => {
  const { browser } = await login();
  roles = [];
  try {
    assert.equal((await browser.post("/graphql")).status, 200);
    await login(new CookieClient(), "/", {
      status: 303,
      location: "/?auth_error=login_failed",
    });
    const denied = await browser.request("/graphql", {
      method: "POST",
      headers: { authorization: `Bearer ${await token()}` },
    });
    assert.equal(denied.status, 403);
  } finally {
    roles = ["user"];
  }
});

test("logout removes local credentials and cannot silently restore them", async () => {
  const { browser } = await login();
  const requests = tokenRequests;
  unavailable = true;
  let response;
  try {
    response = await browser.post("/api/gateway/auth/logout");
  } finally {
    unavailable = false;
  }
  assert.equal(tokenRequests, requests);
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
  ] as [string[], boolean][]) {
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
      await new Promise<void>((resolve) => rotated.close(() => resolve()));
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
      cold.authenticate({
        headers: { authorization: `Bearer ${jwt}` },
      } as Request),
      (error: unknown) => error instanceof AuthError && error.status === 503
    );
    const response = await new CookieClient().request("/api/gateway/auth/session");
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
    const start = await new CookieClient().request(
      "/api/gateway/auth/login",
      {},
      address(secure)
    );
    const cookie = start.headers.get("set-cookie")!;
    assert.ok(cookie.startsWith("__Host-lani-gateway-login="));
    for (const attr of ["Secure", "HttpOnly", "SameSite=Lax", "Path=/"])
      assert.ok(cookie.includes(attr));
    assert.ok(!cookie.includes("Domain="));
  } finally {
    await new Promise<void>((resolve) => secure.close(() => resolve()));
  }
  idClaims = { name: "x".repeat(6000) };
  const browser = new CookieClient();
  try {
    const start = await browser.request("/api/gateway/auth/login");
    const url = new URL(start.headers.get("location")!);
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
    idClaims = {};
  }
});

test("session contains no provider tokens and reads cannot restore a logged-out cookie", async () => {
  const { browser } = await login();
  const { getKeyStore } = require("express-openid-connect/lib/crypto");
  const [encryptionKey] = getKeyStore([key], true);
  const { plaintext } = await compactDecrypt(
    browser.cookies.get("lani-local-gateway")!,
    encryptionKey
  );
  const stored = JSON.parse(new TextDecoder().decode(plaintext));
  assert.deepEqual(Object.keys(stored).sort(), [
    "authorized",
    "expiresAt",
    "profile",
    "sub",
  ]);
  const stale = new CookieClient();
  stale.cookies = new Map(browser.cookies);
  await browser.post("/api/gateway/auth/logout");
  for (const response of [
    await stale.request("/api/gateway/auth/session"),
    await stale.post("/graphql"),
  ]) {
    assert.equal(response.headers.get("set-cookie"), null);
  }
  assert.equal((await browser.post("/graphql")).status, 401);
});

test("mismatched nonce is rejected and large provider claims do not bloat session cookies", async () => {
  const browser = new CookieClient();
  const start = await browser.request("/api/gateway/auth/login");
  const url = new URL(start.headers.get("location")!);
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
  roles = ["user", "x".repeat(6000)];
  try {
    const { browser: chunked } = await login();
    assert.ok(chunked.cookies.has("lani-local-gateway"));
    assert.ok(!chunked.cookies.has("lani-local-gateway.1"));
    assert.ok(chunked.header().length < 1000);
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
