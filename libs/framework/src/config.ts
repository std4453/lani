import { env, Env } from "@/env";
import fs from "fs";
import Joi from "joi";
import * as yaml from "js-yaml";

export interface WithBaseConfig<BaseConfig> {
  <EnvConfig>(envConfig?: Partial<Record<Env, EnvConfig>>): BaseConfig &
    Partial<EnvConfig>;
}

export function mergeConfig<BaseConfig>(
  baseConfig: BaseConfig
): WithBaseConfig<BaseConfig> {
  return (envConfig) => ({ ...baseConfig, ...envConfig?.[env] });
}

export interface LoadConfigOptions<T = any> {
  filename?: string;
  schema?: Joi.AnySchema<T>;
  envOverrideFilename?: boolean;
}

function validateConfig<T = any>(
  doc: unknown,
  { schema }: LoadConfigOptions<T>
): T {
  if (schema) {
    const result = schema.validate(doc);
    if (result.error) {
      throw result.error;
    } else {
      return result.value;
    }
  } else {
    // 没有检查
    return doc as T;
  }
}

function loadConfigFilename<T>({
  filename = "config.yaml",
  envOverrideFilename = true,
}: LoadConfigOptions<T>) {
  if (envOverrideFilename) {
    const filenameFromEnv = process.env.CONFIG_FILENAME;
    if (filenameFromEnv) {
      return filenameFromEnv;
    }
  }
  return filename;
}

export function loadConfigSync<T = any>(options: LoadConfigOptions<T> = {}): T {
  const filename = loadConfigFilename(options);
  const content = fs.readFileSync(filename, "utf-8");
  const doc = yaml.load(content, {
    filename,
  });
  return validateConfig(doc, options);
}

export async function loadConfig<T = any>(
  options: LoadConfigOptions<T> = {}
): Promise<T> {
  const filename = loadConfigFilename(options);
  const content = await fs.promises.readFile(filename, "utf-8");
  const doc = yaml.load(content, {
    filename,
  });
  return validateConfig(doc, options);
}
