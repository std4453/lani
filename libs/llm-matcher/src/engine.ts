import { createHash } from "crypto";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { performance } from "perf_hooks";
import { CatalogRow, object, ProtocolError, Query } from "./protocol";
import { AttemptError, complete } from "./transport";

export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const EXPLICIT_SEASON =
  /(?:\bS\d{1,2}(?:E\d|\b)|\b\d{1,2}(?:st|nd|rd|th)\b|\bSeason\s+\d{1,2}\b|第[一二三四五六七八九十0-9]+季)/i;
const PREFIX = "LANI_LLM_MATCHER_";

export interface Settings {
  endpoint: string;
  model: string;
  apiKey: string;
  deadlineSeconds: number;
  attemptSeconds: number;
  concurrency: number;
  fallbackEnabled: boolean;
  firstParameters: Record<string, unknown>;
  reviewParameters: Record<string, unknown>;
}

function boolean(value: string) {
  switch (value.trim().toLowerCase()) {
    case "true":
    case "1":
    case "yes":
      return true;
    case "false":
    case "0":
    case "no":
      return false;
    default:
      throw new Error("Invalid matcher fallback setting");
  }
}

export function settingsFromEnv(env = process.env): Settings {
  const get = (name: string, fallback = "") => env[PREFIX + name] ?? fallback;
  return validateSettings({
    endpoint: get("ENDPOINT"),
    model: get("MODEL"),
    apiKey: get("API_KEY"),
    deadlineSeconds: Number(get("DEADLINE_SECONDS", "100")),
    attemptSeconds: Number(get("ATTEMPT_SECONDS", "45")),
    concurrency: Number(get("CONCURRENCY", "2")),
    fallbackEnabled: boolean(get("FALLBACK_ENABLED", "true")),
    firstParameters: JSON.parse(get("FIRST_PARAMETERS", "{}")),
    reviewParameters: JSON.parse(get("REVIEW_PARAMETERS", "{}")),
  });
}

export function validateSettings(settings: Settings): Settings {
  const url = new URL(settings.endpoint);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.hash ||
    !settings.model.trim() ||
    !settings.apiKey.trim() ||
    !Number.isFinite(settings.deadlineSeconds) ||
    !Number.isFinite(settings.attemptSeconds) ||
    settings.attemptSeconds <= 0 ||
    settings.attemptSeconds > settings.deadlineSeconds ||
    settings.deadlineSeconds > 3600 ||
    !Number.isInteger(settings.concurrency) ||
    settings.concurrency < 1 ||
    settings.concurrency > 32 ||
    typeof settings.fallbackEnabled !== "boolean"
  )
    throw new Error("Invalid matcher configuration");
  for (const parameters of [
    settings.firstParameters,
    settings.reviewParameters,
  ]) {
    if (
      !object(parameters) ||
      ["model", "messages", "stream", "response_format"].some(
        (key) => key in parameters
      )
    )
      throw new Error("Invalid matcher stage parameters");
  }
  return settings;
}

class Semaphore {
  private active = 0;
  private waiting: (() => void)[] = [];

  constructor(private capacity: number) {}

  async acquire(timeoutMs: number): Promise<() => void> {
    if (this.active < this.capacity) {
      this.active++;
    } else {
      await new Promise<void>((resolve, reject) => {
        const ready = () => {
          clearTimeout(timer);
          resolve();
        };
        const timer = setTimeout(() => {
          this.waiting.splice(this.waiting.indexOf(ready), 1);
          reject(new AttemptError("TIMEOUT", false));
        }, timeoutMs);
        this.waiting.push(ready);
      });
    }
    return () => {
      const next = this.waiting.shift();
      if (next) next();
      else this.active--;
    };
  }
}

export type Log = (event: Record<string, unknown>) => void;
type Stage = "primary" | "fallback";
type Completion = typeof complete;

