import {
  defaultSettings,
  evaluateTorrents,
  isCollection,
  SmartEpisode,
  SmartTorrent,
  titleRule,
} from "./index";
const at = Date.parse("2026-10-01T12:00:00Z");
const date = (hours: number) => new Date(at + hours * 3600000).toISOString();
const episode = (id = 1, hours = 0, sort = id): SmartEpisode => ({
  id,
  type: "episode",
  number: id,
  sort,
  airTime: date(hours),
});
const torrent = (id = 1, hours = 1, number = 1): SmartTorrent => ({
  id,
  hash: `hash-${id}`,
  title: `Series - ${number}`,
  publishDate: date(hours),
  episodeInfo: { type: "episode", index: number },
  subtitleInfo: { languages: ["zh-Hans"] },
});
const check = (t: SmartTorrent, episodes = [episode()]) =>
  evaluateTorrents(episodes, [t], defaultSettings, at + 30 * 86400000)[0];

test("窗口仅约束原始发布时间，晚开启仍能补下载，边界包含第 48 小时", () => {
  expect(check(torrent(1, 48)).reasons).toEqual([]);
  expect(check(torrent(1, 48.01)).reasons).toContain("time");
  expect(check(torrent(1, -1)).reasons).toEqual(["before-first"]);
});
test("同刻多集独立用唯一编号定位，不能用未下载状态或窗口消歧", () => {
  expect(check(torrent(1, 1, 2), [episode(), episode(2)]).episodeId).toBe(2);
  const ambiguous = [episode(1, 0, 2), episode(2, -168, 26)];
  expect(check(torrent(1, 1, 2), ambiguous).reasons).toContain("episode");
  expect(check(torrent(1, 1, 26), [episode(2, 0, 26)]).reasons).toEqual([]);
});
test.each([0, 1.5, { from: 1, to: 2 }, undefined])(
  "不将特殊编号 %p 当成正篇单集",
  (index) => {
    expect(
      check({ ...torrent(), episodeInfo: { type: "episode", index } }).reasons
    ).toContain("episode");
  }
);
test("合集完全隐藏，普通未解析及 SP 保留在预览中", () => {
  expect(
    isCollection({ ...torrent(), episodeInfo: { index: { from: 1, to: 12 } } })
  ).toBe(true);
  expect(isCollection({ ...torrent(), episodeInfo: null })).toBe(false);
  expect(
    check({ ...torrent(), episodeInfo: { type: "sp", index: 1 } }).reasons
  ).toContain("episode");
});
test("中英字幕接受其一，任意允许无字幕，Baha 默认中文", () => {
  const t = { ...torrent(), subtitleInfo: { languages: ["en"] } };
  expect(check(t).reasons).toContain("subtitle");
  expect(
    evaluateTorrents(
      [episode()],
      [t],
      { ...defaultSettings, subtitle: "chinese-or-english" },
      at + 86400000
    )[0].reasons
  ).toEqual([]);
  expect(
    evaluateTorrents(
      [episode()],
      [{ ...t, subtitleInfo: null }],
      { ...defaultSettings, subtitle: "any" },
      at + 86400000
    )[0].reasons
  ).toEqual([]);
  expect(
    check({ ...t, title: "[BAHA] Series 01", subtitleInfo: null }).reasons
  ).toEqual([]);
});
test("Baha 仅在同集且其余规则合格时压低其他资源", () => {
  const ts = [
    torrent(),
    { ...torrent(2), title: "[Baha] Series 01" },
    torrent(3, 1, 2),
  ];
  const settings = { ...defaultSettings, preferBaha: true };
  expect(
    evaluateTorrents([episode(), episode(2)], ts, settings, at + 86400000).map(
      (d) => d.reasons
    )
  ).toEqual([["baha"], [], []]);
  expect(
    evaluateTorrents([episode()], ts.slice(0, 2), settings, at + 86400000, [
      "/Baha/i",
    ])[0].reasons
  ).toEqual([]);
});
test("等待抓取、日程缺失、未来剧集不进入候选", () => {
  expect(check({ ...torrent(), ready: false }).reasons).toContain("pending");
  expect(check(torrent(), [{ ...episode(), airTime: null }]).reasons).toContain(
    "time"
  );
  expect(
    evaluateTorrents([episode()], [torrent()], defaultSettings, at - 1)[0]
      .reasons
  ).toContain("time");
});
test("未配置规则时修正版及片源不额外排除，配置规则仍然生效", () => {
  for (const title of [
    "Series 01v2",
    "Series repack",
    "Series proper 修正 修复",
  ])
    expect(check({ ...torrent(), title, sourceType: "BDRIP" }).reasons).toEqual(
      []
    );
  expect(
    evaluateTorrents([episode()], [torrent()], defaultSettings, at + 86400000, [
      "/Series/i",
    ])[0].reasons
  ).toContain("title");
});
test("Baha 使用独立单词，避免将 Bahamut 等标题误判为中文字幕", () => {
  for (const title of [
    "[Baha] Series 01",
    "Series (BAHA)",
    "Series Baha WEB-DL",
  ])
    expect(check({ ...torrent(), title, subtitleInfo: null }).reasons).toEqual(
      []
    );
  for (const title of ["Bahamut - 01", "[NotBaha] Series", "BahaRip Series"])
    expect(
      check({ ...torrent(), title, subtitleInfo: null }).reasons
    ).toContain("subtitle");
});
test("配置拒绝非法正则", () => {
  expect(() => titleRule("/abc/g")).toThrow();
  expect(() => titleRule("[")).toThrow();
});
