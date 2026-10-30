import { LocalAxiosService } from '@/common/axios.service';
import config from '@/config';
import { ResolveField, Resolver } from '@nestjs/graphql';
import { AdminConfig, PublicMatchingConfig } from './index.model';

/** 公开配置逐项投影；外部服务状态及配置对象都不能直接透传。 */
@Resolver(() => AdminConfig)
export class PublicConfigResolver {
  private cached?: { expires: number; value: PublicMatchingConfig };
  private pending?: Promise<PublicMatchingConfig>;

  constructor(private readonly http: LocalAxiosService) {}

  @ResolveField(() => [String])
  smartDownloadTitleExcludes(): string[] {
    return config.smartDownload?.rules.title.excludes ?? [];
  }

  @ResolveField(() => PublicMatchingConfig)
  matching(): Promise<PublicMatchingConfig> {
    if (this.cached && this.cached.expires > Date.now())
      return Promise.resolve(this.cached.value);
    if (this.pending) return this.pending;
    this.pending = this.readMatching()
      .then((value) => {
        this.cached = { expires: Date.now() + 30000, value };
        return value;
      })
      .finally(() => {
        this.pending = undefined;
      });
    return this.pending;
  }

  private async readMatching(): Promise<PublicMatchingConfig> {
    const { enabled, backend, endpoint } = config.matching;
    const value: PublicMatchingConfig = { enabled, backend };
    if (!enabled) return value;
    if (backend === 'llm') return { ...value, mode: 'llm' };
    try {
      const { data } = await this.http.request({
        url: `${endpoint.replace(/\/$/, '')}/v2/status`,
        method: 'GET',
        timeout: 2000,
        proxy: false,
        maxRedirects: 0,
        maxContentLength: 65536,
      });
      if (
        data?.protocolVersion === 2 &&
        ['lexical', 'semantic', 'llm'].includes(data.mode)
      )
        value.mode = data.mode;
    } catch {
      // 模式未知时不猜测词法模式，也不阻断其余公开配置。
    }
    return value;
  }
}
