import config from "@/config";
import {
  CreateSonarrSeriesDocument,
  GetSonarrSeriesByIdListDocument,
  GetSonarrSeriesByIdListQuery,
  UpdateSonarrSeriesDocument,
} from "@/generated/types";
import { Series, SonarrSeriesListResponse } from "@/sonarr";
import {
  sonarrSyncService,
  SonarrSyncService,
  tSyncSonarrRequest,
  tSyncSonarrResponse,
} from "@lani/api";
import { App, buildRoute as r } from "@lani/framework";
import { ExtractNode, extractNodeNonNullable } from "@lani/gql-utils";
import { createClient } from "@urql/core";
import axios from "axios";
import "isomorphic-unfetch";

const client = createClient({
  url: config.endpoint,
  requestPolicy: "network-only",
});

const sonarr = axios.create({
  baseURL: config.sonarr,
  timeout: 10 * 1000,
  headers: {
    "x-api-key": config.sonarrAPIKey,
  },
});

type LaniSeries = ExtractNode<GetSonarrSeriesByIdListQuery["allSonarrSeries"]>;

async function processSeries(
  sonarrSeries: Series,
  laniSeries: LaniSeries | undefined
) {
  try {
    if (!laniSeries) {
      const result = await client
        .mutation(CreateSonarrSeriesDocument, {
          sonarrSery: {
            sonarrId: sonarrSeries.id,
            sonarrName: sonarrSeries.title,
            sonarrSlug: sonarrSeries.titleSlug,
            tvdbid: sonarrSeries.tvdbId,
          },
        })
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      console.log(`${sonarrSeries.titleSlug} (${sonarrSeries.id}) -> CREATE`);
    } else {
      if (
        sonarrSeries.title !== laniSeries.sonarrName ||
        sonarrSeries.titleSlug !== laniSeries.sonarrSlug ||
        sonarrSeries.tvdbId !== laniSeries.tvdbid
      ) {
        const result = await client
          .mutation(UpdateSonarrSeriesDocument, {
            id: laniSeries.id,
            sonarrSeryPatch: {
              sonarrName: sonarrSeries.title,
              sonarrSlug: sonarrSeries.titleSlug,
              tvdbid: sonarrSeries.tvdbId,
            },
          })
          .toPromise();
        if (result.error) {
          throw result.error;
        }
        console.log(`${sonarrSeries.titleSlug} (${sonarrSeries.id}) -> UPDATE`);
      }
    }
  } catch (error) {
    console.log(`${sonarrSeries.titleSlug} (${sonarrSeries.id}) -> ERROR`);
    console.error(error);
  }
}

async function syncSonarr() {
  const { data } = await sonarr.get<SonarrSeriesListResponse>("/series");
  const sonarrIds = data.map(({ id }) => id);
  const result = await client
    .query(GetSonarrSeriesByIdListDocument, {
      in: sonarrIds,
    })
    .toPromise();
  if (result.error) {
    throw result.error;
  }
  const sonarrIdToSeriesMap: Record<string, LaniSeries> = {};
  for (const series of extractNodeNonNullable(result.data?.allSonarrSeries)) {
    sonarrIdToSeriesMap[series.sonarrId] = series;
  }
  await Promise.all(
    data.map((series) => processSeries(series, sonarrIdToSeriesMap[series.id]))
  );
}

const app = new App();
app
  .setupMiddlewares()
  .setupRoutes<SonarrSyncService>({
    "/sync": r(tSyncSonarrRequest, tSyncSonarrResponse, syncSonarr),
  })
  .setupRouter()
  .start(sonarrSyncService);
