import { DEFAULT_NAMESPACE, DEFAULT_PORT } from "@/constants";
import { ServiceConfig } from "@/types";

export function buildServiceConfig({
  svc,
  namespace,
  port,
}: {
  svc: string;
  namespace?: string;
  port?: number;
}): ServiceConfig {
  return {
    svc,
    namespace: namespace ?? DEFAULT_NAMESPACE,
    port: port ?? DEFAULT_PORT,
  };
}
