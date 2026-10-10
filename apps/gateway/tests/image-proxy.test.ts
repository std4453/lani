import assert from "assert/strict";
import http, { RequestListener, Server } from "http";
import { AddressInfo } from "net";
import express from "express";
import { createImageProxy } from "../src/image-proxy";

// The repository's Node 17 types predate the Node 20 test runner used in CI.
const test: (name: string, run: () => Promise<void> | void) => void =
  require("node:test").test;

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function close(server: Server) {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
}

function request(
  origin: string,
  path = "/storage/poster.jpg",
  method = "GET",
  headers = {}
) {
  return new Promise<{
    status: number;
    headers: http.IncomingHttpHeaders;
    body: Buffer;
  }>((resolve, reject) => {
    const req = http.request(
      origin,
      { path, method, headers, agent: false },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("error", reject);
        res.on("end", () =>
          resolve({
            status: res.statusCode!,
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        );
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function fixture(
  handler: RequestListener,
  run: (origin: string, upstream: string) => Promise<void>,
  timeoutMs = 2000,
  bucketPath = "/images/"
) {
  const storage = http.createServer(handler);
  const upstream = await listen(storage);
  const app = express();
  app.use("/storage", createImageProxy(`${upstream}${bucketPath}`, timeoutMs));
  const gateway = http.createServer(app);
  const origin = await listen(gateway);
  try {
    await run(origin, upstream);
  } finally {
    await close(gateway);
    await close(storage);
  }
}

test("missing upstream returns non-cacheable 503 without breaking other routes", async () => {
  const app = express();
  app.use("/storage", createImageProxy());
  app.get("/health", (_req, res) => res.send("ok"));
  const server = http.createServer(app);
  const origin = await listen(server);
  try {
    const result = await request(origin);
    assert.equal(result.status, 503);
    assert.equal(result.headers["cache-control"], "no-store");
    assert.equal((await request(origin, "/health")).status, 200);
  } finally {
    await close(server);
  }
});

test("preserves encoded key, raw signature, upstream Host and image bytes; strips browser credentials", async () => {
  let seen: http.IncomingMessage;
  const bytes = Buffer.from([0, 255, 1, 128]);
  await fixture(
    (req, res) => {
      seen = req;
      res.writeHead(200, {
        "Content-Type": "image/png",
        ETag: '"version-1"',
        "Cache-Control": "private, max-age=60",
        "Set-Cookie": "storage=secret",
      });
      res.end(bytes);
    },
    async (origin, upstream) => {
      const path =
        "/storage/folder/%E5%B0%81%E9%9D%A2%20%21%2B%25.png?X-Amz-Signature=a%2Fb%2B&X-Amz-Credential=x%2Fy";
      const result = await request(origin, path, "GET", {
        Authorization: "Bearer browser-token",
        Cookie: "session=browser",
        Host: "lani.example",
      });
      assert.equal(seen!.url, path.replace("/storage/", "/images/"));
      assert.equal(seen!.headers.host, new URL(upstream).host);
      assert.equal(seen!.headers.authorization, undefined);
      assert.equal(seen!.headers.cookie, undefined);
      assert.deepEqual(result.body, bytes);
      assert.equal(result.headers.etag, '"version-1"');
      assert.equal(result.headers["cache-control"], "private, max-age=60");
      assert.equal(result.headers["content-type"], "image/png");
      assert.equal(result.headers["set-cookie"], undefined);
    }
  );
});

test("supports virtual-host bucket roots, HEAD, conditional requests and byte ranges", async () => {
  await fixture(
    (req, res) => {
      assert.equal(req.url, "/poster.jpg");
      if (req.headers["if-none-match"]) {
        res.writeHead(304, { ETag: '"v1"' });
      } else if (req.headers.range) {
        assert.equal(req.headers["if-range"], '"v1"');
        res.writeHead(206, {
          "Content-Range": "bytes 0-1/4",
          "Accept-Ranges": "bytes",
        });
        res.write("ab");
      } else {
        assert.equal(req.method, "HEAD");
        res.writeHead(200, { "Content-Length": "4" });
      }
      res.end();
    },
    async (origin) => {
      const head = await request(origin, undefined, "HEAD");
      assert.equal(head.status, 200);
      assert.equal(head.body.length, 0);
      assert.equal(head.headers["content-length"], "4");
      assert.equal(
        (await request(origin, undefined, "GET", { "If-None-Match": '"v1"' }))
          .status,
        304
      );
      const range = await request(origin, undefined, "GET", {
        Range: "bytes=0-1",
        "If-Range": '"v1"',
      });
      assert.equal(range.status, 206);
      assert.equal(range.body.toString(), "ab");
      assert.equal(range.headers["content-range"], "bytes 0-1/4");
    },
    2000,
    "/"
  );
});

test("preserves storage 403/404/500 responses without caching failures or following redirects", async () => {
  await fixture(
    (req, res) => {
      const status = Number(req.url!.split("/").pop());
      res.writeHead(status, {
        "Cache-Control": "public, max-age=3600",
        Location: "https://cdn.example/image.jpg",
      });
      res.end("storage response");
    },
    async (origin) => {
      for (const status of [403, 404, 500, 302, 307]) {
        const result = await request(origin, `/storage/${status}`);
        assert.equal(result.status, status < 400 ? 502 : status);
        assert.equal(result.headers["cache-control"], "no-store");
        assert.equal(result.headers.location, undefined);
      }
    }
  );
});

test("rejects write methods and encoded traversal before contacting storage", async () => {
  let calls = 0;
  await fixture(
    (_req, res) => {
      calls++;
      res.end();
    },
    async (origin) => {
      assert.equal((await request(origin, undefined, "PUT")).status, 405);
      // Encoded slash/backslash segments cannot escape the configured bucket.
      for (const key of [
        "%2fother",
        "../other",
        "%2e%2e/other",
        "folder/./other",
        "%5cother",
        "%00",
        "%ZZ",
        "folder//image",
        "https:%2f%2fevil.example",
      ]) {
        assert.equal((await request(origin, `/storage/${key}`)).status, 400);
      }
      assert.equal(calls, 0);
    }
  );
});

test("returns 502 on connection failure and 504 on timeout", async () => {
  await fixture(
    (req) => req.socket.destroy(),
    async (origin) => {
      assert.equal((await request(origin)).status, 502);
    }
  );
  await fixture(
    () => {},
    async (origin) => {
      assert.equal((await request(origin)).status, 504);
    },
    40
  );
});

test("terminates a partially streamed response when storage disconnects", async () => {
  await fixture(
    (_req, res) => {
      res.writeHead(200, { "Content-Length": 100 });
      res.write("partial");
      setTimeout(() => res.destroy(), 20);
    },
    async (origin) => {
      await assert.rejects(request(origin), /aborted|reset/i);
    }
  );
});

test("cancels the storage request when the browser disconnects", async () => {
  let storageClosed!: () => void;
  const closed = new Promise<void>((resolve) => {
    storageClosed = resolve;
  });
  await fixture(
    (_req, res) => {
      res.on("close", storageClosed);
      res.write("partial");
    },
    async (origin) => {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(
          `${origin}/storage/poster.jpg`,
          { agent: false },
          (res) => {
            res.once("data", () => {
              res.destroy();
              resolve();
            });
          }
        );
        req.on("error", reject);
      });
      await closed;
    }
  );
});

test("validates configured storage URLs", () => {
  for (const upstream of [
    "ftp://storage/images/",
    "http://user:pass@storage/images/",
    "http://storage/images/?key=value",
    "http://storage/images/#fragment",
  ]) {
    assert.throws(() => createImageProxy(upstream), /imageProxy.upstream/);
  }
});
