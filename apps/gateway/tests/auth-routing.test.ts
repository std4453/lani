import assert from "assert/strict";
import http from "http";
import { AddressInfo } from "net";
import { randomBytes } from "crypto";
import express from "express";
import { createAuth } from "../src/auth";

const test: (name: string, run: () => Promise<void>) => void =
  require("node:test").test;

test("cookie session preserves the test-routing feature flag without exposing OIDC configuration", async () => {
  for (const enabled of [true, false]) {
    const app = express();
    const auth = createAuth({
      authority: "http://127.0.0.1:1/realms/test",
      backchannelAuthority: "http://127.0.0.1:1/realms/test",
      publicOrigin: "http://localhost:8000",
      clientId: "local",
      clientSecret: "local-secret",
      audience: "api",
      cookieKeys: [randomBytes(32).toString("base64")],
      scope: "openid",
      sessionMaxAge: 3600,
      testRoutingEnabled: enabled,
    });
    app.use(auth.middleware);
    app.use("/auth", auth.router);
    const server = http.createServer(app);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve)
    );
    try {
      const body = await new Promise<string>((resolve, reject) => {
        http
          .get(
            `http://127.0.0.1:${
              (server.address() as AddressInfo).port
            }/auth/session`,
            { agent: false },
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => resolve(data));
              res.on("error", reject);
            }
          )
          .on("error", reject);
      });
      // SDK callback errors use its middleware's next(), which must still clean
      // the browser URL instead of falling through to Express's error page.
      const callback = await new Promise<http.IncomingMessage>(
        (resolve, reject) => {
          http
            .get(
              `http://127.0.0.1:${
                (server.address() as AddressInfo).port
              }/auth/callback?code=used&state=copied`,
              { agent: false },
              resolve
            )
            .on("error", reject);
        }
      );
      callback.resume();
      assert.equal(callback.statusCode, 303);
      assert.equal(callback.headers.location, "/?auth_error=login_failed");
      assert.equal(callback.headers["cache-control"], "no-store");
      const result = JSON.parse(body);
      assert.equal(result.testRoutingEnabled, enabled);
      assert.equal(result.authenticated, false);
      assert.equal(result.clientSecret, undefined);
      assert.equal(result.authority, undefined);
      assert.equal(result.cookieKeys, undefined);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }
});
