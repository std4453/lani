import { RequestFn } from "@/types";
import { buildServiceConfig } from "@/utils";
import * as t from "io-ts";

export const tSyncSonarrRequest = t.type({});

export type SyncSonarrRequest = t.TypeOf<typeof tSyncSonarrRequest>;

export const tSyncSonarrResponse = t.void;

export type SyncSonarrResponse = t.TypeOf<typeof tSyncSonarrResponse>;

export type SonarrSyncService = {
  routes: {
    "/sync": RequestFn<SyncSonarrRequest, SyncSonarrResponse>;
  };
};

export const sonarrSyncService = buildServiceConfig({
  svc: "sonarr-sync",
});
