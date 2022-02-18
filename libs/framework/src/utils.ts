import { env, Env } from "@/env";
import { ServiceConfig } from "@lani/api";

export const namespaceMap: Record<Env, string> = {
  dev: "lani-offline",
  offline: "lani-offline",
  pre: "lani",
  prod: "lani",
};

export function buildRequestURL(
  service: ServiceConfig,
  path: string,
  schema: string = "http"
) {
  return `${schema}://${service.svc}.${namespaceMap[env]}:${service.port}${path}`;
}
