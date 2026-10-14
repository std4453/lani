import {
  getSeasonDirectory,
  resolveSeasonPath,
  sanitizeSeasonDirectory,
} from "./season-directory";

it("keeps slashes and reserved characters inside one safe component", () => {
  expect(sanitizeSeasonDirectory(' A/B\\C: D?*<>|" ')).toBe(
    "A／B＼C： D？＊＜＞｜＂"
  );
  expect(sanitizeSeasonDirectory("CON")).toBe("_CON");
  expect(sanitizeSeasonDirectory("作品. ")).toBe("作品");
  expect(sanitizeSeasonDirectory("A\u0000B")).toBe("A_B");
  expect(() => sanitizeSeasonDirectory(".. ")).toThrow();
  expect(() => sanitizeSeasonDirectory("  ")).toThrow();
  expect(
    Buffer.byteLength(sanitizeSeasonDirectory("动画😀".repeat(100)))
  ).toBeLessThanOrEqual(240);
});

it("retains legacy and last successful paths until metadata is written", () => {
  const season = {
    title: "A/B",
    directory: null,
    lastWriteDirectory: null,
    lastWriteTitle: "A/B",
  };
  expect(getSeasonDirectory(season)).toBe("A/B");
  expect(
    getSeasonDirectory({
      ...season,
      directory: "new",
      lastWriteDirectory: "old",
    })
  ).toBe("old");
  expect(getSeasonDirectory({ ...season, lastWriteTitle: null })).toBe("A／B");
});

it("rejects historical paths escaping or deleting the library root", () => {
  for (const directory of ["../outside", ".", "A/..", "/outside"]) {
    expect(() => resolveSeasonPath("/media/library", directory)).toThrow();
  }
  expect(resolveSeasonPath("/media/library", "A/B")).toBe("/media/library/A/B");
});
