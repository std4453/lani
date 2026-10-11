// A disposable local identity provider and API. No real credentials or database writes.
const express = require("express");
const http = require("node:http");
const path = require("node:path");
const { randomBytes, createHash } = require("node:crypto");
const { generateKeyPair, exportJWK, SignJWT } = require("jose");
const { createAuth } = require("../../dist/auth-tests/index");

exports.start = async function start() {
  const servers = [];
  const listen = (app) =>
    new Promise((resolve) => {
      const server = http.createServer(app).listen(0, "127.0.0.1", () => {
        servers.push(server);
        resolve(server);
      });
    });
  const address = (server) => `http://127.0.0.1:${server.address().port}`;
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk = {
    ...(await exportJWK(publicKey)),
    kid: "local",
    alg: "RS256",
    use: "sig",
  };
  const codes = new Map();
  const state = {
    exchanges: 0,
    refreshes: 0,
    apiRequests: 0,
    lifetime: 120,
    unavailable: false,
    callbacks: [],
  };
  const idp = express();
  idp.use(express.urlencoded({ extended: false }));
  const provider = await listen(idp);
  const issuer = `${address(provider)}/public/realms/apps`;
  const backchannel = `${address(provider)}/internal/realms/apps`;
  const app = express();
  const server = await listen(app);
  const origin = address(server);
  async function jwt(audience, claims, ttl) {
    return new SignJWT({
      sub: "local-user",
      preferred_username: "Local User",
      roles: ["user"],
      ...claims,
    })
      .setProtectedHeader({ alg: "RS256", kid: "local" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
      .sign(privateKey);
  }
  idp.get("/public/realms/apps/protocol/openid-connect/auth", (req, res) => {
    const code = randomBytes(16).toString("hex");
    codes.set(code, {
      nonce: req.query.nonce,
      challenge: req.query.code_challenge,
    });
    const callback = new URL(req.query.redirect_uri);
    callback.searchParams.set("code", code);
    callback.searchParams.set("state", req.query.state);
    state.callbacks.push(callback.href);
    res.redirect(callback.href);
  });
  idp.get("/internal/realms/apps/protocol/openid-connect/certs", (_req, res) =>
    res.json({ keys: [jwk] })
  );
  idp.post(
    "/internal/realms/apps/protocol/openid-connect/token",
    async (req, res) => {
      if (state.unavailable) return res.sendStatus(503);
      let nonce;
      if (req.body.grant_type === "authorization_code") {
        const data = codes.get(req.body.code);
        codes.delete(req.body.code);
        if (
          !data ||
          data.challenge !==
            createHash("sha256")
              .update(req.body.code_verifier)
              .digest("base64url")
        )
          return res.status(400).json({ error: "invalid_grant" });
        nonce = data.nonce;
        state.exchanges++;
      } else {
        state.refreshes++;
        return res.status(400).json({ error: "unsupported_grant_type" });
      }
      const rt = randomBytes(20).toString("hex");
      const tokens = {
        access_token: await jwt("lani-api", {}, state.lifetime),
        refresh_token: rt,
        expires_in: state.lifetime,
        refresh_expires_in: 3600,
        token_type: "Bearer",
      };
      if (nonce)
        tokens.id_token = await jwt("lani-web", { nonce }, state.lifetime);
      res.json(tokens);
    }
  );
  const options = {
    authority: issuer,
    backchannelAuthority: backchannel,
    publicOrigin: origin,
    clientId: "lani-web",
    clientSecret: "local-test-secret",
    audience: "lani-api",
    scope: "openid profile",
    sessionMaxAge: 3600,
    cookieKeys: [randomBytes(32).toString("base64")],
    authz: { enabled: false },
  };
  const instances = [createAuth(options), createAuth(options)];
  let request = 0;
  app.use((req, res, next) =>
    instances[request % 2].middleware(req, res, next)
  );
  // Alternate independent gateway instances for every request.
  app.use("/api/gateway/auth", (req, res, next) =>
    instances[request++ % 2].router(req, res, next)
  );
  app.use(express.json());
  app.post("/api/gateway/graphql", async (req, res) => {
    try {
      await instances[request++ % 2].authenticate(req);
      state.apiRequests++;
      res.json({
        data: {
          config: {
            __typename: "AdminConfig",
            jellyfin: { __typename: "JellyfinConfig", publicHost: origin },
          },
          getAvailableSemesters: [],
          allJellyfinFolders: { edges: [] },
          allSeasons: {
            __typename: "SeasonsConnection",
            pageInfo: { __typename: "PageInfo", hasNextPage: false },
            totalCount: 0,
            edges: [],
          },
        },
      });
    } catch (error) {
      res.json({
        errors: [{ message: error.code, extensions: { code: error.code } }],
      });
    }
  });
  app.use(express.static(path.resolve(__dirname, "../../../admin/dist")));
  app.get("*", (_req, res) =>
    res.sendFile(path.resolve(__dirname, "../../../admin/dist/index.html"))
  );
  return {
    origin,
    state,
    close: () =>
      Promise.all(
        servers.map(
          (s) =>
            new Promise((resolve) => {
              s.close(resolve);
              s.closeAllConnections();
            })
        )
      ),
  };
};
