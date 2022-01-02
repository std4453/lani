const { writeFile } = require("fs/promises");
const { compileFromFile } = require("json-schema-to-typescript");
const path = require("path");

(async () => {
  const ts = await compileFromFile(
    path.resolve(__dirname, "../src/schema/laniconf.schema.json")
  );
  await writeFile(
    path.resolve(__dirname, "../src/generated/laniconf.d.ts"),
    ts
  );
  console.log(
    "Typescript type generated at",
    path.resolve(__dirname, "../src/generated/laniconf.d.ts")
  );
})();
