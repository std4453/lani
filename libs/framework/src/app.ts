import { env } from "@/env";
import setupMiddlewares, { SetupMiddlewaresOptions } from "@/middlewares";
import { ServiceConfig } from "@lani/api";
import Koa from "koa";
import Router from "koa-router";

export class App {
  readonly app = new Koa();
  readonly router = new Router();

  constructor() {}

  setupMiddlewares(middlewares: SetupMiddlewaresOptions = {}) {
    setupMiddlewares(this.app, middlewares);
    return this;
  }

  setupRouter() {
    this.app.use(this.router.routes()).use(this.router.allowedMethods());
    return this;
  }

  setupRoutes<
    Service extends {
      routes: {
        [x: string]: any;
      };
    } = {
      routes: Record<string, any>;
    }
  >(
    routes: Record<
      keyof Service["routes"],
      | Router.IMiddleware
      | {
          method: "get" | "post" | "put" | "del" | "head" | "patch";
          handler: Router.IMiddleware;
        }
    >
  ) {
    for (const path in routes) {
      const route = routes[path];
      if ("method" in route) {
        this.router[route.method](path, route.handler);
      } else {
        this.router.post(path, route);
      }
    }
    return this;
  }

  start(service: ServiceConfig) {
    this.app.listen(service.port);
    if (process.env.NODE_ENV === "development") {
      console.log("Service listening on port", service.port);
    } else {
      console.log("Service started");
      console.log("env:", env);
      console.log("service: ", service);
    }
  }
}
