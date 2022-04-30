import path from "path";

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

export function resolveChroot(pathname: string) {
  if (env !== "dev" || !process.env.TELEPRESENCE_ROOT) {
    return pathname;
  }
  // 绝对路径需要 chroot，相对路径不需要，与 path.resolve 相反
  if (path.isAbsolute(pathname)) {
    return path.join(process.env.TELEPRESENCE_ROOT, pathname);
  } else {
    return pathname;
  }
}
