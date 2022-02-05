import { createClient } from "@urql/core";
import config from "@/config";

const client = createClient({
  url: config.endpoint,
});

export default client;
