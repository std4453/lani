import { Command } from "@oclif/core";
import { resolveCommand } from "../../types";
import { loadLaniConfig } from "../../utils/laniconfig";
import { resolveProjectConfig } from "../../utils/project";

export default class Build extends Command {
  static description = "Start project";

  async run(): Promise<void> {
    const project = resolveProjectConfig();
    const config = await loadLaniConfig(project);
    const startFn = resolveCommand(config.type, "start");
    await startFn(project, config);
  }
}
