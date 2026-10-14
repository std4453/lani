import fs from "fs/promises";
import os from "os";
import path from "path";
import xml2js from "xml2js";
import { SeasonEmitService } from "./index.service";

jest.mock("@/common/prisma.service", () => ({ PrismaService: class {} }));
jest.mock("@/common/s3.service", () => ({ S3Service: class {} }));
jest.mock("@/season-jellyfin/SeasonJellyfinService", () => ({
  SeasonJellyfinService: class {},
}));
jest.mock("@/config", () => ({
  __esModule: true,
  default: { jellyfin: { pathMapping: [] }, s3: { bucket: "test" } },
}));

let root: string;
beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), "lani-directory-"));
});
afterEach(async () => {
  await fs.rm(root, { recursive: true, force: true });
});

function setup(patch: any = {}) {
  let state = {
    id: 12,
    title: "A/B",
    directory: null,
    lastWriteDirectory: null,
    lastWriteTitle: null,
    lastWriteToDisk: null,
    jellyfinId: "",
    jellyfinFolderId: 1,
    jellyfinFolder: { location: root },
    tags: [],
    description: "",
    tvdbId: "",
    bangumiId: "",
    yearAndSemester: "",
    bannerImage: null,
    fanartImage: null,
    posterImage: null,
    ...patch,
  };
  const prisma = {
    season: {
      update: jest.fn(async ({ data }) => {
        state = { ...state, ...data };
        return state;
      }),
    },
    downloadJob: {
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (queries) => Promise.all(queries)),
  };
  const jellyfin = {
    refreshAfterFolderRename: jest.fn(),
    refreshAfterWriteToDisk: jest.fn(),
    refreshAfterDelete: jest.fn(),
  };
  const service = new SeasonEmitService(
    {} as any,
    jellyfin as any,
    prisma as any
  );
  return {
    service,
    prisma,
    jellyfin,
    state: () => state,
    write: () => service.writeSeasonMetadata(state),
  };
}

it("writes new seasons into a single safe directory and preserves the displayed slash", async () => {
  const { write, state } = setup();
  await write();
  const { tvshow } = await xml2js.parseStringPromise(
    await fs.readFile(path.join(root, "A／B", "tvshow.nfo"), "utf8")
  );
  expect(tvshow.title).toEqual(["A/B"]);
  expect(tvshow.uniqueid[0]).toEqual({
    $: { type: "lani", default: "true" },
    _: "12",
  });
  expect(tvshow.uniqueId).toBeUndefined();
  expect(state().directory).toBe("A／B");
  expect(state().lastWriteDirectory).toBe("A／B");
  expect(await fs.readdir(root)).toEqual(["A／B"]);
});

it("moves legacy directories on explicit sync, cleans old NFO tags and moves persisted job paths", async () => {
  const old = path.join(root, "A", "B");
  await fs.mkdir(path.join(old, "Season 1"), { recursive: true });
  await fs.writeFile(path.join(old, "Season 1", "episode.mkv"), "video");
  await fs.writeFile(
    path.join(old, "tvshow.nfo"),
    '<tvshow><uniqueId type="lani">12</uniqueId><tag>old</tag><plot>keep</plot></tvshow>'
  );
  const { write, state, prisma, jellyfin } = setup({
    lastWriteTitle: "A/B",
    lastWriteToDisk: new Date(),
    jellyfinId: "old-id",
  });
  prisma.downloadJob.findMany.mockResolvedValue([
    {
      id: 1,
      filePath: path.join(old, "Season 1", "episode.mkv"),
      nfoPath: path.join(old, "Season 1", "episode.nfo"),
    },
  ]);
  await write();
  const target = path.join(root, "A／B");
  expect(
    await fs.readFile(path.join(target, "Season 1", "episode.mkv"), "utf8")
  ).toBe("video");
  const { tvshow } = await xml2js.parseStringPromise(
    await fs.readFile(path.join(target, "tvshow.nfo"), "utf8")
  );
  expect(tvshow.uniqueId).toBeUndefined();
  expect(tvshow.uniqueid[0]._).toBe("12");
  expect(tvshow.tag).toBeUndefined();
  expect(tvshow.plot).toEqual(["keep"]);
  expect(prisma.downloadJob.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: {
      filePath: path.join(target, "Season 1", "episode.mkv"),
      nfoPath: path.join(target, "Season 1", "episode.nfo"),
    },
  });
  expect(jellyfin.refreshAfterFolderRename).toHaveBeenCalled();
  expect(state().jellyfinId).toBe("");
  // 已完成清洗后再次执行不会尝试移动不存在的旧目录。
  await write();
});

