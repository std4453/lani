import path from "path";

export interface ProjectConfig {
  path: string;
  cliPath: string;
  monorepoRoot: string;
}

export function resolveProjectConfig(): ProjectConfig {
  const projectRoot = path.resolve(__dirname, "../..");
  console.log(process.cwd(), projectRoot);
  return {
    path: process.cwd(),
    cliPath: projectRoot,
    monorepoRoot: path.resolve(projectRoot, "../.."),
  };
}
