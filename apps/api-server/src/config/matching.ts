import { bool, num, obj, opt, str } from '@lani/framework';

export const matchingConfig = opt(
  obj({
    enabled: opt(bool(), false),
    endpoint: opt(str().allow(''), ''),
    timezone: opt(str(), 'Asia/Shanghai'),
    previousQuarters: opt(num(), 0),
    nextQuarters: opt(num(), 0),
    timeoutMs: opt(num(), 120000),
  }),
  {
    enabled: false,
    endpoint: '',
    timezone: 'Asia/Shanghai',
    previousQuarters: 0,
    nextQuarters: 0,
    timeoutMs: 120000,
  },
);
