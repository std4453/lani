import { bilibiliBangumiCCService } from "@/services/bilibiliBangumiCC";

export const services = {
  bilibiliBangumiCCService,
} as const;

export type Services = typeof services;
