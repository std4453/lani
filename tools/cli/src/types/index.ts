import { LaniConfig } from "../generated/laniconf";
import { Commands } from "./commands";
import lib_ts from "./lib_ts";

export type LaniProjectType = NonNullable<LaniConfig["type"]>;

export const types: Partial<Record<LaniProjectType, Commands>> = {
  "lib:ts": lib_ts,
};

export function resolveCommand(
  type: LaniProjectType,
  command: keyof Commands
): NonNullable<Commands[typeof command]> {
  if (!types[type]?.[command]) {
    throw new Error(`command ${command} for type ${type} is not supported`);
  }
  return types[type]?.[command]!;
}
