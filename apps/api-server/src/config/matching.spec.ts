import { matchingConfig, matchingLlmConfig } from './matching';
import { validatePolicy } from '../torrent-match/catalog';

it.each([undefined, {}])(
  'keeps matching off when unconfigured: %j',
  (input) => {
    const { value, error } = matchingConfig.validate(input);
    expect(error).toBeUndefined();
    expect(value).toMatchObject({
      enabled: false,
      endpoint: '',
      previousQuarters: 0,
      nextQuarters: 0,
      catalogDebounceMs: 1800000,
    });
  },
);

it('accepts an HTTP worker without owning its runtime configuration', () => {
  expect(
    matchingConfig.validate({ enabled: true, endpoint: 'http://worker:8090' })
      .value,
  ).toMatchObject({ enabled: true, endpoint: 'http://worker:8090' });
  expect(matchingConfig.validate({ enabled: 'invalid' }).error).toBeDefined();
});

it.each([-1, 0.5, 9, NaN])(
  'rejects invalid adjacent-quarter counts: %s',
  (previousQuarters) => {
    expect(() =>
      validatePolicy({
        timezone: 'Asia/Shanghai',
        previousQuarters,
        nextQuarters: 0,
      }),
    ).toThrow();
  },
);

it.each([0, 5000, 60000])(
  'accepts a %i ms catalog debounce',
  (catalogDebounceMs) => {
    const { value, error } = matchingConfig.validate({ catalogDebounceMs });
    expect(error).toBeUndefined();
    expect(value.catalogDebounceMs).toBe(catalogDebounceMs);
  },
);

it.each([-1, 0.5, NaN, Infinity, 'invalid'])(
  'rejects invalid catalog debounce: %s',
  (catalogDebounceMs) => {
    expect(matchingConfig.validate({ catalogDebounceMs }).error).toBeDefined();
  },
);

it('外部后端为默认值，旧配置不需要 LLM 字段', () => {
  const { value, error } = matchingConfig.validate({
    enabled: true,
    endpoint: 'http://worker:8090',
  });
  expect(error).toBeUndefined();
  expect(value.backend).toBe('external');
  expect(value.llm).toBeUndefined();
});

it('清理模型密钥首尾空白', () => {
  const { error, value } = matchingLlmConfig.validate({
    apiBase: 'https://provider.example',
    apiKey: ' \tsynthetic\r\n',
    model: 'example',
  });
  expect(error).toBeUndefined();
  expect(value.apiKey).toBe('synthetic');
});

it.each(['bad\nkey', 'bad key', 'bad\u007fkey', 'bad密钥', ' \t'])(
  '拒绝不能用于授权头的模型密钥，且不回显其值',
  (apiKey) => {
    const { error } = matchingLlmConfig.validate({
      apiBase: 'https://provider.example',
      apiKey,
      model: 'example',
    });
    expect(error).toBeDefined();
    expect(error?.message).not.toContain(apiKey);
  },
);

it('仅在启用内置后端时要求匹配模型配置', () => {
  expect(
    matchingConfig.validate({ enabled: true, backend: 'llm' }).error,
  ).toBeDefined();
  expect(
    matchingConfig.validate({ enabled: false, backend: 'llm' }).error,
  ).toBeUndefined();
  const { value, error } = matchingConfig.validate({
    enabled: true,
    backend: 'llm',
    llm: {
      apiBase: 'https://provider.example/v1',
      apiKey: 'synthetic',
      model: 'example',
    },
  });
  expect(error).toBeUndefined();
  expect(value.llm).toEqual({
    apiBase: 'https://provider.example/v1',
    apiKey: 'synthetic',
    model: 'example',
    deadlineMs: 100000,
    fallbackEnabled: true,
    firstParameters: {},
    reviewParameters: {},
  });
});

it.each([
  { backend: 'unknown' },
  { llm: { apiBase: 'not-a-url', apiKey: 'synthetic', model: 'example' } },
  {
    llm: {
      apiBase: 'ftp://provider.example',
      apiKey: 'synthetic',
      model: 'example',
    },
  },
  { llm: { apiBase: 'https://provider.example', model: 'example' } },
  { llm: { apiBase: 'https://provider.example', apiKey: 'synthetic' } },
  {
    llm: {
      apiBase: 'https://provider.example',
      apiKey: 'synthetic',
      model: 'example',
      deadlineMs: 0,
    },
  },
  {
    llm: {
      apiBase: 'https://provider.example',
      apiKey: 'synthetic',
      model: 'example',
      deadlineMs: 1.5,
    },
  },
  {
    llm: {
      apiBase: 'https://provider.example',
      apiKey: 'synthetic',
      model: 'example',
      firstParameters: [],
    },
  },
])('通过配置 schema 拒绝无效模型配置 %j', (input) => {
  expect(matchingConfig.validate(input).error).toBeDefined();
});

it('保留供应商阶段参数并接受显式关闭回退', () => {
  const firstParameters = { thinking: { type: 'disabled' } };
  const reviewParameters = {
    thinking: { type: 'enabled' },
    reasoning_effort: 'high',
  };
  const { value, error } = matchingConfig.validate({
    enabled: true,
    backend: 'llm',
    llm: {
      apiBase: 'https://provider.example',
      apiKey: 'synthetic',
      model: 'example',
      fallbackEnabled: false,
      firstParameters,
      reviewParameters,
    },
  });
  expect(error).toBeUndefined();
  expect(value.llm).toMatchObject({
    fallbackEnabled: false,
    firstParameters,
    reviewParameters,
  });
});

it('字符串形式的启用值经过 Joi 转换后仍需完整模型配置', () => {
  expect(
    matchingConfig.validate({ enabled: 'true', backend: 'llm' }).error,
  ).toBeDefined();
  expect(
    matchingConfig.validate({ enabled: 'false', backend: 'llm' }).error,
  ).toBeUndefined();
});

it.each(['firstParameters', 'reviewParameters'])(
  '%s 不允许覆盖固定协议字段',
  (field) => {
    for (const fixed of ['model', 'messages', 'stream', 'response_format']) {
      expect(
        matchingConfig.validate({
          enabled: true,
          backend: 'llm',
          llm: {
            apiBase: 'https://provider.example',
            apiKey: 'synthetic',
            model: 'example',
            [field]: { [fixed]: 'override' },
          },
        }).error,
      ).toBeDefined();
    }
  },
);
