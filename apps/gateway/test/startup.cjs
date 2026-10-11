// Run after the normal gateway build; starts only disposable loopback servers.
const { spawn } = require("node:child_process");
const { mkdtempSync, writeFileSync, rmSync } = require("node:fs");
const { tmpdir } = require("node:os");
const path = require("node:path");
const http = require("node:http");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");

(async () => {
  const subgraph = http.createServer((_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        data: { _service: { sdl: "type Query { ping: String }" } },
      })
    );
  });
  await new Promise((resolve) => subgraph.listen(0, "127.0.0.1", resolve));
  const dir = mkdtempSync(path.join(tmpdir(), "lani-auth-startup-"));
  try {
    for (const enabled of [true, false]) {
      const portReservation = http.createServer();
      await new Promise((resolve) =>
        portReservation.listen(0, "127.0.0.1", resolve)
      );
      const port = portReservation.address().port;
      await new Promise((resolve) => portReservation.close(resolve));
      const origin = `http://127.0.0.1:${port}`;
      const config = {
        subgraphs: [
          {
            name: "local",
            url: `http://127.0.0.1:${subgraph.address().port}/graphql`,
          },
        ],
        auth: enabled
          ? {
              enabled: true,
              authority: "http://127.0.0.1:1/auth/realms/unavailable",
              backchannelAuthority:
                "http://127.0.0.1:1/auth/realms/unavailable",
              publicOrigin: origin,
              clientId: "local",
              audience: "local-api",
              clientSecret: "local-secret",
              cookieKeys: [randomBytes(32).toString("base64")],
            }
          : { enabled: false },
      };
      const filename = path.join(dir, "config.json");
      writeFileSync(filename, JSON.stringify(config));
      const child = spawn(
        process.execPath,
        [path.resolve(__dirname, "../dist/index.js")],
        {
          cwd: path.resolve(__dirname, ".."),
          env: {
            ...process.env,
            CONFIG_FILENAME: filename,
            PORT: String(port),
          },
          stdio: ["ignore", "pipe", "pipe"],
        }
      );
      try {
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(
            () => reject(new Error("gateway startup timed out")),
            15000
          );
          child.once("exit", (code) => {
            clearTimeout(timeout);
            reject(new Error(`gateway exited ${code}`));
          });
          child.stdout.on("data", (data) => {
            if (data.toString().includes("Server ready")) {
              clearTimeout(timeout);
              resolve();
            }
          });
          child.stderr.on("data", (data) => process.stderr.write(data));
        });
        const session = await (await fetch(`${origin}/auth/session`)).json();
        assert.equal(session.enabled, enabled);
        assert.equal(session.authenticated, !enabled);
        const publicConfig = await (
          await fetch(`${origin}/auth_config`)
        ).json();
        assert.deepEqual(publicConfig, {
          enabled,
          mode: "cookie",
          testRoutingEnabled: false,
        });
        if (enabled) {
          const result = await (
            await fetch(`${origin}/graphql`, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                origin,
                "x-lani-csrf": "1",
              },
              body: JSON.stringify({ query: "{ ping }" }),
            })
          ).json();
          assert.equal(result.errors[0].extensions.code, "UNAUTHENTICATED");
        }
        console.log(
          `PASS real gateway startup: auth ${
            enabled ? "enabled with unreachable Keycloak" : "disabled"
          }`
        );
      } finally {
        child.kill("SIGTERM");
        await new Promise((resolve) => child.once("close", resolve));
      }
    }
  } finally {
    subgraph.closeAllConnections();
    await new Promise((resolve) => subgraph.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
