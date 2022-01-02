import setupMiddlewares, { SetupMiddlewaresOptions } from "@/middlewares";
import { ServiceConfig } from "@lani/api/dist/types";
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
}
