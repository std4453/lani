export interface CatalogSeason {
  id: string;
  title: string;
  aliases: string[];
  year: number | null;
  quarter: number | null;
  episodes?: { number: number; airDate: string }[];
}
export interface CatalogSnapshot {
  version: string;
  catalog: CatalogSeason[];
}
export interface MatchQuery {
  aliases: string[];
  publishedAt: string;
  episode?: number;
}
export interface WorkerStatus {
  protocolVersion: 1;
  catalogVersion: string | null;
  modelVersion: string;
  mode: 'lexical' | 'semantic';
}
export interface MatchResponse extends WorkerStatus {
  requestId: string;
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
