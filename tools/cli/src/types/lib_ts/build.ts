import inclusion from "inclusion";
import { TypeBuildFn } from "../commands";

const build: TypeBuildFn = async (
  _proj,
  { "lib:ts": { buildTsConfig } = {} }
) => {
  const ttscBinPath = require.resolve("ttypescript/bin/tsc");

  const { execaNode } = await inclusion("execa");

  const proc = execaNode(
    ttscBinPath,
    buildTsConfig ? ["--project", buildTsConfig] : undefined
  );
  proc.stdout?.pipe(process.stdout);
  proc.stderr?.pipe(process.stderr);
  await proc;
};

export default build;
