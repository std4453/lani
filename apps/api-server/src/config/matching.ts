import { bool, D, num, obj, opt, str, T } from '@lani/framework';
import Joi from 'joi';

const stageParameters = Joi.object({
  model: Joi.forbidden(),
  messages: Joi.forbidden(),
  stream: Joi.forbidden(),
  response_format: Joi.forbidden(),
})
  .unknown(true)
  .required() as unknown as D<Record<string, unknown>>;

export const matchingLlmConfig = obj({
  apiBase: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required() as unknown as D<string>,
  apiKey: str(),
  model: str(),
  deadlineMs: opt(
    Joi.number().integer().positive().required() as unknown as D<number>,
    100000,
  ),
  fallbackEnabled: opt(bool(), true),
  firstParameters: opt(stageParameters, {}),
  reviewParameters: opt(stageParameters, {}),
});

export type MatchingLlmConfig = T<typeof matchingLlmConfig>;

const matching = obj({
  enabled: opt(bool(), false),
  backend: opt(
    Joi.string().valid('external', 'llm').required() as unknown as D<
      'external' | 'llm'
    >,
    'external',
  ),
  endpoint: opt(str().allow(''), ''),
  llm: opt(matchingLlmConfig),
  timezone: opt(str(), 'Asia/Shanghai'),
  previousQuarters: opt(num(), 0),
  nextQuarters: opt(num(), 0),
  timeoutMs: opt(num(), 120000),
  catalogDebounceMs: opt(
    Joi.number()
      .integer()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER)
      .required() as unknown as D<number>,
    30 * 60 * 1000,
  ),
});

export const matchingConfig = opt(
  matching.when(
    Joi.object({
      enabled: Joi.boolean().valid(true).required(),
      backend: Joi.valid('llm').required(),
    }).unknown(),
    { then: Joi.object({ llm: matchingLlmConfig.required() }) },
  ) as typeof matching,
  {
    enabled: false,
    backend: 'external',
    endpoint: '',
    timezone: 'Asia/Shanghai',
    previousQuarters: 0,
    nextQuarters: 0,
    timeoutMs: 120000,
    catalogDebounceMs: 30 * 60 * 1000,
  },
);
