import { LaniConfig } from "../generated/laniconf";
import { ProjectConfig } from "../utils/project";

export interface TypeBuildFn {
  (project: ProjectConfig, config: LaniConfig): Promise<void>;
}

export interface TypeDevFn {
  (project: ProjectConfig, config: LaniConfig): void;
}

export interface TypeStartFn {
  (project: ProjectConfig, config: LaniConfig): void;
}

export type Commands = Partial<{
  build: TypeBuildFn;
  dev: TypeDevFn;
  start: TypeStartFn;
}>;