export function usageRecord(response: unknown) {
  const usage =
    object(response) && object(response.usage) ? response.usage : {};
  const details = object(usage.completion_tokens_details)
    ? usage.completion_tokens_details
    : {};
  const promptDetails = object(usage.prompt_tokens_details)
    ? usage.prompt_tokens_details
    : {};
  const values: Record<string, unknown> = {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    cacheHitTokens:
      usage.prompt_cache_hit_tokens ?? promptDetails.cached_tokens,
    cacheMissTokens: usage.prompt_cache_miss_tokens,
    reasoningTokens: details.reasoning_tokens,
  };
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) =>
        typeof value === "number" &&
        Number.isSafeInteger(value) &&
        value >= 0 &&
        value <= 1e9
    )
  );
}

export function answer(
  response: unknown,
  candidates: Set<string>
): string | null {
  if (!object(response) || !Array.isArray(response.choices))
    throw new AttemptError("INVALID_RESPONSE");
  const choice = response.choices[0];
  if (
    response.choices.length !== 1 ||
    !object(choice) ||
    choice.finish_reason !== "stop" ||
    !object(choice.message) ||
    typeof choice.message.content !== "string"
  )
    throw new AttemptError("INVALID_RESPONSE");
  const content = choice.message.content;
  // 只允许一个字符串键和一个字符串/null值，重复键在 JSON.parse 前即被拒绝。
  const string =
    '"(?:[^"\\\\\\x00-\\x1f]|\\\\(?:["\\\\/bfnrt]|u[0-9a-fA-F]{4}))*"';
  if (
    !new RegExp(
      `^\\s*\\{\\s*${string}\\s*:\\s*(?:null|${string})\\s*\\}\\s*$`
    ).test(content)
  )
    throw new AttemptError("INVALID_RESPONSE");
  try {
    const parsed: unknown = JSON.parse(content);
    if (
      !object(parsed) ||
      Object.keys(parsed).length !== 1 ||
      !("s" in parsed) ||
      (parsed.s !== null &&
        (typeof parsed.s !== "string" || !candidates.has(parsed.s)))
    )
      throw new Error();
    return parsed.s as string | null;
  } catch {
    throw new AttemptError("INVALID_RESPONSE");
  }
}

export class Engine {
  readonly modelVersion: string;
  private semaphore: Semaphore;
  private firstTemplate: string;
  private reviewTemplate: string;

  constructor(
    readonly settings: Settings,
    private completion: Completion = complete,
    readonly log: Log = (event) =>
      process.stderr.write(JSON.stringify(event) + "\n")
  ) {
    validateSettings(settings);
    this.semaphore = new Semaphore(settings.concurrency);
    const prompts = join(__dirname, "../prompts");
    this.firstTemplate = readFileSync(
      join(prompts, "first.system.txt"),
      "utf8"
    );
    this.reviewTemplate = readFileSync(
      join(prompts, "review.system.txt"),
      "utf8"
    );
    const { apiKey: _secret, ...identity } = settings;
    const source = readdirSync(__dirname)
      .filter((file) => file.endsWith(".js"))
      .sort()
      .map((file) => readFileSync(join(__dirname, file), "utf8"))
      .join("");
    this.modelVersion =
      "llm-v2-" +
      digest(
        JSON.stringify(identity) +
          source +
          this.firstTemplate +
          this.reviewTemplate
      ).slice(0, 24);
  }

  prompt(rows: ReadonlyMap<string, CatalogRow>, ids: string[], stage: Stage) {
    const selected = new Set(ids);
    const catalog = [...rows.values()]
      .filter((row) => selected.has(row.id))
      .map((row) =>
        JSON.stringify({
          id: row.id,
          aliases: row.aliases,
          y: row.y,
          q: row.q,
          ...(stage === "fallback"
            ? { count: row.count, premiere: row.premiere }
            : {}),
        })
      )
      .join("\n");
    return (
      stage === "primary" ? this.firstTemplate : this.reviewTemplate
    ).replace("{{CATALOG_ROWS}}", () => catalog);
  }

