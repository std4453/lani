import type { RequestHandler } from "express";
import http from "http";
import https from "https";

const requestHeaders = [
  "if-none-match",
  "if-modified-since",
  "if-match",
  "if-unmodified-since",
  "range",
  "if-range",
];
const responseHeaders = [
  "content-type",
  "content-length",
  "content-encoding",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "cache-control",
  "expires",
  "vary",
];

/** The bucket root must match the origin and path used by the API's S3 signer. */
export function createImageProxy(
  upstream?: string,
  timeoutMs = 30_000
): RequestHandler {
  const target = upstream ? new URL(upstream) : undefined;
  if (
    target &&
    (!["http:", "https:"].includes(target.protocol) ||
      target.username ||
      target.password ||
      target.search ||
      target.hash)
  ) {
    throw new Error(
      "imageProxy.upstream must be an HTTP(S) bucket URL without credentials, query or fragment"
    );
  }
  const basePath = target?.pathname.endsWith("/")
    ? target.pathname
    : `${target?.pathname}/`;

  return (req, res) => {
    const fail = (status: number, message: string) => {
      if (res.destroyed) return;
      if (res.headersSent) {
        res.destroy();
      } else {
        // Do not retain upstream entity headers on a locally generated error.
        for (const header of responseHeaders) res.removeHeader(header);
        res.setHeader("Cache-Control", "no-store");
        res.status(status).type("text/plain").send(message);
      }
    };
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      fail(405, "Method not allowed");
      return;
    }
    if (!target) {
      fail(503, "Image storage upstream is not configured");
      return;
    }

    // Use the raw URL instead of Express params or URLSearchParams. Re-encoding
    // the object key or signature here would break presigned S3 requests.
    const queryIndex = req.url.indexOf("?");
    const pathname = queryIndex < 0 ? req.url : req.url.slice(0, queryIndex);
    const query = queryIndex < 0 ? "" : req.url.slice(queryIndex);
    const key = pathname.slice(1);
    try {
      if (
        !pathname.startsWith("/") ||
        !key ||
        key.split("/").some((part) => {
          const decoded = decodeURIComponent(part);
          return (
            !decoded ||
            decoded === "." ||
            decoded === ".." ||
            /[\\/\u0000-\u001f\u007f]/.test(decoded)
          );
        })
      ) {
        fail(400, "Invalid image path");
        return;
      }
    } catch {
      fail(400, "Invalid image path");
      return;
    }

    const headers: http.OutgoingHttpHeaders = {};
    for (const header of requestHeaders) {
      if (req.headers[header] !== undefined)
        headers[header] = req.headers[header];
    }
    const transport = target.protocol === "https:" ? https : http;
    const upstreamRequest = transport.request(target, {
      method: req.method,
      path: `${basePath}${key}${query}`,
      headers,
    });
    let upstreamResponse: http.IncomingMessage | undefined;
    const timer = setTimeout(() => {
      fail(504, "Image storage request timed out");
      upstreamRequest.destroy();
      upstreamResponse?.destroy();
    }, timeoutMs);
    const cleanup = () => {
      clearTimeout(timer);
      upstreamRequest.destroy();
      upstreamResponse?.destroy();
    };
    res.once("close", cleanup);
    upstreamRequest.once("error", () => {
      clearTimeout(timer);
      fail(502, "Image storage request failed");
    });
    upstreamRequest.once("response", (response) => {
      upstreamResponse = response;
      const status = response.statusCode ?? 502;
      // Never follow redirects or expose a storage/CDN Location to the browser.
      if (status >= 300 && status < 400 && status !== 304) {
        fail(502, "Unexpected image storage redirect");
        cleanup();
        return;
      }
      response.once("error", () =>
        fail(502, "Image storage response interrupted")
      );
      response.once("end", () => clearTimeout(timer));
      res.status(status);
      for (const header of responseHeaders) {
        const value = response.headers[header];
        if (value !== undefined) res.setHeader(header, value);
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
      if (status >= 400) res.setHeader("Cache-Control", "no-store");
      response.pipe(res);
    });
    upstreamRequest.end();
  };
}
