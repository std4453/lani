import fs from "fs/promises";
import os from "os";
import path from "path";
import { ImportService } from "./index.service";
import { ImportFileAtom } from "@/download-job/atoms/import-file.atom";

jest.mock("@/common/prisma.service", () => ({ PrismaService: class {} }));
jest.mock("@/config", () => ({
  __esModule: true,
  default: {
    jellyfin: { pathMapping: [] },
    downloadClient: { kind: "test", test: { pathMapping: [] } },
    lani: { moveStrategy: "copyOnly" },
  },
}));

it.each(["manual", "download"])(
  "imports %s videos into the recorded directory",
  async (kind) => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "lani-import-"));
    try {
      const source = path.join(root, "source.mkv");
      await fs.writeFile(source, "video");
      const prisma = {
        episode: {
          findUnique: async () => ({
            id: 1,
            index: 1,
            episodeType: "EPISODE",
            season: {
              title: "A/B",
              directory: "A／B",
              lastWriteDirectory: "A／B",
              lastWriteTitle: "A/B",
              jellyfinFolder: { location: root },
            },
          }),
        },
      };
      const target =
        kind === "manual"
          ? await (new ImportService(prisma as any) as any).importFile(
              1,
              source
            )
          : (
              await new ImportFileAtom({} as any, prisma as any).run(1, {
                params: { episodeId: 1 },
                steps: { findVideoFile: { importPath: source } },
              } as any)
            ).filePath;
      expect(target).toBe(
        path.join(root, "A／B", "Season 1", "Episode - S01E01.mkv")
      );
      expect(await fs.readFile(target, "utf8")).toBe("video");
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }
);
