import config from '@/config';
import { GlobalAxiosService } from '@/common/axios.service';
import { S3Service } from '@/common/s3.service';
import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import AWS from 'aws-sdk';

export interface BangumiDataSchedule {
  readonly begin: string;
  readonly broadcastAt: string;
}

interface Snapshot {
  schemaVersion: 1;
  sourceUrl: string;
  etag?: string;
  downloadedAt: string;
  lastValidatedAt: string;
  items: unknown;
}

interface CacheState {
  items: unknown;
  etag?: string;
  downloadedAt: string;
  lastValidatedAt: string;
  schedules: Map<string, BangumiDataSchedule>;
}

interface ParsedItems {
  items: unknown[];
  schedules: Map<string, BangumiDataSchedule>;
}

const SOURCE_URL =
  'https://raw.githubusercontent.com/bangumi-data/bangumi-data/master/dist/data.json';
const SNAPSHOT_KEY = 'cache/bangumi-data/v1.json';
const SCHEMA_VERSION = 1 as const;
const HTTP_TIMEOUT_MS = 20_000;
const S3_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 32 * 1024 * 1024;
const REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;
const INITIAL_RETRY_MS = 5 * 60 * 1000;
const MAX_RETRY_MS = 60 * 60 * 1000;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validIso(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/.exec(
      value,
    );
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(Date.UTC(+year, +month - 1, +day));
  return (
    date.getUTCFullYear() === +year &&
    date.getUTCMonth() === +month - 1 &&
    date.getUTCDate() === +day &&
    +hour <= 23 &&
    +minute <= 59 &&
    +second <= 59
  );
}

function broadcastStart(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const match = /^R\/(.+?)\/(P.+)$/.exec(value);
  const duration =
    /^P(?=\d|T\d)(?:\d+(?:\.\d+)?[YMWD])*(?:T(?:\d+(?:\.\d+)?[HMS])*)?$/.test(
      match?.[2] ?? '',
    );
  return match && duration && validIso(match[1]) ? match[1] : undefined;
}

function normalizeBody(body: unknown): string {
  if (typeof body === 'string') return body;
  if (Buffer.isBuffer(body)) return body.toString('utf8');
  if (body instanceof Uint8Array) return Buffer.from(body).toString('utf8');
  if (body instanceof ArrayBuffer) return Buffer.from(body).toString('utf8');
  throw new Error('Unexpected Bangumi-data response body');
}

function buildScheduleMap(items: unknown): Map<string, BangumiDataSchedule> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Bangumi-data items are empty or malformed');
  }
  const matches = new Map<
    string,
    { conflict: boolean; schedule?: BangumiDataSchedule }
  >();

  for (const rawItem of items) {
    if (!isObject(rawItem) || !Array.isArray(rawItem.sites)) {
      throw new Error('Malformed Bangumi-data item');
    }
    const sites = rawItem.sites as unknown[];
    if (!sites.every(isObject)) throw new Error('Malformed Bangumi-data sites');
    const bangumiSites = sites.filter(
      (site) =>
        site.site === 'bangumi' &&
        typeof site.id === 'string' &&
        /^\d+$/.test(site.id),
    );
    if (!bangumiSites.length) continue;

    for (const bangumiSite of bangumiSites) {
      const id = bangumiSite.id as string;
      const begin = rawItem.begin;
      const broadcastAt =
        broadcastStart(rawItem.broadcast) ??
        (validIso(begin) ? begin : undefined);
      const schedule =
        validIso(begin) && broadcastAt
          ? {
              begin: new Date(begin).toISOString(),
              broadcastAt: new Date(broadcastAt).toISOString(),
            }
          : undefined;
      const previous = matches.get(id);
      if (previous) {
        // 多语言条目可能共享 ID；只有完全一致的日程可以合并。
        if (
          !schedule ||
          !previous.schedule ||
          schedule.begin !== previous.schedule.begin ||
          schedule.broadcastAt !== previous.schedule.broadcastAt
        ) {
          previous.conflict = true;
        }
        continue;
      }
      matches.set(id, { conflict: false, schedule });
    }
  }

  const result = new Map<string, BangumiDataSchedule>();
  for (const [id, match] of matches) {
    if (!match.conflict && match.schedule) result.set(id, match.schedule);
  }
  if (!result.size)
    throw new Error('Bangumi-data contains no usable schedules');
  return result;
}

