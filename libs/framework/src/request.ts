import { WrappedResponse } from "@/types";
import { buildRequestURL } from "@/utils";
import { RequestFn, ServiceConfig } from "@lani/api/dist/types";
import axios, { AxiosRequestConfig } from "axios";
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
    const options: AxiosRequestConfig<WrappedResponse<Response>> = {
      ...config,
      headers: {},
    };

    if (tracing) {
      const requestId = rTracer.id() as string | undefined;
      if (requestId) {
        options.headers["x-request-id"] = requestId;
      }
    }

    const { data } = await axios.post<WrappedResponse<Response>>(
      buildRequestURL(service, path, schema ?? "http"),
      request,
      options
    );
    const { code, error, data: response } = data;
    if (code !== 0) {
      throw new Error(error);
    }
    return response;
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