it("does not move a directory when only the title changes to an equivalent sanitized name", async () => {
  const { write, jellyfin } = setup({
    title: "A／B",
    directory: "A／B",
    lastWriteDirectory: "A／B",
    lastWriteTitle: "A/B",
  });
  await fs.mkdir(path.join(root, "A／B"));
  await write();
  expect(jellyfin.refreshAfterFolderRename).not.toHaveBeenCalled();
});

it("refuses to overwrite an existing target, even if it is empty", async () => {
  await fs.mkdir(path.join(root, "A", "B"), { recursive: true });
  await fs.mkdir(path.join(root, "A／B"));
  const { write, state, jellyfin } = setup({
    lastWriteTitle: "A/B",
    lastWriteToDisk: new Date(),
  });
  await expect(write()).rejects.toThrow("目标季度目录已存在");
  expect(state().lastWriteDirectory).toBeNull();
  expect(jellyfin.refreshAfterFolderRename).not.toHaveBeenCalled();
});

it("refuses to reuse an untracked existing directory for a new season", async () => {
  await fs.mkdir(path.join(root, "A／B"));
  const { write } = setup();
  await expect(write()).rejects.toThrow("目标季度目录已存在");
});

it("recovers after a rename followed by a database failure using the NFO owner", async () => {
  await fs.mkdir(path.join(root, "A／B"));
  await fs.writeFile(
    path.join(root, "A／B", "tvshow.nfo"),
    '<tvshow><uniqueId type="lani">12</uniqueId></tvshow>'
  );
  const { write, state } = setup({
    lastWriteTitle: "A/B",
    lastWriteToDisk: new Date(),
  });
  await write();
  expect(state().lastWriteDirectory).toBe("A／B");
});

it("retries a Jellyfin refresh failure without repeating the filesystem move", async () => {
  await fs.mkdir(path.join(root, "A", "B"), { recursive: true });
  const { write, state, jellyfin } = setup({
    lastWriteTitle: "A/B",
    lastWriteToDisk: new Date(),
    jellyfinId: "old",
  });
  jellyfin.refreshAfterFolderRename.mockRejectedValueOnce(new Error("offline"));
  await expect(write()).rejects.toThrow("offline");
  expect(state().lastWriteDirectory).toBe("A／B");
  expect(state().jellyfinId).toBe("");
  await write();
  expect(jellyfin.refreshAfterFolderRename).toHaveBeenCalledTimes(1);
  expect(jellyfin.refreshAfterWriteToDisk).toHaveBeenCalledTimes(1);
});

it("checks directory uniqueness before moving files", async () => {
  const { write, prisma } = setup();
  prisma.season.update.mockRejectedValueOnce(new Error("directory conflict"));
  await expect(write()).rejects.toThrow("directory conflict");
  expect(await fs.readdir(root)).toEqual([]);
});

it("retries a new season after its initial NFO write fails", async () => {
  const { write } = setup();
  const writeFile = jest
    .spyOn(fs, "writeFile")
    .mockRejectedValueOnce(new Error("disk failure"));
  try {
    await expect(write()).rejects.toThrow("disk failure");
    await write();
    expect(
      await fs.readFile(path.join(root, "A／B", "tvshow.nfo"), "utf8")
    ).toContain('<uniqueid type="lani"');
  } finally {
    writeFile.mockRestore();
  }
});

it("retries refresh even when the NFO no longer needs changes", async () => {
  await fs.mkdir(path.join(root, "A／B"));
  const { write, jellyfin } = setup({
    directory: "A／B",
    lastWriteDirectory: "A／B",
    lastWriteTitle: "A/B",
    lastWriteToDisk: new Date(),
    jellyfinId: "existing",
  });
  jellyfin.refreshAfterWriteToDisk.mockRejectedValueOnce(new Error("offline"));
  await expect(write()).rejects.toThrow("offline");
  await write();
  expect(jellyfin.refreshAfterWriteToDisk).toHaveBeenCalledTimes(2);
});

it("deletes from the last written directory rather than a changed display title", async () => {
  await fs.mkdir(path.join(root, "old"));
  await fs.mkdir(path.join(root, "new"));
  const { service, state } = setup({
    title: "new",
    directory: "new",
    lastWriteDirectory: "old",
  });
  await service.deleteSeasonFiles(state());
  expect(await fs.readdir(root)).toEqual(["new"]);
});
