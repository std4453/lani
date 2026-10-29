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
  [key: string]: unknown;
}
export interface MatchResponse extends WorkerStatus {
  requestId: string;
  result: {
    seasonId: string | null;
    [key: string]: unknown;
  };
}
export interface CatalogState {
  schemaVersion: 1;
  active: CatalogSnapshot | null;
  desired: CatalogSnapshot;
  changedAt: string;
  dueAt: string;
}
