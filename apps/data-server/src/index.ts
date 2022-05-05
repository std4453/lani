import {
  postgraphile as confPostgraphileOptions,
  postgresUrl as confPostgresUrl,
} from "@/config";
import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import FederationPlugin from "@graphile/federation";
import { env, getPort } from "@lani/framework";
import Koa from "koa";
import { postgraphile, PostGraphileOptions } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

const options: PostGraphileOptions = {
  subscriptions: true,
  dynamicJson: true,
  enableQueryBatching: true,
  legacyRelations: "omit",
  appendPlugins: [OmitArchivedPlugin, ConnectionFilterPlugin, FederationPlugin],
  graphileBuildOptions: {
    connectionFilterRelations: true,
  },
  ...confPostgraphileOptions,
  // 开发模式启用 graphiql
  ...(env === "dev"
    ? {
        graphiql: true,
        enhanceGraphiql: true,
        allowExplain: true,
      }
    : undefined),
};

const app = new Koa();
app.use(postgraphile(confPostgresUrl, "public", options));
app.listen(getPort(8080));
