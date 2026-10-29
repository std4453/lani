import { D, obj, opt, T } from '@lani/framework';
import Joi from 'joi';

export const llmConfig = opt(
  obj({
    concurrency: opt(
      Joi.number().integer().min(1).required() as unknown as D<number>,
      2,
    ),
    timeoutMs: opt(
      Joi.number()
        .integer()
        .positive()
        .max(2147483647)
        .required() as unknown as D<number>,
      45000,
    ),
  }),
  { concurrency: 2, timeoutMs: 45000 },
);

export type LlmConfig = T<typeof llmConfig>;
