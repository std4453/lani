import { createPostGraphileSchema } from "postgraphile";
import { printSchema } from "graphql";
import config from "@/config";
import { writeFile } from "fs/promises";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

(async () => {
  const schema = await createPostGraphileSchema(
    config.postgresUrl ?? "",
    "public",
    {
      appendPlugins: [ConnectionFilterPlugin],
    }
  );
  const schemaString = printSchema(schema);

  const schemaPath = "generated/schema.graphql";
  await writeFile(schemaPath, schemaString, "utf-8");
})();
