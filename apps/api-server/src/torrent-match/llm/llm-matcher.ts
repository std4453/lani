import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';
import config from '@/config';
import { MatchingLlmConfig } from '@/config/matching';
import { describeLlmError, LlmError } from '@/llm/llm.errors';
import { LlmService } from '@/llm/llm.service';
import { MatcherBackend } from '../backend';
import {
  CatalogSnapshot,
  MatchQuery,
  MatchResponse,
  WorkerStatus,
} from '../protocol';

type Stage = 'primary' | 'fallback';
interface CatalogRow {
  id: string;
  aliases: string[];
  y: number | null;
  q: number | null;
  count: number | null;
  premiere: string | null;
}
interface Snapshot {
  version: string;
  rows: ReadonlyMap<string, CatalogRow>;
}

const explicitSeason =
  /(?:\bS\d{1,2}(?:E\d|\b)|\b\d{1,2}(?:st|nd|rd|th)\b|\bSeason\s+\d{1,2}\b|第[一二三四五六七八九十0-9]+季)/i;
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export function usageRecord(response: unknown) {
  const usage =
    object(response) && object(response.usage) ? response.usage : {};
  const details = object(usage.completion_tokens_details)
    ? usage.completion_tokens_details
    : {};
  const promptDetails = object(usage.prompt_tokens_details)
    ? usage.prompt_tokens_details
    : {};
  return Object.fromEntries(
    Object.entries({
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      cacheHitTokens:
        usage.prompt_cache_hit_tokens ?? promptDetails.cached_tokens,
      cacheMissTokens: usage.prompt_cache_miss_tokens,
      reasoningTokens: details.reasoning_tokens,
    }).filter(
      ([, value]) =>
        typeof value === 'number' &&
        Number.isSafeInteger(value) &&
        value >= 0 &&
        value <= 1e9,
    ),
  );
}

export function matchAnswer(
  response: unknown,
  candidates: Set<string>,
): string | null {
  if (!object(response) || !Array.isArray(response.choices))
    throw new LlmError('INVALID_RESPONSE');
  const choice = response.choices[0];
  if (
    response.choices.length !== 1 ||
    !object(choice) ||
    choice.finish_reason !== 'stop' ||
    !object(choice.message) ||
    typeof choice.message.content !== 'string'
  )
    throw new LlmError('INVALID_RESPONSE');
  const content = choice.message.content;
  // 在 JSON.parse 前拒绝重复键，只接受单个字符串键及字符串/null 值。
  const string =
    '"(?:[^"\\\\\\x00-\\x1f]|\\\\(?:["\\\\/bfnrt]|u[0-9a-fA-F]{4}))*"';
  if (
    !new RegExp(
      `^\\s*\\{\\s*${string}\\s*:\\s*(?:null|${string})\\s*\\}\\s*$`,
    ).test(content)
  )
    throw new LlmError('INVALID_RESPONSE');
  try {
    const result: unknown = JSON.parse(content);
    if (
      !object(result) ||
      Object.keys(result).length !== 1 ||
      !('s' in result) ||
      (result.s !== null &&
        (typeof result.s !== 'string' || !candidates.has(result.s)))
    )
      throw new Error();
    return result.s as string | null;
  } catch {
    throw new LlmError('INVALID_RESPONSE');
  }
}

@Injectable()
export class LlmMatcher implements MatcherBackend {
  private readonly logger = new Logger(LlmMatcher.name);
  private snapshot?: Snapshot;
  private templates?: Record<Stage, string>;
  private closed = false;
  private readonly active = new Map<AbortController, Promise<MatchResponse>>();

  constructor(private readonly llm: LlmService) {}

  private settings(): MatchingLlmConfig {
    const settings = config.matching.llm;
    if (!settings) throw new LlmError('CONFIGURATION_ERROR', false);
    return settings;
  }

  private promptTemplates() {
    if (!this.templates) {
      this.templates = {
        primary: readFileSync(
          join(__dirname, 'prompts/first.system.txt'),
          'utf8',
        ),
        fallback: readFileSync(
          join(__dirname, 'prompts/review.system.txt'),
          'utf8',
        ),
      };
    }
    return this.templates;
  }

