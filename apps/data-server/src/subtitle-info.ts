import type { SubtitleInfo } from "@lani/parse-torrent-title";

function isSubtitleInfo(value: any): value is SubtitleInfo {
  return (
    value != null &&
    Array.isArray(value.languages) &&
    value.languages.every(
      (language: unknown) => typeof language === "string"
    ) &&
    typeof value.multi === "boolean" &&
    Array.isArray(value.delivery) &&
    value.delivery.every((delivery: unknown) =>
      ["muxed", "external", "burned-in"].includes(delivery as string)
    )
  );
}

// 页面未知时保留标题；抓取失败也仍使用上一次成功保存的页面结果。
export function mergeSubtitleInfo(
  title: SubtitleInfo | null | undefined,
  metadataResult: unknown
): SubtitleInfo | null | undefined {
  const result = metadataResult as {
    status?: string;
    subtitleInfo?: unknown;
  } | null;
  if (result?.status === "none" && result.subtitleInfo === null) {
    return title?.languages.length ? title : null;
  }
  if (result?.status !== "known" || !isSubtitleInfo(result.subtitleInfo)) {
    return title;
  }
  const page = result.subtitleInfo;
  let languages = [
    ...new Set([...(title?.languages ?? []), ...page.languages]),
  ];
  if (languages.includes("zh-Hans") || languages.includes("zh-Hant")) {
    languages = languages.filter((language) => language !== "zh");
  }
  return {
    languages: languages.sort(),
    multi: !!title?.multi || page.multi || languages.length > 1,
    delivery: [
      ...new Set([...(title?.delivery ?? []), ...page.delivery]),
    ].sort(),
  };
}
