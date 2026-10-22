import { matchingConfig } from './matching';
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
