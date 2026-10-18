import { torrentsConfig } from './torrents';

it.each([undefined, {}, { nyaa: {} }])(
  'defaults every optional level for %j',
  (input) => {
    const result = torrentsConfig.validate(input);
    expect(result.error).toBeUndefined();
    expect(result.value).toEqual({ nyaa: { qps: 1 } });
  },
);

it('keeps an explicitly configured higher QPS', () => {
  expect(torrentsConfig.validate({ nyaa: { qps: 2 } }).value).toEqual({
    nyaa: { qps: 2 },
  });
});
