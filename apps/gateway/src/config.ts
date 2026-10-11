import { loadConfigSync } from "@lani/framework";
import Joi from "joi";
import { AuthOptions } from "./auth";

export interface Config {
  subgraphs: { name: string; url: string }[];
  debug: { pollIntervalInMs?: number; testRoutingEnabled?: boolean };
  imageProxy: { upstream?: string };
  auth:
    | { enabled: false }
    | (Omit<AuthOptions, "clientSecret" | "cookieKeys"> & {
        enabled: true;
        clientSecretEnv: string;
        cookieKeysEnv: string;
      });
}

export const schema = Joi.object({
  subgraphs: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        url: Joi.string().uri().required(),
      })
    )
    .required(),
  debug: Joi.object({
    pollIntervalInMs: Joi.number().positive(),
    testRoutingEnabled: Joi.boolean(),
  }).default({}),
  imageProxy: Joi.object({ upstream: Joi.string().uri() }).default({}),
  auth: Joi.alternatives()
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
        sessionMaxAge: Joi.number()
          .integer()
          .min(60)
          .max(2592000)
          .default(604800),
        clientSecretEnv: Joi.string().default("LANI_OIDC_CLIENT_SECRET"),
        cookieKeysEnv: Joi.string().default("LANI_AUTH_COOKIE_KEYS"),
        authz: Joi.alternatives()
          .try(
            Joi.object({ enabled: Joi.valid(false).required() }),
            Joi.object({
              enabled: Joi.valid(true).required(),
              query: Joi.string().required(),
              result: Joi.any().required(),
            })
          )
          .default({ enabled: false }),
      })
    )
    .default({ enabled: false }),
});

export default loadConfigSync<Config>({ schema });