  private modelVersion(settings: MatchingLlmConfig) {
    const { apiKey: _secret, ...identity } = settings;
    const templates = this.promptTemplates();
    return `builtin-llm-v1-${digest(
      JSON.stringify(identity) + templates.primary + templates.fallback,
    ).slice(0, 24)}`;
  }

  private catalog(catalog: CatalogSnapshot): Snapshot {
    if (this.snapshot?.version === catalog.version) return this.snapshot;
    // 输入来自已持久化的目录快照；复制投影，避免后续目录替换影响在途请求。
    const rows = new Map<string, CatalogRow>();
    for (const season of catalog.catalog) {
      rows.set(season.id, {
        id: season.id,
        aliases: [
          ...new Set([season.title, ...season.aliases].filter(Boolean)),
        ],
        y: season.year,
        q: season.quarter,
        count: season.declaredEpisodeCount ?? null,
        premiere: season.premiereDate ?? null,
      });
    }
    return (this.snapshot = { version: catalog.version, rows });
  }

  async load(catalog: CatalogSnapshot): Promise<WorkerStatus> {
    if (this.closed) throw new LlmError('CLOSED', false);
    const snapshot = this.catalog(catalog);
    return {
      protocolVersion: 2,
      catalogVersion: snapshot.version,
      modelVersion: this.modelVersion(this.settings()),
      mode: 'llm',
    };
  }

  private prompt(
    rows: ReadonlyMap<string, CatalogRow>,
    ids: string[],
    stage: Stage,
  ) {
    const selected = new Set(ids);
    const catalog = [...rows.values()]
      .filter((row) => selected.has(row.id))
      .map((row) =>
        JSON.stringify({
          id: row.id,
          aliases: row.aliases,
          y: row.y,
          q: row.q,
          ...(stage === 'fallback'
            ? { count: row.count, premiere: row.premiere }
            : {}),
        }),
      )
      .join('\n');
    return this.promptTemplates()[stage].replace(
      '{{CATALOG_ROWS}}',
      () => catalog,
    );
  }

