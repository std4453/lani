import { mergeConfig } from "@lani/framework";

export default mergeConfig({
  adminHost: "https://lani.std4453.com:444",
})({
  dev: {
    adminHost: "https://lani.i.std4453.com",
  },
  offline: {
    adminHost: "https://lani.i.std4453.com",
  },
});
