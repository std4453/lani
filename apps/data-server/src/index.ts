import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import FederationPlugin from "@graphile/federation";
import { dataServerService } from "@lani/api";
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
  })
);
app.listen(dataServerService.port);
