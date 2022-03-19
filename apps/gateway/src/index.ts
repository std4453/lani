import config from "@/config";
import { ApolloGateway, IntrospectAndCompose } from "@apollo/gateway";
import { ApolloServer } from "apollo-server";

const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({ subgraphs: config.subgraphs }),
});

const server = new ApolloServer({
  gateway,
});

server.listen(8080).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
