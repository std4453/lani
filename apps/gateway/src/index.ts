import config from "@/config";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { getPort } from "@lani/framework";
import { getIntrospectionQuery, parse, print } from "graphql";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { Issuer } from "openid-client";
import jmespath from "jmespath";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ContextFunction,
  AuthenticationError,
} from "apollo-server-core";
import express from "express";
import http from "http";
import { createImageProxy } from "./image-proxy";

(async () => {
  const gateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: config.subgraphs,
      pollIntervalInMs: config.debug.pollIntervalInMs,
    }),
  });

  let context: ContextFunction | undefined = undefined;

  if (config.auth.enabled) {
    const { authority } = config.auth;

    const issuer = await Issuer.discover(authority);
    if (!issuer.metadata.jwks_uri) {
      throw new Error("jwk_uri not found in issuer metadata");
    }
    const JWKS = createRemoteJWKSet(new URL(issuer.metadata.jwks_uri));

    const introspectionQuery = print(parse(getIntrospectionQuery()));

    context = async ({ req }) => {
      const auth = (req.headers.authorization ?? "").replace("Bearer ", "");
      const query = print(parse(req.body.query));
      if (query === introspectionQuery) {
        return {};
      }

      const { payload } = await jwtVerify(auth, JWKS, {
        issuer: issuer.metadata.issuer,
      });
      if (config.auth.enabled && config.auth.authz?.enabled) {
        const { query, result } = config.auth.authz;
        if (jmespath.search(payload, query) !== result) {
          throw new AuthenticationError("Not Authorized");
        }
      }
    };
  }

  const app = express();
  app.use("/storage", createImageProxy(config.imageProxy.upstream));
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    gateway,
    context,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
  await server.start();
  server.applyMiddleware({ app });

  app.get("/auth_config", (_req, res) => {
    res.send({
      enabled: config.auth.enabled,
      ...(config.auth.enabled
        ? {
            config: {
              authority: config.auth.authority,
              client_id: config.auth.clientId,
              ...config.auth.clientConfig,
            },
          }
        : undefined),
    });
  });

  const port = getPort(8080);
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
})();
