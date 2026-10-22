import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import * as http from "node:http";
import * as https from "node:https";
import { TextDecoder } from "node:util";

export interface CatalogSeason {
  id: string;
  title: string;
  aliases: string[];
  year: number | null;
  quarter: 1 | 2 | 3 | 4 | null;
  /** 作品级静态总集数；未知时省略或 null，不随每集更新。 */
  declaredEpisodeCount?: number | null;
  episodes?: { number: number; airDate: string }[];
}

export interface MatchQuery {
  aliases: string[];
  publishedAt: string;
  episode?: number;
  /** 发布者标题中的季数；不等同于目录季度或推断出的 offset。 */
  publisherSeason?: number | null;
}

export interface WorkerStatus {
  protocolVersion: 1;
  catalogVersion: string | null;
  modelVersion: string;
  mode: "lexical" | "semantic";
}

export interface ConfigureRequest {
  protocolVersion: 1;
  catalogVersion: string;
  catalog: CatalogSeason[];
}

export interface MatchRequest {
  protocolVersion: 1;
  requestId: string;
  catalogVersion: string;
  query: MatchQuery;
  candidateIds: string[];
}

export interface MatchResult {
  seasonId: string | null;
  reason?: string | null;
  score?: number | null;
}

export interface MatchResponse extends WorkerStatus {
  requestId: string;
  catalogVersion: string;
  result: MatchResult;
}

export interface AnimeMatcherOptions {
  semantic?: boolean;
  python?: string;
  modelDir?: string;
  /** 仅配置本地JSONL子进程；HTTP worker由服务端配置。 */
  device?: "cpu" | "cuda";
  dtype?: "float32" | "bfloat16" | "float16";
  profile?: string;
  endpoint?: string;
  timeoutMs?: number;
}

/** 保留 worker 错误码，供调用方区分缓存丢失、版本冲突和故障。 */
export class AnimeMatcherError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "AnimeMatcherError";
  }
}

const MAX_BYTES = 16 * 1024 * 1024;
const utf8 = new TextDecoder("utf-8", { fatal: true });
type Method = "status" | "configure" | "match";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function badResponse(): AnimeMatcherError {
  return new AnimeMatcherError(
    "INVALID_RESPONSE",
    "匹配 worker 返回了无效响应"
  );
}

function remoteError(value: unknown, status?: number): AnimeMatcherError {
  if (
    !object(value) ||
    typeof value.code !== "string" ||
    typeof value.message !== "string"
  ) {
    return badResponse();
  }
  return new AnimeMatcherError(value.code, value.message, status);
}

/** v1 传输客户端。目录同步与失败恢复由调用方显式发起，不自动重试。 */
export class AnimeMatcherClient {
  private readonly options: AnimeMatcherOptions;
  private readonly timeoutMs: number;
  private worker?: ChildProcessWithoutNullStreams;
  private stdoutBuffer = Buffer.alloc(0);
  private nextId = 1;
  private readonly pending = new Map<
    number,
    {
      resolve: (result: unknown) => void;
      reject: (error: Error) => void;
    }
  >();
  private queue: Promise<unknown> = Promise.resolve();
  private closed = false;
  private closePromise?: Promise<void>;

