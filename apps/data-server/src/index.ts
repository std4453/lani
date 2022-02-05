import OmitArchivedPlugin from "@graphile-contrib/pg-omit-archived";
import { dataServerService, DataServerService } from "@lani/api";
import { buildApp, startApp } from "@lani/framework";
import { postgraphile } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import config from "./config";

const app = buildApp<DataServerService>(
  {},
  {
    cors: true,
    setup(app) {
      app.use(
        postgraphile(config.postgresUrl, "public", {
          ...config.postgraphile,
          appendPlugins: [OmitArchivedPlugin, ConnectionFilterPlugin],
        })
      );
    },
  }
);

startApp(app, dataServerService);
