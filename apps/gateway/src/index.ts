import config from "@/config";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { getPort } from "@lani/framework";
import { createAuth } from "./auth";
import { graphqlAuth } from "./auth/graphql";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
  ContextFunction,
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

  const app = express();
  app.use("/storage", createImageProxy(config.imageProxy.upstream));
  let context: ContextFunction | undefined;
  if (config.auth.enabled) {
    const auth = createAuth({
      ...config.auth,
      testRoutingEnabled: config.debug.testRoutingEnabled === true,
    });
    app.use(auth.middleware);
    app.use("/auth", auth.router);
    app.use("/graphql", ...graphqlAuth(auth));
    context = ({ res }) => ({ user: res.locals.user });
  } else {
    app.get("/auth/session", (_req, res) => {
      res
        .set("Cache-Control", "no-store")
        .json({
          enabled: false,
          authenticated: true,
          authorized: true,
          testRoutingEnabled: config.debug.testRoutingEnabled === true,
        });
    });
  }

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
  // Apollo 3 and Express resolve different express-serve-static-core type versions.
  server.applyMiddleware({
    app: app as Parameters<ApolloServer["applyMiddleware"]>[0]["app"],
    cors: false,
  });

  app.get("/auth_config", (_req, res) => {
    res
      .set("Cache-Control", "no-store")
      .json({
        enabled: config.auth.enabled,
        mode: "cookie",
        testRoutingEnabled: config.debug.testRoutingEnabled === true,
      });
  });

  const port = getPort(8080);
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(
    `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
  );
})();
