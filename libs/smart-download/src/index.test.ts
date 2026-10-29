import {
  defaultSettings,
  evaluateTorrents,
  formatEpisodeNumbers,
  isCollection,
  previewRows,
  SmartEpisode,
  SmartTorrent,
  titleRule,
  validateSettings,
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
test("等待抓取、日程缺失、未来剧集、修正版和补档不进入候选", () => {
  expect(check({ ...torrent(), ready: false }).reasons).toContain("pending");
  expect(check(torrent(), [{ ...episode(), airTime: null }]).reasons).toContain(
    "time"
  );
  expect(
    evaluateTorrents([episode()], [torrent()], defaultSettings, at - 1)[0]
      .reasons
  ).toContain("time");
  expect(check({ ...torrent(), title: "Series 01v2" }).reasons).toContain(
    "title"
  );
  expect(check({ ...torrent(), sourceType: "BDRIP" }).reasons).toContain(
    "title"
  );
});
test("0 和空值无超时，配置拒绝非法窗口、负超时和非法正则", () => {
  for (const timeoutMinutes of [null, 0])
    expect(() =>
      validateSettings({ ...defaultSettings, timeoutMinutes })
    ).not.toThrow();
  for (const windowHours of [0, 169, NaN, 1.5])
    expect(() =>
      validateSettings({ ...defaultSettings, windowHours })
    ).toThrow();
  expect(() =>
    validateSettings({ ...defaultSettings, timeoutMinutes: -1 })
  ).toThrow();
  expect(() => titleRule("/abc/g")).toThrow();
  expect(() => titleRule("[")).toThrow();
});
test("预览按实际发布区间补空行，与下载窗口无关，合并同刻角标", () => {
  const episodes = [
    episode(1),
    episode(2, 168),
    episode(3, 336),
    episode(4, 336),
  ];
  const rows = previewRows(
    episodes,
    [torrent(1, 96)],
    { ...defaultSettings, windowHours: 1 },
    at + 400 * 3600000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity }
  );
  expect(rows.map((r) => r.release?.label)).toEqual([
    "#1 发布",
    "#2 发布",
    "#3-4 发布",
  ]);
  expect(rows.map((r) => r.torrent?.id)).toEqual([1, undefined, undefined]);
});
test("无资源保留发布事件定位点，无剧集时保留种子且置灰", () => {
  expect(
    previewRows([episode()], [], defaultSettings, at + 86400000, [], {
      from: -Infinity,
      through: Infinity,
      completeUntil: Infinity,
    })
  ).toMatchObject([{ key: "release-1", release: { label: "#1 发布" } }]);
  const rows = previewRows(
    [],
    [torrent()],
    defaultSettings,
    at + 86400000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity }
  );
  expect(rows[0].release).toBeUndefined();
  expect(rows[0].decision?.reasons).toContain("episode");
  expect(formatEpisodeNumbers([5, 3, 1, 4, 3, 10])).toBe("#1,3-5,10 发布");
});

test("正序分界位于发布后第一条，相对时间使用最近的发布事件，包含相同时间", () => {
  const rows = previewRows(
    [episode(1), episode(2, 168)],
    [torrent(5, 168), torrent(2, -1), torrent(3, 168), torrent(1, 0)],
    defaultSettings,
    at + 400 * 3600000,
    [],
    { from: -Infinity, through: Infinity, completeUntil: Infinity }
  );
  expect(rows.map((r) => r.torrent?.id)).toEqual([2, 1, 3, 5]);
  expect(rows.map((r) => r.release?.label)).toEqual([
    undefined,
    "#1 发布",
    "#2 发布",
    undefined,
  ]);
  expect(rows.map((r) => r.precedingReleaseAt)).toEqual([
    undefined,
    at,
    at + 168 * 3600000,
    at + 168 * 3600000,
  ]);
});
test("不为未加载的尾部补空事件，首集在未来仍能定位", () => {
  expect(
    previewRows(
      [episode(1), episode(2, 168)],
      [],
      defaultSettings,
      at + 200 * 3600000,
      [],
      { from: -Infinity, through: at, completeUntil: at }
    )
  ).toEqual([]);
  expect(
    previewRows(
      [episode(1), episode(2, 168)],
      [],
      defaultSettings,
      at - 1,
      [],
      { from: -Infinity, through: Infinity, completeUntil: Infinity }
    )
  ).toMatchObject([{ release: { episodeIds: [1] } }]);
});
