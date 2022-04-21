export type Env = "dev" | "offline" | "pre" | "prod";

function getEnv(): Env {
  if (process.env.NODE_ENV === "development") {
    return "dev";
  } else if (process.env.NODE_ENV === "offline") {
    return "offline";
  } else if (process.env.NODE_ENV === "staging") {
    return "pre";
  } else {
    return "prod";
  }
}

export const env: Env = getEnv();
