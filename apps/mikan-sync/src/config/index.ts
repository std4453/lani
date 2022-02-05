import { mergeConfig } from "@lani/framework";

export default mergeConfig({})({
  dev: {
    endpoint: "http://localhost:8080/graphql",
  },
});
