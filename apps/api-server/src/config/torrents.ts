import { num, obj, opt } from '@lani/framework';

export const torrentsConfig = opt(
  obj({ nyaa: opt(obj({ qps: opt(num(), 1) }), { qps: 1 }) }),
  { nyaa: { qps: 1 } },
);
