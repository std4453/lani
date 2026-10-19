import { json, RequestHandler } from "express";
import { getIntrospectionQuery, parse, print } from "graphql";
import { AuthError, createAuth } from "./index";

const introspectionQuery = print(parse(getIntrospectionQuery()));

// 在 Apollo 执行业务前拒绝请求；只有这类响应允许前端刷新后重放 mutation。
export function graphqlAuth(
  auth: ReturnType<typeof createAuth>
): RequestHandler[] {
  return [
    json(),
    async (req, res, next) => {
      try {
        if (
          req.body?.query &&
          print(parse(req.body.query)) === introspectionQuery
        )
          return next();
      } catch {
        // 无效查询继续走鉴权，由 Apollo 返回具体的语法错误。
      }
      try {
        res.locals.user = await auth.authenticate(req);
        next();
      } catch (error) {
        const code =
          error instanceof AuthError ? error.code : "AUTH_UNAVAILABLE";
        res
          .status(error instanceof AuthError ? error.status : 503)
          .set("Cache-Control", "no-store")
          .json({
            errors: [
              {
                message: "请求未通过身份验证",
                extensions: {
                  code,
                  authPhase: "gateway",
                },
              },
            ],
          });
      }
    },
  ];
}
