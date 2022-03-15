import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import { dataServerService } from "@lani/api";
import { App } from "@lani/framework";
import { postgraphile } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import config from "./config";

const app = new App();
app.setupMiddlewares();
app.app.use(
  postgraphile(config.postgresUrl, "public", {
    ...config.postgraphile,
    appendPlugins: [OmitArchivedPlugin, ConnectionFilterPlugin],
  })
);
app.start(dataServerService);
