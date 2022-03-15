import { mergeConfig } from "@lani/framework";
import { PostGraphileOptions } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";

export default mergeConfig({})<{
  postgresUrl: string;
  postgraphile: PostGraphileOptions;
}>({
  dev: {
    postgresUrl:
      "postgres://postgres:a*qLweVSC!4yRvBNP%405VGfyR@10.43.222.73:5432/lani-offline",
    postgraphile: {
      subscriptions: true,
      dynamicJson: true,
      setofFunctionsContainNulls: true,
      ignoreRBAC: true,
      showErrorStack: "json",
      extendedErrors: ["hint", "detail", "errcode"],
      graphiql: true,
      enhanceGraphiql: true,
      allowExplain: true,
      enableQueryBatching: true,
      legacyRelations: "omit",
      watchPg: true,
      exportGqlSchemaPath: "./generated/schema.graphql",
    },
  },
  offline: {
    postgresUrl:
      "postgres://postgres:a*qLweVSC!4yRvBNP%405VGfyR@data-postgresql.postgres:5432/lani-offline",
    postgraphile: {
      subscriptions: true,
      dynamicJson: true,
      setofFunctionsContainNulls: true,
      ignoreRBAC: true,
      showErrorStack: "json",
      extendedErrors: ["hint", "detail", "errcode"],
      graphiql: true,
      enhanceGraphiql: true,
      allowExplain: true,
      enableQueryBatching: true,
      legacyRelations: "omit",
      watchPg: true,
      externalUrlBase: "/api/data-server",
    },
  },
  prod: {
    postgresUrl:
      "postgres://postgraphile:3KS0n*TXW4!VYYC!%24gFc25mM@data-postgresql.postgres:5432/lani",
    postgraphile: {
      subscriptions: true,
      retryOnInitFail: true,
      dynamicJson: true,
      setofFunctionsContainNulls: false,
      ignoreRBAC: false,
      extendedErrors: ["errcode"],
      appendPlugins: [PgSimplifyInflectorPlugin],
      graphiql: false,
      enableQueryBatching: true,
      disableQueryLog: true,
      legacyRelations: "omit",
      externalUrlBase: "/api/data-server",
    },
  },
});
