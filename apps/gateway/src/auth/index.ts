import { Request, Response, Router, NextFunction } from "express";
import {
  createRemoteJWKSet,
  jwtVerify,
  JWTPayload,
  errors as joseErrors,
} from "jose";
import { Issuer, generators, TokenSet, errors, custom } from "openid-client";
import jmespath from "jmespath";
import { AuthCookies } from "./cookies";

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
  // Keycloak endpoints are deterministic. No discovery/network request on startup.
  const issuer = new Issuer({
    issuer: authority,
    authorization_endpoint: endpoint(authority, "auth"),
    token_endpoint: endpoint(backend, "token"),
    jwks_uri: endpoint(backend, "certs"),
    revocation_endpoint: endpoint(backend, "revoke"),
  });
  const client = new issuer.Client({
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uris: [callbackURL],
    response_types: ["code"],
    token_endpoint_auth_method: "client_secret_basic",
  });
  client[custom.http_options] = (httpOptions) => ({
    ...httpOptions,
    timeout: 5000,
  });
  issuer[custom.http_options] = (httpOptions) => ({
    ...httpOptions,
    timeout: 5000,
  });
  const jwks = createRemoteJWKSet(new URL(endpoint(backend, "certs")), {
    timeoutDuration: 5000,
  });
  const cookies = new AuthCookies(options.cookieKeys, origin.origin, secure);
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

  async function sessionInfo(session: JWTPayload | undefined) {
    if (!session || typeof session.at !== "string")
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: false,
        refreshRequired: false,
      };
    try {
      const claims = await verify(session.at);
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: true,
        authorized: authorized(claims),
        profile: session.profile,
        expiresAt: claims.exp,
        refreshRequired:
          claims.exp! <= now() + 30 && typeof session.rt === "string",
      };
    } catch (error) {
      if (!(error instanceof AuthError) || error.status !== 401) throw error;
      return {
        enabled: true,
        testRoutingEnabled: options.testRoutingEnabled === true,
        authenticated: false,
        refreshRequired: typeof session.rt === "string",
      };
    }
  }

  async function makeSession(tokens: TokenSet, previous?: JWTPayload) {
    if (!tokens.access_token) throw new AuthError(401, "UNAUTHENTICATED");
    const claims = await verify(tokens.access_token);
    const identity = tokens.id_token ? tokens.claims() : undefined;
    if (
      (identity && identity.sub !== claims.sub) ||
      (previous && previous.sub !== claims.sub)
    )
      throw new AuthError(401, "UNAUTHENTICATED");
    const refreshExpires =
      typeof tokens.refresh_expires_in === "number" &&
      tokens.refresh_expires_in > 0
        ? now() + tokens.refresh_expires_in
        : Infinity;
    const rt = tokens.refresh_token || previous?.rt;
    const absoluteUntil =
      typeof previous?.absoluteUntil === "number"
        ? previous.absoluteUntil
        : now() + options.sessionMaxAge;
    return {
      at: tokens.access_token,
      ...(typeof rt === "string" ? { rt } : {}),
      sub: claims.sub,
      profile: identity
        ? profile(identity)
        : previous?.profile || profile(claims),
      absoluteUntil,
      // Keycloak's refresh_expires_in may be an idle timeout that slides on refresh.
      // Keep that separate from the application's fixed absolute lifetime.
      exp: Math.min(absoluteUntil, rt ? refreshExpires : claims.exp!),
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
      res.json(await sessionInfo(await cookies.read(req, "session")));
    })
  );

  router.get(
    "/login",
    route(async (req, res) => {
      const returnTo = safeReturnTo(req.query.returnTo, origin.origin);
      const current = await sessionInfo(await cookies.read(req, "session"));
      if (current.authenticated) return res.redirect(303, returnTo);
      const state = generators.state();
      const nonce = generators.nonce();
      const verifier = generators.codeVerifier();
      // Separate transaction cookies allow two tabs to start login independently.
      await cookies.write(
        res,
        `login-${state}`,
        { state, nonce, verifier, returnTo },
        now() + 600
      );
      res.redirect(
        302,
        client.authorizationUrl({
          scope: options.scope,
          state,
          nonce,
          code_challenge: generators.codeChallenge(verifier),
          code_challenge_method: "S256",
        })
      );
    })
  );

  router.get(
    "/callback",
    route(async (req, res) => {
      const state =
        typeof req.query.state === "string" &&
        /^[a-zA-Z0-9_-]{16,128}$/.test(req.query.state)
          ? req.query.state
          : "invalid";
      const transaction = await cookies.read(req, `login-${state}`);
      const returnTo = safeReturnTo(transaction?.returnTo, origin.origin);
      try {
        const current = await sessionInfo(await cookies.read(req, "session"));
        if (current.authenticated) {
          cookies.clear(res, `login-${state}`);
          return res.redirect(303, returnTo);
        }
        if (!transaction || transaction.state !== state)
          throw new AuthError(401, "INVALID_CALLBACK");
        const tokens = await client.callback(
          callbackURL,
          client.callbackParams(req),
          {
            state,
            nonce: transaction.nonce as string,
            code_verifier: transaction.verifier as string,
            response_type: "code",
          }
        );
        const session = await makeSession(tokens);
        await cookies.write(res, "session", session, session.exp);
        cookies.clear(res, `login-${state}`);
        res.redirect(303, returnTo);
      } catch {
        cookies.clear(res, `login-${state}`);
        // Never leave a consumed code in the address bar, or repeatedly auto-login on failure.
        res.redirect(303, "/?auth_error=login_failed");
      }
    })
  );

  router.post(
    "/refresh",
    route(async (req, res) => {
      csrf(req);
      const session = await cookies.read(req, "session");
      const info = await sessionInfo(session);
      if (info.authenticated && !info.refreshRequired) return res.json(info);
      if (!session || typeof session.rt !== "string")
        throw new AuthError(401, "UNAUTHENTICATED");
      try {
        const updated = await makeSession(
          await client.refresh(session.rt),
          session
        );
        await cookies.write(res, "session", updated, updated.exp);
        res.json(await sessionInfo(updated));
      } catch (error) {
        // Leave cookies intact: a concurrent successful response may already have replaced them.
        if (error instanceof errors.OPError && error.error === "invalid_grant")
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
      const session = await cookies.read(req, "session");
      cookies.clear(res, "session");
      // Local logout still works if accounts is temporarily unavailable.
      if (typeof session?.rt === "string")
        await client.revoke(session.rt, "refresh_token").catch(() => undefined);
      res.json({ redirectTo: "/?signed_out=1" });
    })
  );

  router.use(
    (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
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
      const session = await cookies.read(req, "session");
      token = typeof session?.at === "string" ? session.at : undefined;
    }
    if (!token) throw new AuthError(401, "UNAUTHENTICATED");
    const claims = await verify(token);
    if (!authorized(claims)) throw new AuthError(403, "FORBIDDEN");
    return claims;
  }

  return { router, authenticate };
}
