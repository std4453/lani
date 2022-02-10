import { NormalError } from "@/error";
import { WrappedResponse } from "@/types";
import { isLeft } from "fp-ts/lib/Either";
import { IncomingHttpHeaders } from "http";
import * as t from "io-ts";
import Router from "koa-router";

export interface RequestHandler<Request, Response> {
  (
    req: Request,
    options: {
      headers: IncomingHttpHeaders;
    }
  ): Promise<Response>;
}

export function buildRoute<Request, Response>(
  reqType: t.Type<Request>,
  // TODO: response schema checking
  _resType: t.Type<Response>,
  handler: RequestHandler<Request, Response>
): Router.IMiddleware {
  return async (ctx) => {
    const decoded = reqType.decode(ctx.request.body);
    if (isLeft(decoded)) {
      const response: WrappedResponse<Response> = {
        code: 400,
        error: `Error for keys: ${decoded.left
          .map(({ context }) => context.map(({ key }) => key).join("."))
          .join(", ")}`,
      };
      ctx.status = 400;
      ctx.body = response;
    } else {
      const request = decoded.right;
      try {
        const response: WrappedResponse<Response> = {
          code: 0,
          data: await handler(request, {
            headers: ctx.headers,
          }),
        };
        ctx.status = 200;
        ctx.body = response;
      } catch (error) {
        if (error instanceof NormalError) {
          const response: WrappedResponse<Response> = {
            code: error.code,
            error: error.message,
          };
          ctx.status = 200;
          ctx.body = response;
        } else {
          console.error(error);
          const response: WrappedResponse<Response> = {
            code: 500,
            error: "Internal Server Error",
          };
          ctx.status = 500;
          ctx.body = response;
        }
      }
    }
  };
}
