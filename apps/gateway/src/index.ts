import config from "@/config";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer, AuthenticationError } from "apollo-server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Issuer } from "openid-client";

(async () => {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: config.subgraphs,
      pollIntervalInMs: 3000,
    }),
  });

  const issuer = await Issuer.discover(config.issuer);
  if (!issuer.metadata.jwks_uri) {
    throw new Error("jwk_uri not found in issuer metadata");
  }
  const JWKS = createRemoteJWKSet(new URL(issuer.metadata.jwks_uri));

  const server = new ApolloServer({
    gateway,
    context: async ({ req }) => {
      const auth = (req.headers.authorization ?? "").replace("Bearer ", "");
      try {
        const { payload } = await jwtVerify(auth, JWKS, {
          issuer: issuer.metadata.issuer,
          audience: config.audience,
        });
        const roles =
          (
            payload.realm_access as {
              roles: string[];
            }
          )?.roles ?? [];
        if (!roles.includes(config.role)) {
          throw new AuthenticationError("Not Authorized");
        }
      } catch (error) {
        throw new AuthenticationError("Not Authenticated");
      }
    },
  });

  server.listen(8080).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
