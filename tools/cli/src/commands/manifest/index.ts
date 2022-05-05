import { Command, Flags } from "@oclif/core";
import fs from "fs/promises";
import Handlebars from "handlebars";
import kleur from "kleur";
import path from "path";

export default class Manifest extends Command {
  static description = "Generate manifest for deployment";

  static flags = {
    image: Flags.string({
      multiple: false,
      required: true,
      env: "LANI_MANIFEST_IMAGE",
    }),
    env: Flags.string({
      multiple: false,
      required: true,
      env: "LANI_MANIFEST_ENV",
      options: ["offline", "prerelease", "production"],
    }),
  };

  async traverse(
    root: string,
    variables: Record<string, string>
  ): Promise<void> {
    const entries = await fs.readdir(path.join("manifests", root), {
      withFileTypes: true,
    });
    for (const entry of entries) {
      const fullPath = path.join("manifests", root, entry.name);
      if (entry.isDirectory()) {
        await this.traverse(fullPath, variables);
      } else {
        const hbsRegex = /^(.*)\.hbs$/;
        const result = entry.name.match(hbsRegex);
        if (result) {
          const filename = result[1];
          const content = await fs.readFile(fullPath, "utf-8");
          const render = Handlebars.compile(content);
          const yaml = render(variables);
          const writePath = path.join("manifests", root, filename);
          await fs.writeFile(writePath, yaml);
          console.log(`${kleur.cyan(fullPath)} -> ${kleur.yellow(writePath)}`);
        } else {
          // 忽略文件
        }
      }
    }
  }

  async run(): Promise<void> {
    const {
      flags: { image, env },
    } = await this.parse(Manifest);

    await this.traverse(env, { image });
    console.log(`Generated manifest for env "${kleur.white(env)}"`);
  }
}
