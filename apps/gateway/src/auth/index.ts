import {
  Request,
  Response,
  Router,
  NextFunction,
  RequestHandler,
  CookieOptions,
} from "express";
import {
  createRemoteJWKSet,
  jwtVerify,
  JWTPayload,
  errors as joseErrors,
} from "jose";
import { auth as oidcAuth, Session } from "express-openid-connect";
import jmespath from "jmespath";

export interface AuthOptions {
  testRoutingEnabled?: boolean;
  authority: string;
  backchannelAuthority: string;
  publicOrigin: string;
  clientId: string;
  audience: string;
  scope: string;
  sessionMaxAge: number;
  authz?: { enabled: boolean; query?: string; result?: unknown };
  clientSecret: string;
  cookieKeys: string[];
}

export class AuthError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

export function safeReturnTo(value: unknown, origin: string) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  )
    return "/";
  const url = new URL(value, origin);
  if (
    url.origin !== origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname === "/redirect"
  )
    return "/";
  for (const key of [
    "code",
    "state",
    "session_state",
    "iss",
    "auth_error",
    "signed_out",
  ])
    url.searchParams.delete(key);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function createAuth(options: AuthOptions) {
  const origin = new URL(options.publicOrigin);
  const secure = origin.protocol === "https:";
  if (
    (!secure &&
      !(
        origin.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)
      )) ||
    origin.href !== `${origin.origin}/`
  ) {
    throw new Error(
      "auth.publicOrigin must be an HTTPS origin (HTTP is allowed only on loopback)"
    );
  }
  if (!options.clientSecret) throw new Error("OIDC client secret is required");
  const authority = options.authority.replace(/\/$/, "");
  const backend = options.backchannelAuthority.replace(/\/$/, "");
  const endpoint = (base: string, name: string) =>
    `${base}/protocol/openid-connect/${name}`;
  const callbackURL = `${origin.origin}/api/gateway/auth/callback`;
  const sessionName = secure ? "__Host-lani-oidc" : "lani-local-oidc";
  const transactionName = `${sessionName}-login`;
  const jwks = createRemoteJWKSet(new URL(endpoint(backend, "certs")), {
    timeoutDuration: 5000,
  });
  if (
    !options.cookieKeys.length ||
    options.cookieKeys.some(
      (key) =>
        !/^[A-Za-z0-9+/]{43}=$/.test(key) ||
        Buffer.from(key, "base64").length !== 32
    )
  )
    throw new Error("auth.cookieKeys must contain base64-encoded 32-byte keys");
  const session = (req: Request): Session | undefined =>
    (req as Request & Record<string, Session>)[sessionName];
  const sdk = oidcAuth({
    issuerBaseURL: authority,
    baseURL: origin.origin,
    clientID: options.clientId,
    clientSecret: options.clientSecret,
    // Keycloak 15 does not decode percent-encoded IDs in OAuth Basic auth.
    clientAuthMethod: "client_secret_post",
    secret: options.cookieKeys,
    authRequired: false,
    idpLogout: false,
    legacySameSiteCookie: false,
    httpTimeout: 5000,
    routes: { login: false, logout: false, callback: false },
    authorizationParams: {
      response_type: "code",
      response_mode: "query",
      scope: options.scope,
    },
    session: {
      name: sessionName,
      rolling: false,
      absoluteDuration: options.sessionMaxAge,
      cookie: { secure, httpOnly: true, sameSite: "Lax", path: "/" },
    },
    transactionCookie: { name: transactionName, sameSite: "Lax" },
    // Keep the canonical public issuer. Only server-to-server requests use the
    // cluster address; deterministic Keycloak metadata avoids discovery outages.
    customFetch: async (input, init) => {
      const url = String(input);
      if (url === `${authority}/.well-known/openid-configuration`) {
        return new globalThis.Response(
          JSON.stringify({
            issuer: authority,
            authorization_endpoint: endpoint(authority, "auth"),
            token_endpoint: endpoint(authority, "token"),
            jwks_uri: endpoint(authority, "certs"),
            response_types_supported: ["code"],
            subject_types_supported: ["public"],
            id_token_signing_alg_values_supported: ["RS256"],
            token_endpoint_auth_methods_supported: ["client_secret_post"],
            code_challenge_methods_supported: ["S256"],
          }),
          { headers: { "content-type": "application/json" } }
        );
      }
      for (const name of ["token", "certs"]) {
        if (url === endpoint(authority, name))
          return fetch(endpoint(backend, name), init);
      }
      throw new Error("Unexpected OIDC backchannel endpoint");
    },
    getLoginState: (_req, login) => ({
      returnTo: login.returnTo,
      startedAt: now(),
    }),
    afterCallback: async (req, res, updated, state) => {
      if (typeof state.startedAt !== "number" || state.startedAt + 600 < now())
        throw new AuthError(401, "INVALID_CALLBACK");
      state.returnTo = safeReturnTo(state.returnTo, origin.origin);
      const claims = await verify(updated.access_token);
      const { payload: identity } = await jwtVerify(updated.id_token, jwks, {
        issuer: authority,
        audience: options.clientId,
        algorithms: ["RS256"],
      });
      if (identity.sub !== claims.sub)
        throw new AuthError(401, "UNAUTHENTICATED");
      updated.sub = claims.sub;
      updated.profile = profile(identity);
      checkSize(updated);
      (res as unknown as Response).locals.writeAuthSession = true;
      // Retire cookies issued by the previous implementation during migration.
      for (const suffix of [".0", ".1"]) {
        (res as unknown as Response).clearCookie(
          `${secure ? "__Host-lani-session" : "lani-local-session"}${suffix}`,
          {
            secure,
            httpOnly: true,
            sameSite: "lax",
            path: "/",
          }
        );
      }
      return updated;
    },
  });
  const middleware: RequestHandler = (req, res, next) => {
    const cookie = res.cookie.bind(res);
    // The SDK rewrites even non-rolling sessions. A stale read/failed refresh
    // must not overwrite a concurrently rotated refresh token in the browser.
    res.cookie = ((name: string, value: string, opts: unknown) => {
      if (
        (name === sessionName || name.startsWith(`${sessionName}.`)) &&
        !res.locals.writeAuthSession
      )
        return res;
      return cookie(name, value, opts as CookieOptions);
    }) as Response["cookie"];
    sdk(req, res, (error?: unknown) => {
      if (!error) return next();
      res.locals.writeAuthSession = false;
      if (req.path.endsWith("/callback"))
        return res.redirect(303, "/?auth_error=login_failed");
      res.status(503).json({ error: "AUTH_UNAVAILABLE" });
    });
  };

  function checkSize(value: Session) {
    // Leave room for JWE expansion, cookie attributes and the login transaction.
    if (Buffer.byteLength(JSON.stringify(value)) > 4200)
      throw new Error("Auth session exceeds cookie size limit");
  }
  const router = Router();
  const now = () => Math.floor(Date.now() / 1000);

  async function verify(token: string) {
    try {
      const { payload } = await jwtVerify(token, jwks, {
        issuer: authority,
        audience: options.audience,
        algorithms: ["RS256"],
      });
      if (!payload.sub || !payload.exp)
        throw new AuthError(401, "UNAUTHENTICATED");
      return payload;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      if (
        error instanceof joseErrors.JWTClaimValidationFailed ||
        error instanceof joseErrors.JWTExpired ||
        error instanceof joseErrors.JWTInvalid ||
        error instanceof joseErrors.JWSInvalid ||
        error instanceof joseErrors.JWSSignatureVerificationFailed ||
        error instanceof joseErrors.JOSEAlgNotAllowed
      ) {
        throw new AuthError(401, "UNAUTHENTICATED");
      }
      throw new AuthError(503, "AUTH_UNAVAILABLE");
    }
  }

  function authorized(payload: JWTPayload) {
    return (
      !options.authz?.enabled ||
      jmespath.search(payload, options.authz.query!) === options.authz.result
    );
  }

  function csrf(req: Request) {
    // Custom header prevents form submissions; Origin also excludes sibling subdomains.
    if (
      req.headers["x-lani-csrf"] !== "1" ||
      req.headers.origin !== origin.origin
    ) {
      throw new AuthError(403, "INVALID_ORIGIN");
    }
  }

  function profile(claims: JWTPayload) {
    const result: Record<string, string> = {};
    for (const key of [
      "sub",
      "name",
      "nickname",
      "preferred_username",
      "email",
      "picture",
      "profile",
    ]) {
      if (typeof claims[key] === "string") result[key] = claims[key] as string;
    }
    return result;
  }

  async function sessionInfo(session: Session | undefined) {
    if (!session || typeof session.access_token !== "string")
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: false,
        refreshRequired: false,
      };
    try {
      const claims = await verify(session.access_token);
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: true,
        authorized: authorized(claims),
        profile: session.profile,
        expiresAt: claims.exp,
        refreshRequired:
          claims.exp! <= now() + 30 &&
          typeof session.refresh_token === "string",
      };
    } catch (error) {
      if (!(error instanceof AuthError) || error.status !== 401) throw error;
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: false,
        refreshRequired: typeof session.refresh_token === "string",
      };
    }
  }

  const route =
    (handler: (req: Request, res: Response) => Promise<unknown>) =>
    (req: Request, res: Response, next: NextFunction) => {
      handler(req, res).catch(next);
    };

  router.use((_req, res, next) => {
    res.set({
      "Cache-Control": "no-store",
      Pragma: "no-cache",
      "Referrer-Policy": "no-referrer",
    });
    next();
  });

  router.get(
    "/session",
    route(async (req, res) => {
      res.json(await sessionInfo(session(req)));
    })
  );

  router.get(
    "/login",
    route(async (req, res) => {
      const returnTo = safeReturnTo(req.query.returnTo, origin.origin);
      const current = await sessionInfo(session(req));
      if (current.authenticated) return res.redirect(303, returnTo);
      await res.oidc.login({
        returnTo,
        authorizationParams: { redirect_uri: callbackURL },
      });
    })
  );

  router.get(
    "/callback",
    route(async (req, res) => {
      const current = await sessionInfo(session(req));
      if (current.authenticated) return res.redirect(303, "/");
      await res.oidc.callback({ redirectUri: callbackURL });
    })
  );

  router.post(
    "/refresh",
    route(async (req, res) => {
      csrf(req);
      const current = session(req);
      const info = await sessionInfo(current);
      if (info.authenticated && !info.refreshRequired) return res.json(info);
      if (!current || typeof current.refresh_token !== "string")
        throw new AuthError(401, "UNAUTHENTICATED");
      try {
        const previousSub = current.sub;
        await req.oidc.accessToken!.refresh();
        const updated = session(req)!;
        const claims = await verify(updated.access_token);
        if (claims.sub !== previousSub)
          throw new AuthError(401, "UNAUTHENTICATED");
        checkSize(updated);
        res.locals.writeAuthSession = true;
        res.json(await sessionInfo(updated));
      } catch (error) {
        // Leave cookies intact: a concurrent successful response may already have replaced them.
        if ((error as { error?: string }).error === "invalid_grant")
          throw new AuthError(401, "UNAUTHENTICATED");
        if (error instanceof AuthError) throw error;
        throw new AuthError(503, "AUTH_UNAVAILABLE");
      }
    })
  );

  router.post(
    "/logout",
    route(async (req, res) => {
      csrf(req);
      const current = session(req);
      (req as Request & Record<string, unknown>)[sessionName] = undefined;
      res.locals.writeAuthSession = true;
      // Local logout remains available during an accounts outage.
      if (typeof current?.refresh_token === "string") {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          await fetch(endpoint(backend, "revoke"), {
            method: "POST",
            body: new URLSearchParams({
              client_id: options.clientId,
              client_secret: options.clientSecret,
              token: current.refresh_token,
              token_type_hint: "refresh_token",
            }),
            signal: controller.signal,
          });
        } catch {
          /* Revocation is best effort; local logout must still succeed. */
        } finally {
          clearTimeout(timeout);
        }
      }
      res.json({ redirectTo: "/?signed_out=1" });
    })
  );

  router.use(
    (error: unknown, req: Request, res: Response, _next: NextFunction) => {
      if (req.path === "/callback") {
        res.locals.writeAuthSession = false;
        return res.redirect(303, "/?auth_error=login_failed");
      }
      res.status(error instanceof AuthError ? error.status : 503).json({
        error: error instanceof AuthError ? error.code : "AUTH_UNAVAILABLE",
      });
    }
  );

  async function authenticate(req: Request) {
    let token: string | undefined;
    if (req.headers.authorization) {
      const match = /^Bearer (\S+)$/i.exec(req.headers.authorization);
      if (!match) throw new AuthError(401, "UNAUTHENTICATED");
      token = match[1];
    } else {
      csrf(req);
      const current = session(req);
      token =
        typeof current?.access_token === "string"
          ? current.access_token
          : undefined;
    }
    if (!token) throw new AuthError(401, "UNAUTHENTICATED");
    const claims = await verify(token);
    if (!authorized(claims)) throw new AuthError(403, "FORBIDDEN");
    return claims;
  }

  return { middleware, router, authenticate };
}
