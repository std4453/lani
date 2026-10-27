import { OpenAPI } from './generated/core/OpenAPI';

// 在生成代码之外配置客户端，避免重新生成时丢失鉴权适配。
export function configureJellyfinClient({
  apiEndpoint,
  apiToken,
}: {
  apiEndpoint: string;
  apiToken: string;
}) {
  OpenAPI.BASE = apiEndpoint.replace(/\/+$/, '');
  OpenAPI.HEADERS = {
    Authorization: `MediaBrowser Token="${encodeURIComponent(apiToken)}"`,
  };
}
