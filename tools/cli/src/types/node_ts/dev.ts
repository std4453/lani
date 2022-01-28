import inclusion from "inclusion";
import { TypeDevFn } from "../commands";

const dev: TypeDevFn = async (_project, config) => {
  const nodemon = require.resolve("nodemon/bin/nodemon.js");
  const tsnode = require.resolve("ts-node/dist/bin.js");

  const { execaNode } = await inclusion("execa");

  const entrypoint = config.node?.entry ?? "src/index.ts";

  const proc = execaNode(
    nodemon,
    ["--watch", "src", "--ext", "ts,js,json", "--exec", tsnode, entrypoint],
    {
      env: {
        NODE_ENV: "development",
      },
    }
  );
  proc.stdout?.pipe(process.stdout);
  proc.stderr?.pipe(process.stderr);
  process.stdin.pipe(proc.stdin!);
  await proc;
};

export default dev;
