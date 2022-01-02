import { ServiceConfig } from "@lani/api/build/types";

export function buildRequestURL(
  service: ServiceConfig,
  path: string,
  schema: string = "http"
) {
  return `${schema}://${service.svc}.${service.namespace}:${service.port}${path}`;
}
