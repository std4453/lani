import parseTorrentTitle from "./parseTorrentTitle";
import matchEpisode from "./matchEpisode";
import matchSpecialEpisode from "./matchSpecialEpisode";
import { EpisodeInfo, PositionalItemType } from "./types";

export interface ParsedVideoFilename {
  episodeInfo: EpisodeInfo;
  /** 相对于传入路径的位置，供界面高亮原始编号。 */
  position: { index: number; length: number };
}

/** 文件可只有编号和单集标题；不要放宽种子标题的识别规则。 */
export function parseVideoFilename(
  input: string
): ParsedVideoFilename | undefined {
  const start = Math.max(input.lastIndexOf("/"), input.lastIndexOf("\\")) + 1;
  const basename = input.slice(start);
  const name = basename.replace(/\.[a-z0-9]{2,5}$/i, "");
  const parsed = parseTorrentTitle(name);
  const position = parsed?.positionalItems.find(
    (item) => item.type === PositionalItemType.INDEX
  );
  if (parsed && position)
    return {
      episodeInfo: parsed.episodeInfo,
      position: { index: start + position.index, length: position.length },
    };
  const special = matchSpecialEpisode(name);
  if (special)
    return {
      episodeInfo: { type: special.type, index: special.index },
      position: {
        index: start + special.start,
        length: special.end - special.start,
      },
    };
  const explicit = matchEpisode(name, true);
  if (explicit)
    return {
      episodeInfo: { type: "episode", index: explicit.value },
      position: {
        index: start + explicit.start,
        length: explicit.end - explicit.start,
      },
    };
  // 合集内常见 062-标题；排除年份、技术参数及编号范围。
  const leading = /^(\d{1,4}(?:\.5)?)(?=$|\s*[-_]\s*[^\d\s])/.exec(name);
  if (!leading) return undefined;
  const number = Number(leading[1]);
  if (number >= 1900 && number <= 2099) return undefined;
  if (/^\d+(?:\.5)?\s*[-_]\s*(?:bit|bits|p|fps|kbps|mbps)\b/i.test(name))
    return undefined;
  return {
    episodeInfo: { type: "episode", index: number },
    position: { index: start, length: leading[1].length },
  };
}
