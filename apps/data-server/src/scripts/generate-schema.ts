import config from "@/config";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";
import { createPostGraphileSchema } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

import SubtitleInfoPlugin from "../subtitle-info-plugin";

(async () => {
  const schema = await createPostGraphileSchema(config.postgresUrl, "public", {
    appendPlugins: [ConnectionFilterPlugin, SubtitleInfoPlugin],
  });
  const schemaString = printSchema(schema);

  const schemaPath = "generated/schema.graphql";
  await writeFile(schemaPath, schemaString, "utf-8");
})();
