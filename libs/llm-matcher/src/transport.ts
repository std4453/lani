import http from "http";
import https from "https";
import { TextDecoder } from "util";
import { object } from "./protocol";

export class AttemptError extends Error {
  constructor(readonly code: string, readonly retryable = true) {
    super(code);
  }
}

export interface EndpointSettings {
  endpoint: string;
  apiKey: string;
}

/** 单进程异步 I/O；同一截止时间覆盖 DNS、连接、响应头和正文。 */
export function complete(
  settings: EndpointSettings,
  payload: Record<string, unknown>,
  timeoutMs: number
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const url = new URL(settings.endpoint);
    const body = Buffer.from(JSON.stringify(payload));
    let settled = false;
    const request = (url.protocol === "https:" ? https : http).request(url, {
      method: "POST",
      agent: false,
      headers: {
        "content-type": "application/json",
        "content-length": body.length,
        authorization: `Bearer ${settings.apiKey}`,
      },
    });
    const finish = (error?: AttemptError, data?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error);
      else resolve(data);
      request.destroy();
    };
    const timer = setTimeout(
      () => finish(new AttemptError("TIMEOUT")),
      timeoutMs
    );
    request.on("error", () => finish(new AttemptError("UPSTREAM_UNAVAILABLE")));
    request.on("response", (response) => {
      const status = response.statusCode ?? 0;
      if (status !== 200) {
        finish(
          new AttemptError(
            `UPSTREAM_HTTP_${status}`,
            status === 408 || status === 429 || status >= 500
          )
        );
        response.destroy();
        return;
      }
      const chunks: Buffer[] = [];
      let bytes = 0;
      response.on("error", () =>
        finish(new AttemptError("UPSTREAM_UNAVAILABLE"))
      );
      response.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > 4 * 1024 * 1024) {
          finish(new AttemptError("INVALID_RESPONSE"));
          response.destroy();
        } else chunks.push(chunk);
      });
      response.on("end", () => {
        try {
          const data: unknown = JSON.parse(
            new TextDecoder("utf-8", { fatal: true }).decode(
              Buffer.concat(chunks)
            )
          );
          // 不保留模型思考正文；日志与业务响应仅包含结果及可选用量。
          if (object(data) && Array.isArray(data.choices)) {
            for (const choice of data.choices)
              if (object(choice) && object(choice.message))
                delete choice.message.reasoning_content;
          }
          finish(undefined, data);
        } catch {
          finish(new AttemptError("INVALID_RESPONSE"));
        }
      });
    });
    request.end(body);
  });
}
