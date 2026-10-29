import {
  CatalogSnapshot,
  MatchQuery,
  MatchResponse,
  WorkerStatus,
} from './protocol';

/** 季度匹配的统一接口；目录持久化和业务结果提交由调用方负责。 */
export interface MatcherBackend {
  load(catalog: CatalogSnapshot): Promise<WorkerStatus>;
  match(
    catalog: CatalogSnapshot,
    query: MatchQuery,
    candidateIds: string[],
    requestId: string,
  ): Promise<MatchResponse>;
  close(): Promise<void>;
}
