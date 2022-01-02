import { createLogger } from "@/logger";
import rTracer from "cls-rtracer";
import Koa from "koa";
import bodyParser from "koa-bodyparser";

export function bodyParserMiddleware() {
  return bodyParser({
    enableTypes: ["json"],
    encode: "utf-8",
  });
}

export function requestIdMiddleware() {
  return rTracer.koaMiddleware({
    // default settings
  });
}

export interface SetupMiddlewaresOptions {
  logger?: boolean;
  tracing?: boolean;
}

function setupMiddlewares(
  app: Koa,
  { logger = true, tracing = true }: SetupMiddlewaresOptions
) {
  app.use(bodyParserMiddleware());
  if (tracing) {
    app.use(requestIdMiddleware());
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
}

export default setupMiddlewares;
