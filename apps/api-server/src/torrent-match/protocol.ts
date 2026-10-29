export interface CatalogSeason {
  id: string;
  title: string;
  aliases: string[];
  year: number | null;
  quarter: number | null;
  declaredEpisodeCount?: number | null;
  premiereDate?: string | null;
}
export interface CatalogSnapshot {
  version: string;
  catalog: CatalogSeason[];
}
export interface MatchQuery {
  rawTitle: string;
  aliases: string[];
  publishedAt: string;
  episode?: number;
  publisherSeason?: number;
}
export interface WorkerStatus {
  protocolVersion: 2;
  catalogVersion: string | null;
  modelVersion: string;
  mode: string;
}
export interface MatchDiagnostics {
  elapsedMs: number;
  attempts: {
    stage: 'primary' | 'fallback';
    attempt: number;
    model?: string;
    elapsedMs: number;
    promptTokens?: number;
    completionTokens?: number;
    cacheHitTokens?: number;
    cacheMissTokens?: number;
    reasoningTokens?: number;
    error?: string;
  }[];
  promptHashes?: { primary?: string; fallback?: string };
}
export interface MatchResponse extends WorkerStatus {
  requestId: string;
  decision: {
    stage: 'primary' | 'fallback';
    fallbackReason?: string;
  };
  diagnostics?: MatchDiagnostics;
  result: {
    seasonId: string | null;
    reason?: string | null;
    score?: number | null;
  };
}
export interface CatalogState {
  schemaVersion: 1;
  active: CatalogSnapshot | null;
  desired: CatalogSnapshot;
  changedAt: string;
  dueAt: string;
}
