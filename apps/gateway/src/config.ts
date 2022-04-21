import { ServiceEndpointDefinition } from "@apollo/gateway";
import { mergeConfig } from "@lani/framework";

export default mergeConfig({
  subgraphs: [
    {
      name: "data",
      url: "http://data-server.lani:8080",
    },
    {
      name: "api",
      url: "http://api-server.lani:8080",
    },
  ] as ServiceEndpointDefinition[],
  issuer: "https://accounts.std4453.com:444/auth/realms/apps",
  audience: "lani",
  role: "lani-admin",
})({
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
    ] as ServiceEndpointDefinition[],
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
    ] as ServiceEndpointDefinition[],
  },
});
