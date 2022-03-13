import { mergeConfig } from "@lani/framework";

export default mergeConfig({
  endpoint: "http://data-server.lani:8080/graphql",
  sonarr: "http://sonarr.media/api/v3",
  sonarrAPIKey: "f77b5c7c165f4f3faed09ca44f0a5c36",
})({
  dev: {
    endpoint: "https://lani.i.std4453.com/api/data-server/graphql",
    sonarr: "https://sonarr.std4453.com:444/api/v3",
  },
  offline: {
    endpoint: "http://data-server.lani-offline:8080/graphql",
  },
});
