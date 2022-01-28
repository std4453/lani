import { buildApp, startApp } from "@lani/framework";
import { postgraphile } from "postgraphile";
import { dataServerService, DataServerService } from "@lani/api";
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
          appendPlugins: [ConnectionFilterPlugin],
        })
      );
    },
  }
);

startApp(app, dataServerService);
