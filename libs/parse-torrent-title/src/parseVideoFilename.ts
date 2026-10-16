import parseTorrentTitle from "./parseTorrentTitle";
import matchEpisode from "./matchEpisode";
import matchSpecialEpisode from "./matchSpecialEpisode";
import { EpisodeInfo, PositionalItemType } from "./types";

export interface ParsedVideoFilename {
  episodeInfo: EpisodeInfo;
  /** 相对于传入路径的位置，供界面高亮原始编号。 */
  position: { index: number; length: number };
}

/** 普通单集只高亮数字，不包含分隔横线、括号、季度编号或修订后缀。 */
function highlightPosition(
  input: string,
  info: EpisodeInfo,
  position: { index: number; length: number }
): { index: number; length: number } {
  if (info.type !== "episode" || typeof info.index !== "number")
    return position;
  const marker = input.slice(position.index, position.index + position.length);
  const matches = [...marker.matchAll(/[0-9０-９]+(?:[.．][0-9０-９]+)?/g)]
    .filter((match) => !/[vV]$/.test(marker.slice(0, match.index)))
    .filter(
      (match) =>
        Number(
          match[0]
            .replace(/[０-９]/g, (c) =>
              String.fromCharCode(c.charCodeAt(0) - 0xfee0)
            )
            .replace("．", ".")
        ) === info.index
    );
  const match = matches[matches.length - 1];
  return match
    ? { index: position.index + match.index!, length: match[0].length }
    : position;
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
      position: highlightPosition(input, parsed.episodeInfo, {
        index: start + position.index,
        length: position.length,
      }),
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
      position: highlightPosition(
        input,
        { type: "episode", index: explicit.value },
        {
          index: start + explicit.start,
          length: explicit.end - explicit.start,
        }
      ),
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
