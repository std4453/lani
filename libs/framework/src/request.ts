import { WrappedResponse } from "@/types";
import { buildRequestURL } from "@/utils";
import { RequestFn, ServiceConfig } from "@lani/api";
import axios, { AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import rTracer from "cls-rtracer";

export interface BuildRequestOptions {
  service: ServiceConfig;
  path: string;
  config?: AxiosRequestConfig;
  tracing?: boolean;
  schema?: string;
}

export function buildRequest<Request extends {}, Response extends {}>({
  service,
  path,
  config = {},
  tracing = true,
  schema,
}: BuildRequestOptions): RequestFn<Request, Response> {
  return async (request: Request) => {
    const headers: AxiosRequestHeaders = {};

    if (tracing) {
      const requestId = rTracer.id() as string | undefined;
      if (requestId) {
        headers["x-request-id"] = requestId;
      }
    }

    const options: AxiosRequestConfig<WrappedResponse<Response>> = {
      ...config,
      headers,
    };

    const { data } = await axios.post<WrappedResponse<Response>>(
      buildRequestURL(service, path, schema ?? "http"),
      request,
      options
    );
    if (data.code !== 0 || "error" in data) {
      throw new Error("error" in data ? data.error : undefined);
    }
    return data.data;
  };
}

export function buildService<
  Service extends {
    routes: {
      [path: string]: any;
    };
  }
>(
  service: ServiceConfig,
  routes: Partial<Service["routes"]> = {},
  options: Partial<BuildRequestOptions> = {}
): Service {
  const requestCache: Partial<
    Record<keyof Service["routes"], (data: any) => Promise<any>>
  > = {};
  return {
    routes: new Proxy(
      {},
      {
        get(_target, prop) {
          if (typeof prop !== "string") return undefined;
          const path = prop as keyof Service["routes"];
          if (path in routes) {
            return routes[path];
          }
          if (path in requestCache) return requestCache[path];
          const request = buildRequest({
            ...options,
            service,
            path: prop,
          });
          requestCache[path] = request;
          return request;
        },
      }
    ),
  } as Service;
}
