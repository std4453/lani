import { mergeConfig } from "@lani/framework";

export default mergeConfig({})({
  dev: {
    endpoint: "http://data-server.lani-offline:8080/graphql",
  },
  offline: {
    endpoint: "http://data-server.lani-offline:8080/graphql",
  },
  prod: {
    endpoint: "http://data-server.lani:8080/graphql",
  },
});
