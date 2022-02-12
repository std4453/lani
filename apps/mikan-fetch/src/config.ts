import { mergeConfig } from "@lani/framework";

export default mergeConfig({})({
  dev: {
    proxy: "http://10.43.154.118:8889",
  },
  offline: {
    proxy: "http://hk1.v2ray:8889",
  },
  pre: {
    proxy: "http://hk1.v2ray:8889",
  },
  prod: {
    proxy: "http://hk1.v2ray:8889",
  },
});
