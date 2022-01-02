import { access, readFile, stat } from "fs/promises";
import path from "path";
import { LaniConfig } from "../generated/laniconf";
import { ProjectConfig } from "./project";
import { Validator } from "jsonschema";
import schema from "../schema/laniconf.schema.json";

export async function findLaniConfigFile(
  project: ProjectConfig
): Promise<string | undefined> {
  try {
    const filename = path.resolve(project.path, "laniconf.json");
    await access(filename);
    return filename;
  } catch (e) {
    return undefined;
  }
}

export async function loadLaniConfig(
  project: ProjectConfig
): Promise<LaniConfig> {
  const configFile = await findLaniConfigFile(project);
  if (!configFile) {
    throw new Error("laniconf.json not found");
  }
  const configJSON = JSON.parse(await readFile(configFile, "utf-8"));
  const validator = new Validator();
  const result = validator.validate(configJSON, schema, {
    throwAll: true,
  });
  return result.instance as LaniConfig;
}
