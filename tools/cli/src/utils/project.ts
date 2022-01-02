import { readFileSync } from "fs";
import path from "path";

export interface ProjectConfig {
  packageName: string;
  path: string;
  cliPath: string;
  monorepoRoot: string;
}

export function resolveProjectConfig(): ProjectConfig {
  const projectRoot = path.resolve(__dirname, "../..");
  const packageJsonText = readFileSync(
    path.resolve(process.cwd(), "./package.json"),
    "utf-8"
  );
  const packageJson = JSON.parse(packageJsonText);
  return {
    packageName: packageJson.name,
    path: process.cwd(),
    cliPath: projectRoot,
    monorepoRoot: path.resolve(projectRoot, "../.."),
  };
}
