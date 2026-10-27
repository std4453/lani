import { D, opt } from '@lani/framework';
import Joi from 'joi';

export type DandanplayConfig =
  | false
  | { kind: 'publicProxy' }
  | { kind: 'official'; appId: string; appSecret: string };

// 渠道互斥，避免切换为公开代理时仍携带官方凭据。
export const dandanplayConfig = opt(
  Joi.alternatives().try(
    Joi.valid(false),
    Joi.object({ kind: Joi.string().valid('publicProxy').required() }),
    Joi.object({
      kind: Joi.string().valid('official').required(),
      appId: Joi.string().required(),
      appSecret: Joi.string().required(),
    }),
  ) as unknown as D<DandanplayConfig>,
  false,
);
