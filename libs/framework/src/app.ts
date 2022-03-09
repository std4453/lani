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
    }
  >(routes: Record<keyof Service["routes"], Router.IMiddleware>) {
    for (const path in routes) {
      this.router.post(path, routes[path]);
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
