import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { ApolloServer } from "apollo-server-koa";
import http from "http";
import Koa from "koa";

(async () => {
  const httpServer = http.createServer();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  const app = new Koa();
  server.applyMiddleware({ app });
  httpServer.on("request", app.callback());
  const port = 4000;
  await new Promise<void>((resolve) =>
    httpServer.listen({ host: "0.0.0.0", port }, resolve)
  );
  console.log(`🚀 Server ready at http://0.0.0.0:${port}${server.graphqlPath}`);
})();
