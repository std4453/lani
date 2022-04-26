import { loadConfigSync } from "@lani/framework";
import Joi from "joi";
import { PostGraphileOptions } from "postgraphile";

const { postgresUrl, postgraphile } = loadConfigSync<{
  postgresUrl: string;
  postgraphile?: PostGraphileOptions;
}>({
  schema: Joi.object({
    postgresUrl: Joi.string().required(),
    postgraphile: Joi.object<PostGraphileOptions>({}).pattern(
      Joi.string(),
      Joi.any()
    ),
  }),
});

export default {
  postgresUrl,
  postgraphile: {
    subscriptions: true,
    dynamicJson: true,
    enableQueryBatching: true,
    legacyRelations: "omit",
    ...postgraphile,
  } as PostGraphileOptions,
};
