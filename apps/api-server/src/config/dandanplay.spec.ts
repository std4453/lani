import { dandanplayConfig } from './dandanplay';

it('未配置或显式false时禁用', () => {
  expect(dandanplayConfig.validate(undefined).value).toBe(false);
  expect(dandanplayConfig.validate(false).value).toBe(false);
  expect(dandanplayConfig.validate(true).error).toBeDefined();
});

it('官方渠道必须提供应用ID和密钥', () => {
  const input = { kind: 'official', appId: 'test-app', appSecret: 'test-key' };
  expect(dandanplayConfig.validate(input).error).toBeUndefined();
  expect(dandanplayConfig.validate({ kind: 'official' }).error).toBeDefined();
  expect(
    dandanplayConfig.validate({ ...input, appSecret: '' }).error,
  ).toBeDefined();
});

it('公开代理拒绝官方凭据及未知渠道', () => {
  expect(
    dandanplayConfig.validate({
      kind: 'publicProxy',
      appId: 'test-app',
      appSecret: 'test-key',
    }).error,
  ).toBeDefined();
  expect(dandanplayConfig.validate({ kind: 'unknown' }).error).toBeDefined();
});
