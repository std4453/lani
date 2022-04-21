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

  async run(): Promise<void> {
    const {
      flags: { image, env },
    } = await this.parse(Manifest);

    const content = await fs.readFile(
      path.join("manifests", `${env}.yaml.hbs`),
      "utf-8"
    );
    const render = Handlebars.compile(content);
    const yaml = render({ image });
    await fs.writeFile(path.join("manifests", `${env}.yaml`), yaml);
    console.log(
      `Written manifest for env "${kleur.white(env)}" to ${kleur.yellow(
        `manifests/${env}.yaml}`
      )}`
    );
  }
}