function extractItems(payload: unknown): ParsedItems {
  if (!isObject(payload) || !Array.isArray(payload.items)) {
    throw new Error('Malformed Bangumi-data document');
  }
  return {
    items: payload.items,
    schedules: buildScheduleMap(payload.items),
  };
}

function validSnapshotTimestamp(value: unknown): value is string {
  return validIso(value) && Date.parse(value) <= Date.now() + 5 * 60 * 1000;
}

@Injectable()
export class BangumiDataService {
  private readonly logger = new Logger(BangumiDataService.name);
  private state?: CacheState;
  private initialized = false;
  private initialization?: Promise<void>;
  private refreshInFlight?: Promise<void>;
  private nextRefreshAt = 0;
  private retryDelay = INITIAL_RETRY_MS;

  constructor(
    private readonly http: GlobalAxiosService,
    private readonly s3: S3Service,
  ) {}

  onApplicationBootstrap(): void {
    void this.ensureInitialized();
  }

  async getSchedule(
    bangumiId: string,
  ): Promise<BangumiDataSchedule | undefined> {
    if (!/^\d+$/.test(bangumiId)) return undefined;
    if (this.refreshInFlight && !this.state) await this.refreshInFlight;
    if (!this.state) {
      if (Date.now() < this.nextRefreshAt) return undefined;
      await this.ensureInitialized();
    }
    return this.state?.schedules.get(bangumiId);
  }

  @Interval(60_000)
  async refreshIfDue(): Promise<void> {
    if (!this.state) {
      if (Date.now() < this.nextRefreshAt) return;
      if (!this.initialized) await this.ensureInitialized();
      else await this.refresh();
      return;
    }
    if (Date.now() >= this.nextRefreshAt) await this.refresh();
  }

  private ensureInitialized(): Promise<void> {
    if (this.initialization) return this.initialization;
    if (this.initialized) {
      return Date.now() >= this.nextRefreshAt
        ? this.refresh()
        : Promise.resolve();
    }
    this.initialization = this.initialize().finally(() => {
      this.initialization = undefined;
    });
    return this.initialization;
  }

  private async initialize(): Promise<void> {
    let snapshot: CacheState | undefined;
    try {
      snapshot = await this.readSnapshot();
    } catch {
      this.logger.warn('Unable to restore Bangumi-data cache from S3');
    }
    this.initialized = true;
    if (!snapshot) {
      this.logger.warn('No valid Bangumi-data snapshot is available');
    }
    if (snapshot) {
      const age = Date.now() - Date.parse(snapshot.lastValidatedAt);
      this.state = snapshot;
      this.nextRefreshAt =
        age >= REFRESH_INTERVAL_MS
          ? Date.now()
          : Date.now() + REFRESH_INTERVAL_MS - age;
      if (age >= REFRESH_INTERVAL_MS) void this.refresh();
      return;
    }
    await this.refresh();
  }

