import { ServiceConfig } from "@lani/api";

export function buildRequestURL(
  service: ServiceConfig,
  path: string,
  schema: string = "http"
) {
  return `${schema}://${service.svc}.${service.namespace}:${service.port}${path}`;
}
