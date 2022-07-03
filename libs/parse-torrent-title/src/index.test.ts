import parseTorrentTitle from "@/index";
import { ParseTorrentTitleResult } from "@/types";

type ResultForTesting = Omit<
  ParseTorrentTitleResult,
  "raw" | "positionalItems"
>;

describe("test parseTorrentTitle with title", () => {
  test.each<[string, ResultForTesting]>([
    [
      "[猎户随缘发布组] 女忍者椿的心事 Kunoichi Tsubaki no Mune no Uchi [12] [1080p] [简中内封] [2022年4月番]",
      {
        organization: {
          raw: "猎户随缘发布组",
          parts: ["猎户随缘发布组"],
        },
        title: {
          raw: "女忍者椿的心事 Kunoichi Tsubaki no Mune no Uchi",
          aliases: ["女忍者椿的心事", "Kunoichi Tsubaki no Mune no Uchi"],
        },
        index: 12,
        source: {},
        format: {
          resolution: "1080",
        },
        subtitle: {
          hasCHS: true,
          type: "内嵌",
        },
      },
    ],
    [
      "【喵萌奶茶屋】★04月新番★[夏日重现/Summer Time Rendering][12][1080p][繁日双语][招募翻译片源]",
      {
        organization: {
          raw: "喵萌奶茶屋",
          parts: ["喵萌奶茶屋"],
        },
        title: {
          raw: "夏日重现/Summer Time Rendering",
          aliases: ["夏日重现", "Summer Time Rendering"],
        },
        index: 12,
        source: {},
        format: {
          resolution: "1080",
        },
        subtitle: {
          hasCHT: true,
          hasJP: true,
        },
      },
    ],
    [
      "[Lilith-Raws] 川尻小玉的懒散生活 / Atasha Kawajiri Kodama Da yo - 22 [Baha][WEB-DL][1080p][AVC AAC][CHT][MP4]",
      {
        organization: {
          raw: "Lilith-Raws",
          parts: ["Lilith-Raws"],
        },
        title: {
          raw: "川尻小玉的懒散生活 / Atasha Kawajiri Kodama Da yo",
          aliases: ["川尻小玉的懒散生活", "Atasha Kawajiri Kodama Da yo"],
        },
        index: 22,
        source: {
          type: "WebDL",
          platform: "Baha",
        },
        format: {
          resolution: "1080",
          videoEncoding: "AVC",
          audioEncoding: "AAC",
          container: "MP4",
        },
        subtitle: {
          hasCHT: true,
        },
      },
    ],
    [
      "[千夏字幕组&LoliHouse] 测不准的阿波连同学 / 不会拿捏距离的阿波连同学 / Aharen-san wa Hakarenai - 11 [WebRip 1080p HEVC-10bit AAC][简繁内封字幕]",
      {
        organization: {
          raw: "千夏字幕组&LoliHouse",
          parts: ["千夏字幕组", "LoliHouse"],
        },
        title: {
          raw: "测不准的阿波连同学 / 不会拿捏距离的阿波连同学 / Aharen-san wa Hakarenai",
          aliases: [
            "测不准的阿波连同学",
            "不会拿捏距离的阿波连同学",
            "Aharen-san wa Hakarenai",
          ],
        },
        index: 11,
        source: {
          type: "WebRip",
        },
        format: {
          resolution: "1080",
          videoEncoding: "HEVC",
          colorDepth: "10-bit",
          audioEncoding: "AAC",
        },
        subtitle: {
          hasCHS: true,
          hasCHT: true,
          type: "内嵌",
        },
      },
    ],
    [
      "【极影字幕社】 ★4月新番 【SPY×FAMILY 间谍家家酒】【SPY×FAMILY】【08】BIG5 MP4_720P",
      {
        organization: {
          raw: "极影字幕社",
          parts: ["极影字幕社"],
        },
        title: {
          raw: "【SPY×FAMILY 间谍家家酒】【SPY×FAMILY】",
          aliases: ["SPY×FAMILY 间谍家家酒", "SPY×FAMILY"],
        },
        index: 8,
        source: {},
        format: {
          resolution: "720",
          container: "MP4",
        },
        subtitle: {},
      },
    ],
    [
      "[酷漫404][夏日时光][10][1080P][WebRip][繁日双语][AVC AAC][MP4][字幕组招人内详]",
      {
        organization: {
          raw: "酷漫404",
          parts: ["酷漫404"],
        },
        title: {
          raw: "夏日时光",
          aliases: ["夏日时光"],
        },
        index: 10,
        source: {
          type: "WebRip",
        },
        format: {
          resolution: "1080",
          videoEncoding: "AVC",
          audioEncoding: "AAC",
          container: "MP4",
        },
        subtitle: {
          hasCHT: true,
          hasJP: true,
        },
      },
    ],
    [
      "【千夏字幕组】【相合之物_Deaimon】[第07话][1080p_AVC][简体]",
      {
        organization: {
          raw: "千夏字幕组",
          parts: ["千夏字幕组"],
        },
        title: {
          raw: "相合之物_Deaimon",
          aliases: ["相合之物", "Deaimon"],
        },
        index: 7,
        source: {},
        format: {
          resolution: "1080",
          videoEncoding: "AVC",
        },
        subtitle: {
          hasCHS: true,
        },
      },
    ],
    [
      "[黑岩射手吧字幕组] Black Rock Shooter - Dawn Fall [12 END][1080p][简繁内挂]",
      {
        organization: {
          raw: "黑岩射手吧字幕组",
          parts: ["黑岩射手吧字幕组"],
        },
        title: {
          raw: "Black Rock Shooter - Dawn Fall",
          aliases: ["Black Rock Shooter - Dawn Fall"],
        },
        index: 12,
        source: {},
        format: {
          resolution: "1080",
        },
        subtitle: {
          hasCHS: true,
          hasCHT: true,
          type: "内挂",
        },
      },
    ],
    [
      "【极影字幕社】★04月新番 异世界魔王与召唤少女的奴隶魔术Ω Isekai_Maou_to_Shoukan_Shoujo_no_Dorei_Majutsu 01-10 BIG5 1080P MP4 BDrip HEVC",
      {
        organization: {
          raw: "极影字幕社",
          parts: ["极影字幕社"],
        },
        title: {
          raw: "异世界魔王与召唤少女的奴隶魔术Ω Isekai_Maou_to_Shoukan_Shoujo_no_Dorei_Majutsu",
          aliases: [
            "异世界魔王与召唤少女的奴隶魔术Ω",
            "Isekai_Maou_to_Shoukan_Shoujo_no_Dorei_Majutsu",
          ],
        },
        index: {
          from: 1,
          to: 10,
        },
        source: {
          type: "BDRip",
        },
        format: {
          resolution: "1080",
          videoEncoding: "HEVC",
          container: "MP4",
        },
        subtitle: {
          hasCHT: true,
        },
      },
    ],
    [
      "【悠哈璃羽字幕社】 [夏日重现__Summer-Time-Rendering] [09] [x264 1080p][CHS]",
      {
        organization: {
          raw: "悠哈璃羽字幕社",
          parts: ["悠哈璃羽字幕社"],
        },
        title: {
          raw: "夏日重现__Summer-Time-Rendering",
          aliases: ["夏日重现", "Summer-Time-Rendering"],
        },
        index: 9,
        source: {},
        format: {
          resolution: "1080",
          videoEncoding: "x264",
        },
        subtitle: {
          hasCHS: true,
        },
      },
    ],
    [
      "【幻樱字幕组】【7月新番】【传颂之物 二人白皇 Utawarerumono-Futari no Hakuoro-】【01~02v2】【GB_MP4】【1280X720】",
      {
        organization: {
          raw: "幻樱字幕组",
          parts: ["幻樱字幕组"],
        },
        title: {
          raw: "传颂之物 二人白皇 Utawarerumono-Futari no Hakuoro-",
          aliases: ["传颂之物 二人白皇", "Utawarerumono-Futari no Hakuoro-"],
        },
        index: {
          from: 1,
          to: 2,
        },
        source: {},
        format: {
          resolution: "720",
          container: "MP4",
        },
        subtitle: {
          hasCHS: true,
        },
      },
    ],
    [
      "[NC-Raws] You 0 DECO / Yurei Deco - 01 (B-Global 1920x1080 HEVC AAC MKV)",
      {
        organization: {
          raw: "NC-Raws",
          parts: ["NC-Raws"],
        },
        title: {
          raw: "You 0 DECO / Yurei Deco",
          aliases: ["You 0 DECO", "Yurei Deco"],
        },
        index: 1,
        source: {
          platform: "B-Global",
        },
        format: {
          videoEncoding: "HEVC",
          audioEncoding: "AAC",
          container: "MKV",
          resolution: "1080",
        },
      },
    ],
    [
      "[NaN-Raws]联盟空军航空魔法音乐队_光辉魔女[1][Bahamut][WEB-DL][1080P][AVC_AAC][CHT][MP4][bangumi.online]",
      {
        organization: {
          raw: "NaN-Raws",
          parts: ["NaN-Raws"],
        },
        title: {
          raw: "联盟空军航空魔法音乐队_光辉魔女",
          aliases: ["联盟空军航空魔法音乐队", "光辉魔女"],
        },
        index: 1,
        source: {
          type: "WebDL",
          platform: "Baha",
        },
        format: {
          resolution: "1080",
          videoEncoding: "AVC",
          audioEncoding: "AAC",
          container: "MP4",
        },
        subtitle: {
          hasCHT: true,
        },
      },
    ],
  ])("%s", (input, output) => {
    const result = parseTorrentTitle(input);
    expect(result).toMatchObject(output);
  });
});