  private refresh(): Promise<void> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = this.fetchAndApply()
      .then(() => {
        this.retryDelay = INITIAL_RETRY_MS;
        this.nextRefreshAt = Date.now() + REFRESH_INTERVAL_MS;
      })
      .catch(() => {
        this.logger.warn('Bangumi-data refresh failed; retry will be delayed');
        this.nextRefreshAt = Date.now() + this.retryDelay;
        this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_MS);
      })
      .finally(() => {
        this.refreshInFlight = undefined;
      });
    return this.refreshInFlight;
  }

  private async fetchAndApply(): Promise<void> {
    const response = await this.http.get<unknown>(SOURCE_URL, {
      // 只使用 GlobalAxiosService 配置的代理，避免环境变量覆盖代理路由。
      proxy: false,
      timeout: HTTP_TIMEOUT_MS,
      responseType: 'arraybuffer',
      maxContentLength: MAX_RESPONSE_BYTES,
      maxBodyLength: MAX_RESPONSE_BYTES,
      headers: this.state?.etag
        ? { 'If-None-Match': this.state.etag }
        : undefined,
      validateStatus: (status) => status === 200 || status === 304,
    });
    const now = new Date().toISOString();
    if (response.status === 304) {
      if (!this.state)
        throw new Error('Received 304 without a cached snapshot');
      this.state = { ...this.state, lastValidatedAt: now };
      await this.writeSnapshot(this.state);
      return;
    }

    const text = normalizeBody(response.data);
    if (Buffer.byteLength(text, 'utf8') > MAX_RESPONSE_BYTES) {
      throw new Error('Bangumi-data response exceeds size limit');
    }
    const parsed = extractItems(JSON.parse(text));
    const state: CacheState = {
      items: parsed.items,
      etag: response.headers?.etag,
      downloadedAt: now,
      lastValidatedAt: now,
      schedules: parsed.schedules,
    };
    this.state = state;
    await this.writeSnapshot(state);
  }

  private async readSnapshot(): Promise<CacheState | undefined> {
    const output = await this.withS3Timeout(
      this.s3.getObject({ Bucket: config.s3.bucket, Key: SNAPSHOT_KEY }),
    );
    if (
      typeof output.ContentLength === 'number' &&
      output.ContentLength > MAX_RESPONSE_BYTES
    ) {
      return undefined;
    }
    const body = normalizeBody(output.Body);
    if (Buffer.byteLength(body, 'utf8') > MAX_RESPONSE_BYTES) return undefined;
    const parsed: unknown = JSON.parse(body);
    if (
      !isObject(parsed) ||
      parsed.schemaVersion !== SCHEMA_VERSION ||
      parsed.sourceUrl !== SOURCE_URL ||
      !validSnapshotTimestamp(parsed.downloadedAt) ||
      !validSnapshotTimestamp(parsed.lastValidatedAt)
    ) {
      return undefined;
    }
    const parsedItems = extractItems({ items: parsed.items });
    return {
      items: parsedItems.items,
      etag: typeof parsed.etag === 'string' ? parsed.etag : undefined,
      downloadedAt: parsed.downloadedAt,
      lastValidatedAt: parsed.lastValidatedAt,
      schedules: parsedItems.schedules,
    };
  }

  private async writeSnapshot(state: CacheState): Promise<void> {
    const snapshot: Snapshot = {
      schemaVersion: SCHEMA_VERSION,
      sourceUrl: SOURCE_URL,
      etag: state.etag,
      downloadedAt: state.downloadedAt,
      lastValidatedAt: state.lastValidatedAt,
      items: state.items,
    };
    const body = JSON.stringify(snapshot);
    if (Buffer.byteLength(body, 'utf8') > MAX_RESPONSE_BYTES) return;
    try {
      await this.withS3Timeout(
        this.s3.putObject({
          Bucket: config.s3.bucket,
          Key: SNAPSHOT_KEY,
          Body: body,
          ContentType: 'application/json; charset=utf-8',
        }),
      );
    } catch {
      this.logger.warn('Unable to persist Bangumi-data cache to S3');
    }
  }

  private withS3Timeout<T>(request: AWS.Request<T, AWS.AWSError>): Promise<T> {
    return new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        request.abort();
        reject(new Error('S3 request timed out'));
      }, S3_TIMEOUT_MS);
      request.promise().then(
        (value) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve(value);
        },
        () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(new Error('S3 request failed'));
        },
      );
    });
  }
}
