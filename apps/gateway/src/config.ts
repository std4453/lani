import { ServiceEndpointDefinition } from "@apollo/gateway";
import { loadConfigSync, mergeConfig } from "@lani/framework";
import Joi from "joi";

export interface GatewayAuthConfig {
  issuer: string;
  audience: string;
  role: string;
}

export default loadConfigSync<{
  subgraphs: ServiceEndpointDefinition[];
  pollIntervalInMs?: number;
  auth:
    | {
        enabled: false;
      }
    | ({
        enabled: true;
      } & GatewayAuthConfig);
}>({
  schema: Joi.object({
    subgraphs: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().required(),
        })
      )
      .required(),
    pollIntervalInMs: Joi.number(),
    auth: Joi.alternatives()
      .try(
        Joi.object({
          enabled: Joi.boolean().falsy().required(),
        }),
        Joi.object({
          enabled: Joi.boolean().truthy().required(),
          issuer: Joi.string().required(),
          audience: Joi.string().required(),
          role: Joi.string().required(),
        })
      )
      .required(),
  }),
});
