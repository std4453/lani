/**
 * 季度/系列标题
 */
export interface Title {
  /**
   * 未处理的完整标题
   */
  raw: string;
  /**
   * 拆分后的多语言/同义标题
   */
  aliases: string[];
}

/**
 * 包含的集数，单集或多集
 */
export type Index =
  | number
  | {
      from: number;
      to: number;
    };

export type Resolution = "1080" | "720" | "2160";

export type ColorDepth = "8-bit" | "10-bit";

/**
 * 格式信息
 */
export interface Format {
  /**
   * 分辨率
   */
  resolution?: Resolution;
  /**
   * 视频编码，比如HEVC、AVC、x264
   */
  videoEncoding?: string;
  /**
   * 音频编码，比如AAC
   */
  audioEncoding?: string;
  /**
   * 容器格式，比如MKV
   */
  container?: string;
  /**
   * 颜色深度，一般为8或者10
   */
  colorDepth?: ColorDepth;
}

/**
 * 片源类型
 */
export type SourceType = "WebDL" | "WebRip" | "BDRip" | "Donghua" | "BD";

/**
 * 已知的平台
 */
export type Platform = "Baha" | "B-Global" | "B-THM" | "Bilibili" | "ViuTV";

/**
 * 文件来源
 */
export interface Source {
  /**
   * 来源类型，如WebDL、WebRip、BDRip
   */
  type?: SourceType;
  /**
   * 来源平台
   */
  platform?: Platform;
}

export interface Organization {
  /**
   * 未经处理的原始字符串
   */
  raw: string;
  /**
   * 拆分后的字幕组列表
   */
  parts: string[];
}

export type SubtitleType = "内嵌" | "外挂" | "内挂";

export interface Subtitle {
  hasCHS?: true | false;
  hasCHT?: true | false;
  hasJP?: true | false;
  type?: SubtitleType;
}

export enum PositionalItemType {
  ORGANIZATION = "organization",
  TITLE = "title",
  INDEX = "index",
  PLATFORM = "platform",
  SOURCE_TYPE = "source_type",
  RESOLUTION = "resolution",
  VIDEO_ENCODING = "video_encoding",
  AUDIO_ENCODING = "audio_encoding",
  CONTAINER = "container",
  COLOR_DEPTH = "color_depth",
  SUBTITLE = "subtitle",
}

export interface PositionalItem {
  index: number;
  length: number;
  type: PositionalItemType;
}

export interface ParseTorrentTitleResult {
  /**
   * 字幕组
   */
  organization?: Organization;
  /**
   * 季度标题
   */
  title: Title;
  /**
   * 集数
   */
  index: Index;
  /**
   * 来源
   */
  source: Source;
  /**
   * 格式信息
   */
  format: Format;
  /**
   * 字幕信息
   */
  subtitle?: Subtitle;

  /**
   * 原始标题
   */
  raw: string;
  /**
   * 位置性信息，用于debug或者前端展示
   */
  positionalItems: PositionalItem[];
}

export type KeywordMatch = string | RegExp;

export type KeywordMap<ValueType extends string> = {
  [value in ValueType]?: KeywordMatch[];
};

export interface ParseTorrentTitleOptions {
  separatorPairs?: [string, string][];
  organizationSeparators?: string[];
  titleSeparatorChars?: string[];
  episodePrefixSeparators?: [string, string][];
  episodeRegexes?: RegExp[];
  episodeConnectorRegex?: RegExp;
  episodeInnerRegex?: RegExp;
  fixUnmatchedEpisodePrefix?: boolean;
  titleNonEnglishRegex?: RegExp;

  keywordSeparators?: string[];
  keywordSecondarySeparators?: string[];
  sourceTypeMap?: KeywordMap<SourceType>;
  platformMap?: KeywordMap<Platform>;
  videoEncodingKeywords?: KeywordMatch[];
  audioEncodingKeywords?: KeywordMatch[];
  containerKeywords?: KeywordMatch[];
  resolutionMap?: KeywordMap<Resolution>;
  colorDepthMap?: KeywordMap<ColorDepth>;
  subtitleKeywords?: KeywordMatch[];
}
