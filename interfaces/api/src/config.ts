import {
  bilibiliBangumiCCService,
  dataServerService,
  mikanFetchService,
} from "@/services";

export const services = {
  bilibiliBangumiCCService,
  mikanFetchService,
  dataServerService,
} as const;

export type Services = typeof services;
