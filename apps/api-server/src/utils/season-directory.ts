import path from "path";

export function sanitizeSeasonDirectory(title: string): string {
  const unsafe = '<>:"/\\|?*';
  const replacements = "＜＞：＂／＼｜？＊";
  let directory = title
    .replace(/[<>:"/\\|?*]/g, (char) => replacements[unsafe.indexOf(char)])
    .replace(/[\x00-\x1f\x7f]/g, "_")
    .trim()
    .replace(/[. ]+$/, "");
  // 给文件系统组件长度留出余量，不截断 Unicode 字符。
  const characters = Array.from(directory);
  while (Buffer.byteLength(characters.join(""), "utf8") > 240) {
    characters.pop();
  }
  directory = characters.join("").replace(/[. ]+$/, "");
  if (!directory || directory === "." || directory === "..") {
    throw new Error("季度标题无法生成有效目录名");
  }
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(directory)) {
    directory = `_${directory}`;
  }
  return directory;
}

type DirectoryState = {
  title: string;
  directory: string | null;
  lastWriteDirectory: string | null;
  lastWriteTitle: string | null;
};

// 未同步的旧季度继续使用历史位置，避免部署时隐式移动媒体。
export function getSeasonDirectory(season: DirectoryState): string {
  return (
    season.lastWriteDirectory ??
    season.lastWriteTitle ??
    season.directory ??
    sanitizeSeasonDirectory(season.title)
  );
}

export function resolveSeasonPath(root: string, directory: string): string {
  const result = path.resolve(root, directory);
  const relative = path.relative(path.resolve(root), result);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative)
  ) {
    throw new Error("季度目录必须位于媒体库目录内");
  }
  return result;
}
