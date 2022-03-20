import { ServiceEndpointDefinition } from "@apollo/gateway";
import { mergeConfig } from "@lani/framework";

export default mergeConfig<{
  subgraphs: ServiceEndpointDefinition[];
}>({
  subgraphs: [
    {
      name: "data",
      url: "http://data-server.lani:8080",
    },
    {
      name: "api",
      url: "http://api-server.lani:8080",
    },
  ],
})<{
  subgraphs: ServiceEndpointDefinition[];
}>({
  dev: {
    subgraphs: [
      {
        name: "data",
        url: "http://data-server.lani-offline:8080/graphql",
      },
      {
        name: "api",
        url: "http://api-server.lani-offline:8080/graphql",
      },
    ],
  },
  offline: {
    subgraphs: [
      {
        name: "data",
        url: "http://data-server.lani-offline:8080/graphql",
      },
      {
        name: "api",
        url: "http://api-server.lani-offline:8080/graphql",
      },
    ],
  },
});
