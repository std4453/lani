import { Command } from "@oclif/core";
import { resolveCommand } from "../../types";
import { loadLaniConfig } from "../../utils/laniconfig";
import { resolveProjectConfig } from "../../utils/project";

export default class Build extends Command {
  static description = "Start Project Dev Server";

  async run(): Promise<void> {
    const project = resolveProjectConfig();
    const config = await loadLaniConfig(project);
    const devFn = resolveCommand(config.type, "dev");
    await devFn(project, config);
  }
}
