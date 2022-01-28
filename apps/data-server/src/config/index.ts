import { mergeConfig } from "@lani/framework";
import { PostGraphileOptions } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";

export default mergeConfig({})<{
  postgresUrl: string;
  postgraphile: PostGraphileOptions;
}>({
  dev: {
    postgresUrl:
      "postgres://postgraphile:3KS0n*TXW4!VYYC!%24gFc25mM@10.43.222.73:5432/lani",
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
    },
  },
  prod: {
    postgresUrl:
      "postgres://postgraphile:3KS0n*TXW4!VYYC!%24gFc25mM@10.43.222.73:5432/lani",
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
    },
  },
});
