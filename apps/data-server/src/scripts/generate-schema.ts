import { postgresUrl } from "@/config";
import { writeFile } from "fs/promises";
import { printSchema } from "graphql";
import { createPostGraphileSchema } from "postgraphile";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";

(async () => {
  const schema = await createPostGraphileSchema(postgresUrl, "public", {
    appendPlugins: [ConnectionFilterPlugin],
  });
  const schemaString = printSchema(schema);

  const schemaPath = "generated/schema.graphql";
  await writeFile(schemaPath, schemaString, "utf-8");
})();
