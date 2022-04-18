export function matchTorrentEpisode(title: string):
  | {
      index: number;
      length: number;
    }
  | undefined {
  // 由于safari不支持lookahead和lookbehind，ff<=77不支持named capture group，
  // 所以这里最后还是采用比较基础的正则匹配
  const episodeRegexes = [
    /-\s(\d{1,3})\s/,
    /\[(\d{1,3})((\sEND)|(v\d+))?\]/,
    /\u7b2c(\d{1,3})\u96c6/,
    /\u3010(\d{1,3})\u3011/,
  ];
  for (const regex of episodeRegexes) {
    const result = title.match(regex);
    if (!result) {
      continue;
    }
    const totalIndex = result.index;
    const totalMatch = result[0];
    const groupMatch = result[1];
    if (typeof totalIndex !== 'number' || !totalMatch || !groupMatch) {
      continue;
    }
    const deltaIndex = totalMatch.indexOf(groupMatch);
    if (deltaIndex < 0) {
      continue;
    }
    const index = totalIndex + deltaIndex;
    const length = groupMatch.length;
    return {
      index,
      length,
    };
  }
  return undefined;
}
