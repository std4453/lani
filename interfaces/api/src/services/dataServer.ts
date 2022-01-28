import { buildServiceConfig } from "@/utils";

/**
 * dummy service, delegate to postgraphile
 */
export type DataServerService = {
  routes: {};
};

/**
 * dummy service, delegate to postgraphile
 */
export const dataServerService = buildServiceConfig({
  svc: "data-server",
});
