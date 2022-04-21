import { env, Env } from "@/env";

export interface WithBaseConfig<BaseConfig> {
  <EnvConfig>(envConfig?: Partial<Record<Env, EnvConfig>>): BaseConfig &
    Partial<EnvConfig>;
}

export function mergeConfig<BaseConfig>(
  baseConfig: BaseConfig
): WithBaseConfig<BaseConfig> {
  return (envConfig) => ({ ...baseConfig, ...envConfig?.[env] });
}
