import parseTorrentTitle from "@/parseTorrentTitle";
import { Index, PositionalItemType } from "@/types";

describe("priority episode notation", () => {
  test.each<[string, Index]>([
    ["[Group] Series [01 - 总第11] [1080p]", 1],
    ["[Group] Series [０１ - 总第１１] [1080p]", 1],
    ["[Group] Series E01 [1080p]", 1],
    ["[Group] Series e01 [1080p]", 1],
    ["[Group] Series Ｅ０１ [1080p]", 1],
    ["[Group] Series ★12(完)★ [1080p]", 12],
    ["[Group] Series ★12(最终话)★ [1080p]", 12],
    ["[Group] Series [12（完）] [1080p]", 12],
    ["[Group] Series [01-v1] [1080p]", 1],
    ["[Group] Series [01-v2] [1080p]", 1],
    ["[Group] Series [01-v3] [1080p]", 1],
    ["[Group] Series [01-v9] [1080p]", 1],
    ["[Group] Series - 25.5[BIG5][1080p]", 25.5],
    ["[Group] Series [25.5] [Baha]", 25.5],
    ["[Group] Series [24.5] [1080p]", 24.5],
    ["[Group] Series 1-2.5 [1080p]", { from: 1, to: 2.5 }],
    ["[Group] Series ★02.5★ 1920x1080 AVC", 2.5],
    ["[Group] Series [01-03] [1080p]", { from: 1, to: 3 }],
    ["[Group] Series [E01-E13FIN][1080p]", { from: 1, to: 13 }],
    ["[Group] Series [48.5-72(00-24) 合集][1080p]", { from: 48.5, to: 72 }],
  ])("parses %s", (title, expected) => {
    expect(parseTorrentTitle(title)?.index).toEqual(expected);
  });

  test.each([
    "[Group] Series [25.50] [Baha]",
    "[Group] Series [25.51] [Baha]",
    "[Group] Series [24.2] [Baha]",
    "[Group] Series [25.5.1] [Baha]",
    "[Group] Series [01v1.2] [1080p]",
    "[Group] Series [01-v2.1] [1080p]",
    "[Group] Series [01-v10] [1080p]",
    "[Group] Series [01-v2-v3] [1080p]",
    "[Group] Series [01-02+04] [1080p]",
    "[Group] Series ★12(13)★ [1080p]",
    "[Group] Series [E13-E01FIN][1080p]",
    "[Group] Series - 26.5 Part 1 [1080p]",
    "[Group] LGA 771硬改775 添加E0 SSE4.1 VT-X 指令集 微码",
  ])("does not infer an episode from %s", (title) => {
    expect(parseTorrentTitle(title)?.index).toBeUndefined();
  });

  test.each<[string, string, Index]>([
    [
      "[Group] Series [48.5-72(00-24) 合集][1080p]",
      "[48.5-72(00-24) 合集]",
      { from: 48.5, to: 72 },
    ],
    ["[Group] Series [01 - 总第11] [1080p]", "[01 - 总第11]", 1],
    ["[Group] Series E01 [1080p]", "E01", 1],
    ["[Group] Series ★12(完)★ [1080p]", "★12(完)★", 12],
    ["[Group] Series ★02.5★ 1920x1080 AVC", "★02.5★", 2.5],
    ["[Group] Series [01-v2] [1080p]", "[01-v2]", 1],
    ["[Group] Series - 25.5[BIG5][1080p]", "- 25.5", 25.5],
    ["[Group] Series [０１ - 总第１１] [1080p]", "[０１ - 总第１１]", 1],
  ])("keeps the raw index span for %s", (title, rawSpan, expected) => {
    const result = parseTorrentTitle(title);
    const indexItem = result?.positionalItems.find(
      (item) => item.type === PositionalItemType.INDEX
    );

    expect(result?.index).toEqual(expected);
    expect(indexItem).toBeDefined();
    expect(
      title.slice(indexItem!.index, indexItem!.index + indexItem!.length)
    ).toBe(rawSpan);
  });
});
