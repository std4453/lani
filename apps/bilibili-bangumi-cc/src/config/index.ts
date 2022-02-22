import { mergeConfig } from "@lani/framework";

const config = {
  cosSecretId: "AKIDXtzoNfgPs88qIVQ4RYOxFH3YmiOnwpSo",
  cosSecretKey: "6vTkkTv72g5E6hBPN3SaS3NQChvsXx6y",
  cosBucket: "temp-1308701035",
  cosRegion: "ap-shanghai",
} as const;

export default mergeConfig(config)({
  dev: {
    thmProxy: "http://10.43.154.118:8889",
  },
  offline: {
    thmProxy: "http://hk1.v2ray:8889",
  },
  pre: {
    thmProxy: "http://hk1.v2ray:8889",
  },
  prod: {
    thmProxy: "http://hk1.v2ray:8889",
  },
});
