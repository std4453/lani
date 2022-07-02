import { ServiceEndpointDefinition } from "@apollo/gateway";
import { loadConfigSync, mergeConfig } from "@lani/framework";
import Joi from "joi";

type WithEnabled<T> =
  | {
      enabled: false;
    }
  | ({
      enabled: true;
    } & T);

interface GroupAuthorization {
  type: "group";
  group: string;
}

interface RoleAuthorization {
  type: "role";
  role: string;
}

interface AudienceAuthorization {
  type: "audience";
  audience: string;
}

type AuthorizationConfig =
  | GroupAuthorization
  | RoleAuthorization
  | AudienceAuthorization;

type AuthConfig = {
  issuer: string;
} & AuthorizationConfig;

export interface ConfigType {
  subgraphs: ServiceEndpointDefinition[];
  pollIntervalInMs?: number;
  auth: WithEnabled<AuthConfig>;
}

export default loadConfigSync<ConfigType>({
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
          type: Joi.string().valid("group").required(),
          group: Joi.string().required(),
        }),
        Joi.object({
          enabled: Joi.boolean().truthy().required(),
          issuer: Joi.string().required(),
          type: Joi.string().valid("role").required(),
          role: Joi.string().required(),
        }),
        Joi.object({
          enabled: Joi.boolean().truthy().required(),
          issuer: Joi.string().required(),
          type: Joi.string().valid("audience").required(),
          audience: Joi.string().required(),
        })
      )
      .required(),
  }),
});
