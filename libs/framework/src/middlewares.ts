import { createLogger } from "@/logger";
import rTracer from "cls-rtracer";
import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";

export function bodyParserMiddleware() {
  return bodyParser({
    enableTypes: ["json"],
    encoding: "utf-8",
  });
}

export function requestIdMiddleware() {
  return rTracer.koaMiddleware({
    useHeader: true,
  });
}

export function corsMiddleware() {
  return cors();
}

export interface SetupMiddlewaresOptions {
  logger?: boolean;
  tracing?: boolean;
  cors?: boolean;
  setup?: (app: Koa) => void;
}

function setupMiddlewares(
  app: Koa,
  {
    logger = true,
    tracing = true,
    cors = false,
    setup,
  }: SetupMiddlewaresOptions
) {
  app.use(bodyParserMiddleware());
  if (tracing) {
    app.use(requestIdMiddleware());
  }
  if (cors) {
    app.use(corsMiddleware());
  }
  if (logger) {
    const log = createLogger({ tracing });
    app.use(async (ctx, next) => {
      try {
        log(
          "-->",
          ctx.method,
          ctx.path + ctx.search,
          ctx.headers.host,
          ctx.headers["user-agent"]
        );
        await next();
        log(
          "<--",
          ctx.method,
          ctx.path + ctx.search,
          ctx.headers.host,
          ctx.headers["user-agent"],
          ctx.status,
          ctx.length,
          ctx.response.headers["content-type"]
        );
      } catch (e) {
        log(
          "-x-",
          ctx.method,
          ctx.path + ctx.search,
          ctx.headers.host,
          ctx.headers["user-agent"],
          ctx.status,
          ctx.length,
          ctx.response.headers["content-type"]
        );
      }
    });
  }
  if (setup) {
    setup(app);
  }
}

export default setupMiddlewares;
