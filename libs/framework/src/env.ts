export type Env = "dev" | "offline" | "pre" | "prod";

function getEnv(): Env {
  if (process.env.NODE_ENV === "development") {
    return "dev";
  } else {
    // TODO: more env
    return "prod";
  }
}

export const env: Env = getEnv();
