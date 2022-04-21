import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import FederationPlugin from "@graphile/federation";
import Koa from "koa";
import { postgraphile } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import config from "./config";

const app = new Koa();
app.use(
  postgraphile(config.postgresUrl, "public", {
    ...config.postgraphile,
    appendPlugins: [
      OmitArchivedPlugin,
      ConnectionFilterPlugin,
      FederationPlugin,
    ],
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  })
);
app.listen(8080);
