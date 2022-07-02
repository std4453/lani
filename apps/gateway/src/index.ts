import config from "@/config";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { getPort } from "@lani/framework";
import { ApolloServer, AuthenticationError } from "apollo-server";
import { getIntrospectionQuery, parse, print } from "graphql";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Issuer } from "openid-client";

(async () => {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: config.subgraphs,
      pollIntervalInMs: config.pollIntervalInMs,
    }),
  });

  let context: ConstructorParameters<typeof ApolloServer>[0]["context"] =
    undefined;

  if (config.auth.enabled) {
    const { issuer: issuerUrl } = config.auth;

    const issuer = await Issuer.discover(issuerUrl);
    if (!issuer.metadata.jwks_uri) {
      throw new Error("jwk_uri not found in issuer metadata");
    }
    const JWKS = createRemoteJWKSet(new URL(issuer.metadata.jwks_uri));

    const introspectionQuery = print(parse(getIntrospectionQuery()));

    context = async ({ req }) => {
      const auth = (req.headers.authorization ?? "").replace("Bearer ", "");
      try {
        const query = print(parse(req.body.query));
        if (query === introspectionQuery) {
          return {};
        }

        const { payload } = await jwtVerify(auth, JWKS, {
          issuer: issuer.metadata.issuer,
          audience:
            config.auth.enabled && config.auth.type === "audience"
              ? config.auth.audience
              : undefined,
        });
        if (config.auth.enabled) {
          const { type } = config.auth;
          if (type === "role") {
            const roles =
              (
                payload.realm_access as {
                  roles: string[];
                }
              )?.roles ?? [];
            if (!roles.includes(config.auth.role)) {
              throw new AuthenticationError("Not Authorized");
            }
          } else if (type === "group") {
            const groups = payload.groups as string[];
            if (!groups.includes(config.auth.group)) {
              throw new AuthenticationError("Not Authorized");
            }
          }
        }
      } catch (error) {
        throw new AuthenticationError("Not Authenticated");
      }
    };
  }

  const server = new ApolloServer({
    gateway,
    context,
  });

  const { url } = await server.listen(getPort(8080));

  console.log(`🚀 Server ready at ${url}`);
})();
