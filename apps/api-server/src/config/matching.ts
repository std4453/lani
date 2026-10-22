import { bool, D, num, obj, opt, str } from '@lani/framework';

export const matchingConfig = opt(
  obj({
    enabled: opt(bool(), false),
    endpoint: opt(str().allow(''), ''),
    timezone: opt(str(), 'Asia/Shanghai'),
    previousQuarters: opt(num(), 0),
    nextQuarters: opt(num(), 0),
    timeoutMs: opt(num(), 120000),
    catalogDebounceMs: opt(
      num().custom((value, helpers) =>
        Number.isSafeInteger(value) && value >= 0
          ? value
          : helpers.error('any.invalid'),
      ) as D<number>,
      30 * 60 * 1000,
    ),
  }),
  {
    enabled: false,
    endpoint: '',
    timezone: 'Asia/Shanghai',
    previousQuarters: 0,
    nextQuarters: 0,
    timeoutMs: 120000,
    catalogDebounceMs: 30 * 60 * 1000,
  },
);
