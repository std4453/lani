import { loadConfigSync } from "@lani/framework";
import Joi from "joi";
import { AuthOptions } from "./auth";

export interface Config {
  subgraphs: { name: string; url: string }[];
  debug: { pollIntervalInMs?: number; testRoutingEnabled?: boolean };
  imageProxy: { upstream?: string };
  auth: { enabled: false } | (AuthOptions & { enabled: true });
}

export const subgraphs = Joi.array()
  .items(
    Joi.object({
      name: Joi.string().required(),
      url: Joi.string().uri().required(),
    })
  )
  .required();

export const debug = Joi.object({
  pollIntervalInMs: Joi.number().positive(),
  testRoutingEnabled: Joi.boolean(),
}).default({});

export const imageProxy = Joi.object({ upstream: Joi.string().uri() }).default(
  {}
);

export const authz = Joi.alternatives()
  .try(
    Joi.object({ enabled: Joi.valid(false).required() }),
    Joi.object({
      enabled: Joi.valid(true).required(),
      query: Joi.string().required(),
      result: Joi.any().required(),
    })
  )
  .default({ enabled: false });

export const auth = Joi.alternatives()
  .try(
    Joi.object({ enabled: Joi.valid(false).required() }),
    Joi.object({
      enabled: Joi.valid(true).required(),
      authority: Joi.string()
        .uri({ scheme: ["https", "http"] })
        .required(),
      backchannelAuthority: Joi.string()
        .uri({ scheme: ["https", "http"] })
        .required(),
      publicOrigin: Joi.string()
        .uri({ scheme: ["https", "http"] })
        .required(),
      clientId: Joi.string().required(),
      audience: Joi.string().required(),
      scope: Joi.string()
        .pattern(/(?:^|\s)openid(?:\s|$)/)
        .default("openid profile email"),
      sessionMaxAge: Joi.number().integer().min(60).max(2592000).default(28800),
      clientSecret: Joi.string().required(),
      cookieKeys: Joi.array().items(Joi.string().required()).min(1).required(),
      authz,
    })
  )
  .default({ enabled: false });

export const schema = Joi.object({ subgraphs, debug, imageProxy, auth });

export default loadConfigSync<Config>({ schema });
