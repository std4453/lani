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

interface GatewaySession {
  sub: string;
  profile: Record<string, string>;
  authorized: true;
  expiresAt: number;
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
  const sessionName = secure ? "__Host-lani-gateway" : "lani-local-gateway";
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
  const now = () => Math.floor(Date.now() / 1000);
  // The SDK authenticates/decrypts the cookie and enforces its absolute lifetime.
  // Only sessions issued after the login authorization check are accepted.
  const session = (req: Request): GatewaySession | undefined => {
    const value = (req as Request & Record<string, GatewaySession>)[
      sessionName
    ];
    return value?.authorized === true &&
      typeof value.sub === "string" &&
      typeof value.expiresAt === "number" &&
      value.expiresAt > now()
      ? value
      : undefined;
  };
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
      if (!authorized(claims)) throw new AuthError(403, "FORBIDDEN");
      // OIDC has already verified the ID token, including audience and nonce.
      const identity = req.oidc.idTokenClaims!;
      if (identity.sub !== claims.sub)
        throw new AuthError(401, "UNAUTHENTICATED");
      // Tokens are used only to establish identity and authorization at login.
      const gatewaySession: GatewaySession = {
        sub: claims.sub!,
        profile: profile(identity),
        authorized: true,
        expiresAt: now() + options.sessionMaxAge,
      };
      if (Buffer.byteLength(JSON.stringify(gatewaySession)) > 4200)
        throw new Error("Auth session exceeds cookie size limit");
      (res as unknown as Response).locals.writeAuthSession = true;
      // Retire earlier token-bearing cookies on the first successful login.
      for (const name of ["oidc", "session"]) {
        for (const suffix of ["", ".0", ".1"]) {
          (res as unknown as Response).clearCookie(
            `${secure ? "__Host-lani" : "lani-local"}-${name}${suffix}`,
            { secure, httpOnly: true, sameSite: "lax", path: "/" }
          );
        }
      }
      // The SDK's hook supports custom session data, although its types require
      // token fields. We use its cookie storage, not req.oidc token helpers.
      return gatewaySession as unknown as Session;
    },
  });
  const middleware: RequestHandler = (req, res, next) => {
    const cookie = res.cookie.bind(res);
    // The SDK rewrites even non-rolling sessions. Only login/logout may write:
    // a delayed read must not restore a cookie after the user has logged out.
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

  const router = Router();

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

  function sessionInfo(current: GatewaySession | undefined) {
    return {
      enabled: true,
      testRoutingEnabled: options.testRoutingEnabled === true,
      authenticated: !!current,
      authorized: !!current,
      profile: current?.profile,
      expiresAt: current?.expiresAt,
    };
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
      res.json(sessionInfo(session(req)));
    })
  );

  router.get(
    "/login",
    route(async (req, res) => {
      const returnTo = safeReturnTo(req.query.returnTo, origin.origin);
      const current = sessionInfo(session(req));
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
      const current = sessionInfo(session(req));
      if (current.authenticated) return res.redirect(303, "/");
      await res.oidc.callback({ redirectUri: callbackURL });
    })
  );

  router.post(
    "/logout",
    route(async (req, res) => {
      csrf(req);
      (req as Request & Record<string, unknown>)[sessionName] = undefined;
      res.locals.writeAuthSession = true;
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
    if (req.headers.authorization) {
      const match = /^Bearer (\S+)$/i.exec(req.headers.authorization);
      if (!match) throw new AuthError(401, "UNAUTHENTICATED");
      const claims = await verify(match[1]);
      if (!authorized(claims)) throw new AuthError(403, "FORBIDDEN");
      return claims;
    }
    csrf(req);
    const current = session(req);
    if (!current) throw new AuthError(401, "UNAUTHENTICATED");
    return { sub: current.sub };
  }

  return { middleware, router, authenticate };
}
