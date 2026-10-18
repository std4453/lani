import { parseTorrentNames } from "@/parseTorrentNames";
import parseTorrentTitle from "@/parseTorrentTitle";
import { parseTorrentOrganization } from "@/parseTorrentOrganization";
import * as organizationParser from "@/parseTorrentOrganization";
const aliases = (input: string) => parseTorrentNames(input).title.aliases;
const integratedAliases = (input: string) =>
  (parseTorrentTitle(input) ?? parseTorrentNames(input)).title.aliases;

describe("字幕附件与预告发行说明", () => {
  test.each([
    ["[Publisher] Fork Dawn - 03 [1080p] #Fork", ["Fork Dawn"]],
    ["[Fork] Dawn of Fork - 03 [1080p]", ["Dawn of Fork"]],
  ] as Array<[string, string[]]>)(
    "署名与标题同形时按实际位置保留：%s",
    (input, expected) => {
      expect(integratedAliases(input)).toEqual(expected);
    }
  );
});

describe("同名署名、版本后续名称与明确发行尾缀", () => {
  test.each(["SharedName", "Shared Name", "Fictional Animation Study Group"])(
    "制作组与作品同名仍保留名称：%s",
    (name) => {
      expect(aliases(`[${name}] ${name} - 01 [1080p]`)).toEqual([name]);
    }
  );
});

describe("历史标题中的符号与版本后发行信息", () => {
  test("年份后已识别的署名不回拼名称", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      expect(aliases("First Tale (1980) Example Publisher")[0]).toBe(
        "First Tale (1980)"
      );
    } finally {
      organization.mockRestore();
    }
  });
});

describe("编号电视版本不得跨过分隔或署名", () => {
  test("中间署名不成为标题组成部分，也不允许版本号跨过署名绑定", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      const parsed = parseTorrentNames(
        "First Tale | Первая история [Example Publisher] [TV-2] - 03 [1080p]"
      );
      expect(parsed.title.aliases).toEqual(["First Tale", "Первая история"]);
      expect(parsed.organization?.parts).toEqual(["Example Publisher"]);
    } finally {
      organization.mockRestore();
    }
  });
});

describe("Nyaa 已识别署名的原文位置", () => {
  test("括号前署名与技术块后裸署名仅删除实际署名段", () => {
    const organization = jest
      .spyOn(organizationParser, "parseTorrentOrganization")
      .mockReturnValue({
        raw: "Example Publisher",
        parts: ["Example Publisher"],
      });
    try {
      expect(aliases("(Example Publisher) First Tale - 03 [1080p]")).toEqual([
        "First Tale",
      ]);
      expect(
        aliases("[Publisher] First Tale [BDRip] - Example Publisher")
      ).toEqual(["First Tale"]);
      expect(
        aliases("[Example Publisher] Example Publisher - 03 [1080p]")
      ).toEqual(["Example Publisher"]);
      expect(aliases("[Publisher] First Tale - Example Publisher")).toEqual([
        "First Tale - Example Publisher",
      ]);
    } finally {
      organization.mockRestore();
    }
  });
});

describe("结构规则的保留负例", () => {
  test("集号前置长英文组不能仅因词多而保留", () => {
    const input =
      "[The Example Translation and Media Lab][蓝色行星][03][1080p]";
    expect(parseTorrentNames(input).title.aliases).toEqual(["蓝色行星"]);
    expect(parseTorrentTitle(input)?.title?.aliases).toEqual(["蓝色行星"]);
  });
});
