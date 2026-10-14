import { SeasonScrapeService } from "./SeasonScrapeService";

jest.mock("@/common/prisma.service", () => ({ PrismaService: class {} }));
jest.mock("@/common/s3.service", () => ({ S3Service: class {} }));
jest.mock("@/common/axios.service", () => ({ GlobalAxiosService: class {} }));
jest.mock("@/season-emit/index.service", () => ({
  SeasonEmitService: class {},
}));
jest.mock("@/season-scrape/bangumi/index.service", () => ({
  BangumiSeasonService: class {},
}));
jest.mock("@/season-scrape/skyhook/index.service", () => ({
  SkyhookSeasonService: class {},
}));
jest.mock("@/config", () => ({ __esModule: true, default: {} }));

it("uses explicit metadata sync to rewrite manual seasons without fetching external metadata", async () => {
  const season = { id: 12, title: "A/B", infoSource: "MANUAL" } as any;
  const emit = { writeSeasonMetadata: jest.fn() };
  const fetch = jest.fn();
  const prisma = {
    season: { findUnique: jest.fn().mockResolvedValue(season) },
  };
  const service = new SeasonScrapeService(
    emit as any,
    { fetch } as any,
    { fetch } as any,
    prisma as any,
    {} as any,
    {} as any
  );
  await service.syncMetadata(season);
  expect(emit.writeSeasonMetadata).toHaveBeenCalledWith(season);
  expect(fetch).not.toHaveBeenCalled();
});