  async match(
    catalog: CatalogSnapshot,
    query: MatchQuery,
    candidateIds: string[],
    requestId: string,
  ): Promise<MatchResponse> {
    if (this.closed) return Promise.reject(new LlmError('CLOSED', false));
    const started = performance.now();
    const settings = this.settings();
    const snapshot = this.catalog(catalog);
    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, Math.max(0, settings.deadlineMs - (performance.now() - started)));
    const promise = this.run(
      snapshot,
      query,
      [...candidateIds],
      requestId,
      settings,
      controller.signal,
      started,
      () => timedOut,
    )
      .then((response) => {
        this.log(
          {
            event: 'llm_match',
            requestId,
            seasonId: response.result.seasonId,
            decision: response.decision,
            elapsedMs: (response.diagnostics as { elapsedMs: number })
              .elapsedMs,
          },
          settings,
        );
        return response;
      })
      .finally(() => {
        clearTimeout(timer);
        this.active.delete(controller);
      });
    this.active.set(controller, promise);
    return promise;
  }

  private async run(
    snapshot: Snapshot,
    query: MatchQuery,
    primary: string[],
    requestId: string,
    settings: MatchingLlmConfig,
    signal: AbortSignal,
    started: number,
    timedOut: () => boolean,
  ): Promise<MatchResponse> {
    const { rows } = snapshot;
    const attempts: Record<string, unknown>[] = [];
    const abortError = () =>
      new LlmError(
        timedOut() || performance.now() - started >= settings.deadlineMs
          ? 'TIMEOUT'
          : 'ABORTED',
        false,
      );
    const check = () => {
      if (signal.aborted || performance.now() - started >= settings.deadlineMs)
        throw abortError();
    };
    const stage = async (name: Stage, ids: string[]) => {
      check();
      const prompt = this.prompt(rows, ids, name);
      this.log(
        { event: 'llm_prompt', requestId, stage: name, hash: digest(prompt) },
        settings,
      );
      const parameters =
        name === 'primary'
          ? { temperature: 0, max_tokens: 128, ...settings.firstParameters }
          : { max_tokens: 8192, ...settings.reviewParameters };
      const payload = {
        ...parameters,
        model: settings.model,
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: JSON.stringify({
              rawTitle: query.rawTitle,
              aliases: query.aliases,
              publishedAt: query.publishedAt,
              episode: query.episode ?? null,
              publisherSeason: query.publisherSeason ?? null,
            }),
          },
        ],
        stream: false,
        response_format: { type: 'json_object' },
      };
      for (let attempt = 1; attempt <= 2; attempt++) {
        check();
        const event: Record<string, unknown> = { stage: name, attempt };
        const begin = performance.now();
        let error: LlmError | undefined;
        let selected: string | null = null;
        try {
          const response = await this.llm.complete(
            { apiBase: settings.apiBase, apiKey: settings.apiKey },
            payload,
            signal,
          );
          check();
          Object.assign(event, usageRecord(response));
          if (object(response) && typeof response.model === 'string')
            event.model = response.model;
          selected = matchAnswer(response, new Set(ids));
        } catch (caught) {
          if (
            signal.aborted ||
            performance.now() - started >= settings.deadlineMs
          )
            caught = abortError();
          if (!(caught instanceof LlmError)) throw caught;
          error = caught;
          event.error = error.code;
        } finally {
          event.elapsedMs = Math.round(performance.now() - begin);
          attempts.push(event);
          this.log({ event: 'llm_attempt', requestId, ...event }, settings);
        }
        if (!error) return selected;
        if (!error.retryable || attempt === 2) throw error;
        await this.pause(
          signal,
          Math.min(
            250,
            Math.max(0, settings.deadlineMs - (performance.now() - started)),
          ),
        );
      }
      throw new LlmError('UPSTREAM_ERROR', false);
    };
    const result = (
      selected: string | null,
      name: Stage,
      reason?: string,
    ): MatchResponse => {
      check();
      return {
        protocolVersion: 2,
        catalogVersion: snapshot.version,
        requestId,
        modelVersion: this.modelVersion(settings),
        mode: 'llm',
        result: { seasonId: selected },
        decision: {
          stage: name,
          ...(reason ? { fallbackReason: reason } : {}),
        },
        diagnostics: {
          attempts,
          elapsedMs: Math.round(performance.now() - started),
        },
      };
    };
    try {
      check();
      let reason = 'empty_primary';
      let selected: string | null = null;
      if (primary.length) {
        try {
          selected = await stage('primary', primary);
          reason = 'primary_null';
          if (selected !== null) {
            const count = rows.get(selected)!.count;
            const explicit =
              (query.publisherSeason ?? 0) > 0 ||
              explicitSeason.test(query.rawTitle);
            if (
              !(
                count !== null &&
                query.episode != null &&
                query.episode > count &&
                explicit
              )
            )
              return result(selected, 'primary');
            reason = 'numbering_conflict';
          }
        } catch (error) {
          if (!(error instanceof LlmError) || !error.retryable) throw error;
          reason = 'primary_error';
        }
      }
      if (!settings.fallbackEnabled) {
        if (reason === 'primary_error')
          throw new LlmError('UPSTREAM_ERROR', false);
        return result(selected, 'primary');
      }
      const fallback = [...rows.keys()];
      selected = fallback.length ? await stage('fallback', fallback) : null;
      return result(selected, 'fallback', reason);
    } catch (error) {
      if (signal.aborted || performance.now() - started >= settings.deadlineMs)
        error = abortError();
      if (!(error instanceof LlmError)) {
        this.logUnknown(error, settings);
        this.log(
          { event: 'llm_failure', requestId, code: 'UPSTREAM_ERROR' },
          settings,
        );
        throw new LlmError('UPSTREAM_ERROR', false);
      }
      this.log({ event: 'llm_failure', requestId, code: error.code }, settings);
      throw error;
    }
  }

  private pause(signal: AbortSignal, milliseconds: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const finish = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', aborted);
        resolve();
      };
      const aborted = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', aborted);
        reject(new LlmError('ABORTED', false));
      };
      const timer = setTimeout(finish, milliseconds);
      if (signal.aborted) aborted();
      else signal.addEventListener('abort', aborted, { once: true });
    });
  }

  private log(event: Record<string, unknown>, settings: MatchingLlmConfig) {
    this.logger.log(describeLlmError(event, settings.apiKey));
  }

  private logUnknown(error: unknown, settings: MatchingLlmConfig) {
    this.logger.error(describeLlmError(error, settings.apiKey));
  }

  async close(): Promise<void> {
    this.closed = true;
    for (const controller of this.active.keys()) controller.abort();
    await Promise.allSettled(this.active.values());
  }
}
