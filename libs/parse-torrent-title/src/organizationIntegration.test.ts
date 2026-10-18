import parseTorrentTitle from "./parseTorrentTitle";
import { parseTorrentNames } from "./parseTorrentNames";
import { parseTorrentOrganization } from "./parseTorrentOrganization";

describe("制作组独立识别的调用路径", () => {
  it("默认主解析器与独立名称路径均使用完整联合组集合", () => {
    const input =
      "[春羽字幕组＆舟光字幕组+竹影字幕社] 星海来信 / Orbital Letters - 03 [1080p][简日内嵌]";
    const expected = ["春羽字幕组", "舟光字幕组", "竹影字幕社"];
    expect(parseTorrentOrganization(input)?.parts).toEqual(expected);
    expect(parseTorrentTitle(input)?.organization?.parts).toEqual(expected);
    expect(parseTorrentNames(input).organization?.parts).toEqual(expected);
    expect(parseTorrentTitle(input)?.title.aliases).toEqual([
      "星海来信",
      "Orbital Letters",
    ]);
    expect(parseTorrentTitle(input)?.episodeInfo).toEqual({
      type: "episode",
      index: 3,
    });
  });

  it("原主解析器无编号失败时，独立名称路径仍返回制作组", () => {
    const input = "[春羽字幕组] 星海来信 / Orbital Letters [Movie][1080p]";
    expect(parseTorrentTitle(input)).toBeUndefined();
    expect(parseTorrentNames(input).organization?.parts).toEqual([
      "春羽字幕组",
    ]);
  });

  it("类别标签不再成为制作组，作品名仍完整保留", () => {
    const input = "[国漫] 星海来信 - 03 [1080p][简体]";
    expect(parseTorrentTitle(input)?.organization).toBeUndefined();
    expect(parseTorrentNames(input).organization).toBeUndefined();
    expect(parseTorrentTitle(input)?.title.aliases).toEqual(["星海来信"]);
  });

  it("显式自定义联合分隔规则继续沿用原合同", () => {
    const input = "[A&B+C] Orbital Letters - 03 [1080p]";
    expect(
      parseTorrentTitle(input, { organizationSeparators: ["&"] })?.organization
        ?.parts
    ).toEqual(["A", "B+C"]);
  });
});
