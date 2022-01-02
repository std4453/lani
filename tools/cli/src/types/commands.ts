import { LaniConfig } from "../generated/laniconf";
import { ProjectConfig } from "../utils/project";

export interface TypeBuildFn {
  (project: ProjectConfig, config: LaniConfig): Promise<void>;
}

export type Commands = Partial<{
  build: TypeBuildFn;
}>;
