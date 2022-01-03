import inclusion from "inclusion";
import { TypeDevFn } from "../commands";

const dev: TypeDevFn = async () => {
  const nodemon = require.resolve("nodemon/bin/nodemon.js");
  const tsnode = require.resolve("ts-node/dist/bin.js");

  const { execaNode } = await inclusion("execa");

  const proc = execaNode(nodemon, [
    "--watch",
    "src",
    "--exec",
    tsnode,
    "src/index.ts",
  ]);
  proc.stdout?.pipe(process.stdout);
  proc.stderr?.pipe(process.stderr);
  process.stdin.pipe(proc.stdin!);
  await proc;
};

export default dev;
