import { env } from "@/env";
import setupMiddlewares, { SetupMiddlewaresOptions } from "@/middlewares";
import { ServiceConfig } from "@lani/api";
import Koa from "koa";
import Router from "koa-router";

export function buildApp<
  Service extends {
    routes: {
      [x: string]: any;
    };
  }
>(
  routes: Record<keyof Service["routes"], Router.IMiddleware>,
  middlewares: SetupMiddlewaresOptions = {}
) {
  const app = new Koa();
  setupMiddlewares(app, middlewares);
  const router = new Router();
  for (const path in routes) {
    router.post(path, routes[path]);
  }
  app.use(router.routes()).use(router.allowedMethods());
  return app;
}

export function startApp(app: Koa, service: ServiceConfig) {
  app.listen(service.port);
  if (process.env.NODE_ENV === "development") {
    console.log("Service listening on port", service.port);
  } else {
    console.log("Service started");
    console.log("env:", env);
    console.log("service: ", service);
  }
}
