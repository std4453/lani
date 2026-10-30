jest.mock('@/config', () => ({
  __esModule: true,
  default: {
    smartDownload: {
      rules: { title: { excludes: ['/test/i'] } },
      secret: 'private',
    },
    matching: {
      enabled: true,
      backend: 'external',
      endpoint: 'http://matcher',
      llm: { apiKey: 'secret', model: 'private-model' },
    },
  },
}));
import config from '@/config';
import { PublicConfigResolver } from './public-config.resolver';

const request = jest.fn();
beforeEach(() => {
  jest.useFakeTimers();
  request.mockReset();
  config.matching.enabled = true;
  config.matching.backend = 'external';
});
afterEach(() => jest.useRealTimers());
test('公开字段白名单隔离本机配置及 matcher 响应中的敏感数据，并缓存并发状态请求', async () => {
  request.mockResolvedValue({
    data: {
      protocolVersion: 2,
      mode: 'lexical',
      apiKey: 'secret',
      endpoint: 'private',
      catalog: ['private'],
    },
  });
  const resolver = new PublicConfigResolver({ request } as any);
  expect(await Promise.all([resolver.matching(), resolver.matching()])).toEqual(
    [
      { enabled: true, backend: 'external', mode: 'lexical' },
      { enabled: true, backend: 'external', mode: 'lexical' },
    ],
  );
  expect(request).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith(
    expect.objectContaining({ maxRedirects: 0, timeout: 2000, proxy: false }),
  );
  await resolver.matching();
  expect(request).toHaveBeenCalledTimes(1);
  jest.advanceTimersByTime(30000);
  request.mockResolvedValue({ data: { protocolVersion: 2, mode: 'semantic' } });
  expect((await resolver.matching()).mode).toBe('semantic');
});
test.each([
  new Error('unreachable'),
  { data: { protocolVersion: 1, mode: 'lexical' } },
  { data: { protocolVersion: 2, mode: 'unexpected' } },
])('不可用或未知协议不猜测匹配模式', async (response) => {
  if (response instanceof Error) request.mockRejectedValue(response);
  else request.mockResolvedValue(response);
  expect(await new PublicConfigResolver({ request } as any).matching()).toEqual(
    { enabled: true, backend: 'external' },
  );
});
test('关闭匹配或使用内置 LLM 时不访问外部服务', async () => {
  config.matching.enabled = false;
  expect(await new PublicConfigResolver({ request } as any).matching()).toEqual(
    { enabled: false, backend: 'external' },
  );
  config.matching.enabled = true;
  config.matching.backend = 'llm';
  expect(await new PublicConfigResolver({ request } as any).matching()).toEqual(
    { enabled: true, backend: 'llm', mode: 'llm' },
  );
  expect(request).not.toHaveBeenCalled();
});

test('公开智能下载配置只包含标题规则', () => {
  expect(
    new PublicConfigResolver({ request } as any).smartDownloadTitleExcludes(),
  ).toEqual(['/test/i']);
});
