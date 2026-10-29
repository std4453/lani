import { createServer, IncomingMessage } from "http";
import { Readable, Writable } from "stream";
import { Engine, settingsFromEnv } from "./engine";
import {
  candidateIds,
  catalogRows,
  CatalogRow,
  decode,
  invalid,
  MAX_BYTES,
  object,
  ProtocolError,
  queryInput,
  text,
} from "./protocol";

export { Engine, settingsFromEnv } from "./engine";
export { ProtocolError } from "./protocol";

export class Worker {
  private version: string | null = null;
  private rows: ReadonlyMap<string, CatalogRow> = new Map();

  constructor(readonly engine: Engine) {}

  private identity(version: string | null) {
    return {
      protocolVersion: 2,
      catalogVersion: version,
      modelVersion: this.engine.modelVersion,
      mode: "external_llm",
    };
  }

  status() {
    return this.identity(this.version);
  }

  async dispatch(method: unknown, request: unknown) {
    if (!object(request)) return invalid("请求必须是对象");
    if (request.protocolVersion !== 2)
      throw new ProtocolError("PROTOCOL_UNSUPPORTED", "需要协议 v2", 422);
    if (method === "status") return this.status();
    if (method !== "configure" && method !== "match")
      return invalid("未知操作");
    const version = text(request.catalogVersion, "目录版本", 256);
    if (method === "configure") {
      // 先完整校验再原子替换；在途请求保留原快照引用。
      const rows = catalogRows(request.catalog);
      if (this.version !== version) {
        this.rows = rows;
        this.version = version;
      }
      return this.identity(version);
    }
    const requestId = text(request.requestId, "请求 ID");
    const query = queryInput(request.query);
    if (this.version === null)
      throw new ProtocolError("CATALOG_MISSING", "目录缓存为空", 409);
    if (this.version !== version)
      throw new ProtocolError("CATALOG_MISMATCH", "目录版本不同", 409);
    const rows = this.rows;
    const primary = candidateIds(request.candidateIds, rows);
    try {
      const response = await this.engine.match(rows, query, primary, requestId);
      this.engine.log({
        event: "llm_match",
        requestId,
        seasonId: response.result.seasonId,
        decision: response.decision,
        elapsedMs: response.diagnostics.elapsedMs,
      });
      return { ...this.identity(version), requestId, ...response };
    } catch (error) {
      if (error instanceof ProtocolError)
        this.engine.log({ event: "llm_failure", requestId, code: error.code });
      throw error;
    }
  }
}

function failure(error: unknown) {
  if (error instanceof ProtocolError) return error;
  process.stderr.write("LLM matcher operation failed\n");
  return new ProtocolError("INTERNAL_ERROR", "匹配器内部错误", 500);
}

function readBody(request: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    request.on("data", (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > MAX_BYTES) {
        reject(new ProtocolError("INVALID_REQUEST", "请求超过 16 MiB"));
      } else chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
    request.on("aborted", () =>
      reject(new ProtocolError("INVALID_REQUEST", "请求正文不完整"))
    );
  });
}

export function makeHttpServer(worker: Worker) {
  const server = createServer(async (request, response) => {
    let status = 200;
    let result: unknown;
    try {
      const routes: Record<string, string> = {
        "GET /v2/status": "status",
        "PUT /v2/catalog": "configure",
        "POST /v2/match": "match",
      };
      const method = routes[`${request.method} ${request.url}`];
      if (!method)
        throw new ProtocolError("INVALID_REQUEST", "未找到请求路径", 404);
      let payload: unknown = { protocolVersion: 2 };
      if (method !== "status") {
        const length = request.headers["content-length"];
        if (
          !length ||
          !/^\d+$/.test(length) ||
          request.headers["transfer-encoding"]
        )
          return invalid("需要唯一有效的 Content-Length");
        if (Number(length) > MAX_BYTES) return invalid("请求超过 16 MiB");
        payload = decode(await readBody(request));
      }
      result = await worker.dispatch(method, payload);
    } catch (error) {
      const cause = failure(error);
      status = cause.status;
      result = { protocolVersion: 2, error: cause.payload() };
    }
    if (response.destroyed) return;
    const body = Buffer.from(JSON.stringify(result));
    response.writeHead(status, {
      "content-type": "application/json; charset=utf-8",
      "content-length": body.length,
      connection: "close",
    });
    response.end(body);
  });
  server.headersTimeout = 30000;
  server.requestTimeout = 30000;
  return server;
}

export async function serveJsonl(
  worker: Worker,
  input: Readable,
  output: Writable
) {
  let pending = Buffer.alloc(0);
  let oversized = false;
  const line = async () => {
    let id: number | null = null;
    let response: unknown;
    try {
      if (oversized) return invalid("请求超过 16 MiB");
      const request = decode(pending);
      if (!object(request) || !Number.isSafeInteger(request.id))
        return invalid("id 必须是安全整数");
      id = request.id as number;
      response = { id, result: await worker.dispatch(request.method, request) };
    } catch (error) {
      response = { id, error: failure(error).payload() };
    }
    await new Promise<void>((resolve, reject) =>
      output.write(JSON.stringify(response) + "\n", (error) =>
        error ? reject(error) : resolve()
      )
    );
    pending = Buffer.alloc(0);
    oversized = false;
  };
  for await (const value of input) {
    const chunk = Buffer.isBuffer(value) ? value : Buffer.from(value);
    let offset = 0;
    while (offset < chunk.length) {
      const end = chunk.indexOf(10, offset);
      const part = chunk.subarray(offset, end === -1 ? chunk.length : end);
      if (!oversized) {
        if (pending.length + part.length + 1 > MAX_BYTES) {
          oversized = true;
          pending = Buffer.alloc(0);
        } else pending = Buffer.concat([pending, part]);
      }
      if (end === -1) break;
      await line();
      offset = end + 1;
    }
  }
  if (pending.length || oversized) await line();
}

async function main() {
  let worker: Worker;
  try {
    worker = new Worker(new Engine(settingsFromEnv()));
  } catch {
    throw new Error(
      "Invalid LLM configuration; check LANI_LLM_MATCHER_* settings"
    );
  }
  const args = process.argv.slice(2);
  let http = false;
  let host = "127.0.0.1";
  let port = 8090;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--http") http = true;
    else if (args[i] === "--host" && args[i + 1]) host = args[++i];
    else if (args[i] === "--port" && /^\d+$/.test(args[i + 1] ?? ""))
      port = Number(args[++i]);
    else
      throw new Error(
        "Usage: node dist/index.js [--http] [--host HOST] [--port PORT]"
      );
  }
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error("Invalid HTTP port");
  if (http) {
    const server = makeHttpServer(worker);
    server.on("error", () => {
      process.stderr.write("LLM matcher HTTP server failed\n");
      process.exitCode = 1;
    });
    server.listen(port, host);
    process.once("SIGTERM", () => server.close());
    process.once("SIGINT", () => server.close());
  } else await serveJsonl(worker, process.stdin, process.stdout);
}

if (require.main === module)
  main().catch((error: unknown) => {
    process.stderr.write(
      (error instanceof Error ? error.message : "LLM matcher failed") + "\n"
    );
    process.exitCode = 1;
  });