  async match(
    rows: ReadonlyMap<string, CatalogRow>,
    query: Query,
    primary: string[],
    requestId: string
  ) {
    const started = performance.now();
    const deadline = started + this.settings.deadlineSeconds * 1000;
    const attempts: Record<string, unknown>[] = [];
    let release: (() => void) | undefined;
    try {
      release = await this.semaphore.acquire(deadline - performance.now());
      const stage = async (name: Stage, ids: string[]) => {
        const prompt = this.prompt(rows, ids, name);
        this.log({
          event: "llm_prompt",
          requestId,
          stage: name,
          hash: digest(prompt),
        });
        const parameters =
          name === "primary"
            ? {
                temperature: 0,
                max_tokens: 128,
                ...this.settings.firstParameters,
              }
            : { max_tokens: 8192, ...this.settings.reviewParameters };
        const payload = {
          model: this.settings.model,
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: JSON.stringify(query) },
          ],
          stream: false,
          response_format: { type: "json_object" },
          ...parameters,
        };
        for (let attempt = 1; attempt <= 2; attempt++) {
          const remaining = deadline - performance.now();
          if (remaining <= 0) throw new AttemptError("TIMEOUT", false);
          const event: Record<string, unknown> = { stage: name, attempt };
          const begin = performance.now();
          let error: AttemptError | undefined;
          let value: string | null = null;
          try {
            const response = await this.completion(
              this.settings,
              payload,
              Math.min(remaining, this.settings.attemptSeconds * 1000)
            );
            if (performance.now() >= deadline)
              throw new AttemptError("TIMEOUT", false);
            Object.assign(event, usageRecord(response));
            if (object(response) && typeof response.model === "string")
              event.model = response.model;
            value = answer(response, new Set(ids));
          } catch (caught) {
            if (!(caught instanceof AttemptError)) throw caught;
            error = caught;
            event.error = error.code;
          } finally {
            event.elapsedMs = Math.round(performance.now() - begin);
            attempts.push(event);
            this.log({ event: "llm_attempt", requestId, ...event });
          }
          if (!error) return value;
          if (!error.retryable || attempt === 2) throw error;
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.min(250, Math.max(0, deadline - performance.now()))
            )
          );
        }
        throw new AttemptError("UPSTREAM_UNAVAILABLE", false);
      };
      const result = (
        selected: string | null,
        name: Stage,
        reason?: string
      ) => ({
        result: { seasonId: selected },
        decision: {
          stage: name,
          ...(reason ? { fallbackReason: reason } : {}),
        },
        diagnostics: {
          attempts,
          elapsedMs: Math.round(performance.now() - started),
        },
      });
      let reason = "empty_primary";
      let selected: string | null = null;
      if (primary.length) {
        try {
          selected = await stage("primary", primary);
          reason = "primary_null";
          if (selected !== null) {
            const count = rows.get(selected)!.count;
            const explicit =
              (query.publisherSeason ?? 0) > 0 ||
              EXPLICIT_SEASON.test(query.rawTitle);
            const conflict =
              count !== null &&
              query.episode !== null &&
              query.episode > count &&
              explicit;
            if (!conflict) return result(selected, "primary");
            reason = "numbering_conflict";
          }
        } catch (error) {
          if (!(error instanceof AttemptError) || !error.retryable) throw error;
          reason = "primary_error";
        }
      }
      if (!this.settings.fallbackEnabled) {
        if (reason === "primary_error")
          throw new AttemptError("UPSTREAM_UNAVAILABLE", false);
        return result(selected, "primary");
      }
      const fallback = [...rows.keys()];
      selected = fallback.length ? await stage("fallback", fallback) : null;
      return result(selected, "fallback", reason);
    } catch (error) {
      if (!(error instanceof AttemptError)) throw error;
      const timeout = error.code === "TIMEOUT";
      throw new ProtocolError(
        timeout ? "TIMEOUT" : "UPSTREAM_ERROR",
        "外部模型服务调用失败",
        timeout ? 504 : 502
      );
    } finally {
      release?.();
    }
  }
}
