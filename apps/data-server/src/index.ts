import config from "@/config";
import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import FederationPlugin from "@graphile/federation";
import { env, getPort } from "@lani/framework";
import Koa from "koa";
import { postgraphile, PostGraphileOptions } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import PgOrderByRelatedPlugin from "@graphile-contrib/pg-order-by-related";

const options: PostGraphileOptions = {
  subscriptions: true,
  dynamicJson: true,
  enableQueryBatching: true,
  legacyRelations: "omit",
  appendPlugins: [
    OmitArchivedPlugin,
    ConnectionFilterPlugin,
    FederationPlugin,
    PgOrderByRelatedPlugin,
  ],
  graphileBuildOptions: {
    connectionFilterRelations: true,
    orderByRelatedColumnAggregates: true,
  },
  ...config.postgraphile,
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
const middleware = postgraphile(config.postgresUrl, "public", options);
app.use(middleware);
const server = app.listen(getPort(8080));
let stopping = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    if (stopping) return;
    stopping = true;
    // Stop accepting requests, drain HTTP connections, then release PostgreSQL.
    server.close(() => {
      middleware.release().then(
        () => process.exit(0),
        () => process.exit(1)
      );
    });
  });
}
