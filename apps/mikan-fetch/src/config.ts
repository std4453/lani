import { mergeConfig } from "@lani/framework";

export default mergeConfig({
  proxy: "http://hk1.v2ray:8889",
})({
  dev: {
    proxy: "http://10.43.154.118:8889",
  },
});