  constructor(options: AnimeMatcherOptions = {}) {
    this.options = { ...options };
    this.timeoutMs = options.timeoutMs ?? 120_000;
    if (!Number.isFinite(this.timeoutMs) || this.timeoutMs <= 0) {
      throw new Error("timeoutMs must be a positive number");
    }
    if (options.endpoint) {
      const url = new URL(options.endpoint);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.search ||
        url.hash
      ) {
        throw new Error(
          "endpoint must be an HTTP(S) base URL without query or fragment"
        );
      }
    }
  }

  status(): Promise<WorkerStatus> {
    return this.operation("status", { protocolVersion: 1 }, (value) =>
      this.validateStatus(value)
    );
  }

  configure(request: ConfigureRequest): Promise<WorkerStatus> {
    const version = request.catalogVersion;
    return this.operation("configure", request, (value) => {
      const status = this.validateStatus(value);
      if (status.catalogVersion !== version) throw badResponse();
      return status;
    });
  }

  match(request: MatchRequest): Promise<MatchResponse> {
    const { requestId, catalogVersion } = request;
    const candidates = new Set(request.candidateIds);
    return this.operation("match", request, (value) => {
      const status = this.validateStatus(value);
      if (
        !object(value) ||
        value.requestId !== requestId ||
        status.catalogVersion !== catalogVersion ||
        !object(value.result)
      ) {
        throw badResponse();
      }
      const result = value.result;
      if (
        (result.seasonId !== null &&
          (typeof result.seasonId !== "string" ||
            !candidates.has(result.seasonId))) ||
        (result.reason != null && typeof result.reason !== "string") ||
        (result.score != null &&
          (typeof result.score !== "number" || !Number.isFinite(result.score)))
      ) {
        throw badResponse();
      }
      return value as unknown as MatchResponse;
    });
  }

  private operation<T>(
    method: Method,
    payload: object,
    validate: (value: unknown) => T
  ): Promise<T> {
    if (this.closed)
      return Promise.reject(
        new AnimeMatcherError("UNAVAILABLE", "匹配客户端已关闭")
      );
    let body: string;
    try {
      // 排队前固化输入，调用方后续修改对象不会改变请求。
      body = JSON.stringify(payload);
      if (Buffer.byteLength(body) > MAX_BYTES)
        throw new AnimeMatcherError("INVALID_REQUEST", "请求超过 16 MiB");
    } catch (error) {
      return Promise.reject(error);
    }
    const operation = async () => {
      const result = this.options.endpoint
        ? await this.sendHttp(method, body)
        : await this.sendWorker(method, body);
      return validate(result);
    };
    const result = this.queue.then(operation, operation);
    this.queue = result.catch(() => undefined);
    return result;
  }

  close(): Promise<void> {
    if (this.closePromise) return this.closePromise;
    this.closed = true;
    this.closePromise = this.queue.then(async () => {
      const worker = this.worker;
      if (!worker) return;
      await new Promise<void>((resolve) => {
        const finish = () => {
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(() => {
          worker.kill("SIGKILL");
          finish();
        }, this.timeoutMs);
        worker.once("exit", finish);
        worker.once("error", finish);
        worker.stdin.end();
      });
      if (this.worker === worker) this.worker = undefined;
    });
    return this.closePromise;
  }

  private ensureWorker(method: Method): ChildProcessWithoutNullStreams {
    if (this.worker) return this.worker;
    if (method === "match") {
      throw new AnimeMatcherError(
        "UNAVAILABLE",
        "匹配子进程未运行，请显式查询状态并恢复目录"
      );
    }
    const args = ["-m", "lani_anime_matcher.worker"];
    if (this.options.semantic) args.push("--semantic");
    if (this.options.modelDir) args.push("--model-dir", this.options.modelDir);
    if (this.options.device) args.push("--device", this.options.device);
    if (this.options.dtype) args.push("--dtype", this.options.dtype);
    if (this.options.profile) args.push("--profile", this.options.profile);
    const worker = spawn(this.options.python ?? "python3", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });
    this.worker = worker;
    this.stdoutBuffer = Buffer.alloc(0);
    worker.stdout.on("data", (chunk: Buffer) => {
      if (this.worker === worker) this.readWorkerOutput(worker, chunk);
    });
    worker.stderr.resume();
    worker.stdin.on("error", () =>
      this.failWorker(
        worker,
        new AnimeMatcherError("UNAVAILABLE", "无法写入匹配子进程")
      )
    );
    worker.on("error", () =>
      this.failWorker(
        worker,
        new AnimeMatcherError("UNAVAILABLE", "匹配子进程故障")
      )
    );
    worker.on("exit", () =>
      this.failWorker(
        worker,
        new AnimeMatcherError("UNAVAILABLE", "匹配子进程已退出")
      )
    );
    return worker;
  }

  private sendWorker(method: Method, body: string): Promise<unknown> {
    // 协议 envelope 也计入每行 16 MiB。
    const id = this.nextId++;
    const line = JSON.stringify({ ...JSON.parse(body), id, method }) + "\n";
    if (Buffer.byteLength(line) > MAX_BYTES)
      return Promise.reject(
        new AnimeMatcherError("INVALID_REQUEST", "请求超过 16 MiB")
      );
    const worker = this.ensureWorker(method);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () =>
          this.failWorker(
            worker,
            new AnimeMatcherError("TIMEOUT", "匹配子进程操作超时")
          ),
        this.timeoutMs
      );
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      worker.stdin.write(line, (error) => {
        if (error)
          this.failWorker(
            worker,
            new AnimeMatcherError("UNAVAILABLE", "无法写入匹配子进程")
          );
      });
    });
  }

  private readWorkerOutput(
    worker: ChildProcessWithoutNullStreams,
    chunk: Buffer
  ): void {
    this.stdoutBuffer = Buffer.concat([this.stdoutBuffer, chunk]);
    let end = this.stdoutBuffer.indexOf(10);
    while (end >= 0 && this.worker === worker) {
      if (end + 1 > MAX_BYTES) {
        this.failWorker(
          worker,
          new AnimeMatcherError("INVALID_RESPONSE", "响应超过 16 MiB")
        );
        return;
      }
      const line = this.stdoutBuffer.subarray(0, end);
      this.stdoutBuffer = this.stdoutBuffer.subarray(end + 1);
      try {
        const response: unknown = JSON.parse(utf8.decode(line));
        if (
          !object(response) ||
          !Number.isSafeInteger(response.id) ||
          "error" in response === "result" in response
        )
          throw badResponse();
        const id = response.id as number;
        const pending = this.pending.get(id);
        if (!pending) throw badResponse();
        this.pending.delete(id);
        if ("error" in response) pending.reject(remoteError(response.error));
        else pending.resolve(response.result);
      } catch {
        this.failWorker(worker, badResponse());
      }
      end = this.stdoutBuffer.indexOf(10);
    }
    if (this.stdoutBuffer.length > MAX_BYTES)
      this.failWorker(
        worker,
        new AnimeMatcherError("INVALID_RESPONSE", "响应超过 16 MiB")
      );
  }

  private failWorker(
    worker: ChildProcessWithoutNullStreams,
    error: Error
  ): void {
    if (this.worker !== worker) return;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    this.stdoutBuffer = Buffer.alloc(0);
    this.worker = undefined;
    if (worker.exitCode === null && worker.signalCode === null)
      worker.kill("SIGKILL");
  }

  private sendHttp(method: Method, body: string): Promise<unknown> {
    const routes = {
      status: ["GET", "status"],
      configure: ["PUT", "catalog"],
      match: ["POST", "match"],
    };
    const [verb, route] = routes[method];
    const endpoint = new URL(
      `${this.options.endpoint!.replace(/\/$/, "")}/v1/${route}`
    );
    const transport = endpoint.protocol === "https:" ? https : http;
    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error, result?: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) reject(error);
        else resolve(result);
      };
      const timer = setTimeout(() => {
        const error = new AnimeMatcherError("TIMEOUT", "匹配 HTTP 操作超时");
        finish(error);
        request.destroy();
      }, this.timeoutMs);
      const request = transport.request(
        endpoint,
        {
          method: verb,
          headers:
            method === "status"
              ? {}
              : {
                  "content-type": "application/json; charset=utf-8",
                  "content-length": Buffer.byteLength(body),
                },
        },
        (response) => {
          const chunks: Buffer[] = [];
          let bytes = 0;
          response.on("data", (chunk: Buffer) => {
            if (settled) return;
            bytes += chunk.length;
            if (bytes > MAX_BYTES) {
              finish(
                new AnimeMatcherError("INVALID_RESPONSE", "响应超过 16 MiB")
              );
              request.destroy();
            } else chunks.push(chunk);
          });
          const aborted = () =>
            finish(new AnimeMatcherError("UNAVAILABLE", "匹配 HTTP 响应中断"));
          response.on("aborted", aborted);
          response.on("error", aborted);
          response.on("close", () => {
            if (!response.complete) aborted();
          });
          response.on("end", () => {
            if (settled) return;
            try {
              const value: unknown = JSON.parse(
                utf8.decode(Buffer.concat(chunks))
              );
              if (!object(value) || value.protocolVersion !== 1)
                throw badResponse();
              if (response.statusCode !== 200)
                throw remoteError(value.error, response.statusCode);
              if ("error" in value) throw badResponse();
              finish(undefined, value);
            } catch (error) {
              finish(
                error instanceof AnimeMatcherError ? error : badResponse()
              );
            }
          });
        }
      );
      request.on("error", () =>
        finish(new AnimeMatcherError("UNAVAILABLE", "匹配 HTTP 连接失败"))
      );
      request.end(method === "status" ? undefined : body);
    });
  }

  private validateStatus(value: unknown): WorkerStatus {
    if (
      !object(value) ||
      value.protocolVersion !== 1 ||
      (value.catalogVersion !== null &&
        (typeof value.catalogVersion !== "string" || !value.catalogVersion)) ||
      typeof value.modelVersion !== "string" ||
      !value.modelVersion ||
      (value.mode !== "lexical" && value.mode !== "semantic")
    )
      throw badResponse();
    if (
      this.options.semantic !== undefined &&
      value.mode !== (this.options.semantic ? "semantic" : "lexical")
    ) {
      throw new AnimeMatcherError(
        "MODE_MISMATCH",
        "匹配 worker 模式与客户端配置不符"
      );
    }
    return value as unknown as WorkerStatus;
  }
}
