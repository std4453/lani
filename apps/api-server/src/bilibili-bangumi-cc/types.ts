import {
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator';

export class BilibiliSuccessResponse {
  code: number;
  @IsOptional()
  message?: string;
  result: any;
}

export class BilibiliArea {
  id: number;
  name: string;
}

export class BilibiliEpisode {
  id: number;
  aid: number;
  bvid: string;
  cid: number;

  // "badge": "会员",
  // "badge_info": {
  //   "bg_color": "#FB7299",
  //   "bg_color_night": "#BB5B76",
  //   "text": "会员"
  // },
  // "badge_type": 0,

  @IsUrl()
  cover: string;
  // "dimension": { "height": 1080, "rotate": 0, "width": 1920 },

  @IsInt()
  duration: number;

  // "from": "bangumi",
  // "is_view_hide": false,

  @IsUrl()
  link: string;

  @IsNotEmpty()
  long_title: string;

  pub_time: number;

  // "pv": 0,
  // "release_date": "",
  // "rights": {
  //   "allow_demand": 0,
  //   "allow_dm": 1,
  //   "allow_download": 0,
  //   "area_limit": 0
  // },
  // "share_copy": "《打了300年的史莱姆，不知不觉就练到了满级》第1话 满级了",
  // "share_url": "https://www.bilibili.com/bangumi/play/ep391717",
  // "short_link": "https://b23.tv/ep391717",
  // "status": 13,
  // "subtitle": "已观看8162.5万次",
  @IsNumberString()
  title: string;
  // "vid": ""
}

export class BilibiliEpisodeSummary {
  desc: string;
  /**
   * ssid
   */
  id: number;
  /**
   * 0 for false
   */
  is_new: number;
  title;
}

export class BilibiliPublish {
  /**
   * 0：未完结
   * 1：已完结
   */
  is_finish: number;
  /**
   * 0：未发布
   * 1：已发布
   */
  is_started: number;
  /**
   * YYYY-MM-DDD hh:mm:ss
   */
  pub_time: string;
  /**
   * only for display
   */
  pub_time_show: string;
  // unknow_pub_date: 0;
  // weekday: number;
}

export class BilibiliRating {
  @IsInt()
  count: number;
  score: number;
}

export class BilibiliSeasonSeasonStat {
  favorites: number;
  series_follow: number;
  views: number;
}

export class BilibiliSeasonSeason {
  // "badge": "会员专享",
  // "badge_info": {
  //   "bg_color": "#FB7299",
  //   "bg_color_night": "#BB5B76",
  //   "text": "会员专享"
  // },
  // "badge_type": 0,

  @IsUrl()
  cover: string;

  // horizontal_cover_1610": "",
  // "horizontal_cover_169": "",

  @IsInt()
  media_id: number;

  // new_ep": {
  //   "cover": "http://i0.hdslb.com/bfs/archive/c4b567b8910b59cab93294184cc1d9ed7c0acd4d.jpg",
  //   "id": 391728,
  //   "index_show": "全12话"
  // },

  @IsInt()
  season_id: number;

  // "season_title": "TV",
  // "season_type": 1,

  @IsOptional()
  @ValidateNested()
  stat?: BilibiliSeasonSeasonStat;
}

export class BilibiliSeason {
  // "activity": { "head_bg_url": "", "id": 0, "title": "" },
  // "alias": "",
  // "bkg_cover": "",

  @ValidateNested()
  areas: BilibiliArea[];

  @IsUrl()
  cover: string;

  @ValidateNested()
  episodes: BilibiliEpisode[];

  @IsOptional()
  evaluate?: string;

  // "freya": { "bubble_desc": "", "bubble_show_cnt": 0, "icon_show": 1 },
  // "jp_title": "",

  @IsUrl()
  link: string;
  media_id: number;

  // "mode": 2,
  // "new_ep": {
  //   "desc": "已完结, 全12话",
  //   "id": 391728,
  //   "is_new": 0,
  //   "title": "12"
  // },
  // "payment": {
  //   "discount": 100,
  //   "pay_type": {
  //     "allow_discount": 0,
  //     "allow_pack": 0,
  //     "allow_ticket": 0,
  //     "allow_time_limit": 0,
  //     "allow_vip_discount": 0,
  //     "forbid_bb": 0
  //   },
  //   "price": "0.0",
  //   "promotion": "",
  //   "tip": "大会员专享观看特权哦~",
  //   "view_start_time": 0,
  //   "vip_discount": 100,
  //   "vip_first_promotion": "",
  //   "vip_promotion": "开通大会员观看"
  // },
  // "positive": { "id": 57675, "title": "正片" },

  @ValidateNested()
  publish: BilibiliPublish;

  @IsOptional()
  @ValidateNested()
  rating?: BilibiliRating;

  // "record": "",
  // "rights": {
  //   "allow_bp": 0,
  //   "allow_bp_rank": 0,
  //   "allow_download": 0,
  //   "allow_review": 1,
  //   "area_limit": 328,
  //   "ban_area_show": 1,
  //   "can_watch": 1,
  //   "copyright": "bilibili",
  //   "forbid_pre": 0,
  //   "freya_white": 0,
  //   "is_cover_show": 0,
  //   "is_preview": 0,
  //   "only_vip_download": 0,
  //   "resource": "",
  //   "watch_platform": 0
  // },

  @IsInt()
  season_id: number;
  @IsNotEmpty()
  season_title: string;

  @ValidateNested()
  seasons: BilibiliSeasonSeason[];

  // sections

  @IsOptional()
  @ValidateNested()
  series?: BilibiliSeries;

  // share_copy": "《打了300年的史莱姆，不知不觉就练到了满级》",
  // "share_sub_title": "",
  // "share_url": "https://www.bilibili.com/bangumi/play/ss38229",
  // "show": { "wide_screen": 0 },
  // "show_season_type": 0,

  @IsOptional()
  @IsUrl()
  square_cover?: string;

  @IsOptional()
  @ValidateNested()
  stat?: BilibiliSeasonStat;

  // "status": 13,
  // "subtitle": "已观看8162.5万次",

  @IsNotEmpty()
  title: string;

  @IsInt()
  total: number;

  // "type": 1,
  // "up_info": {
  //   "avatar": "http://i1.hdslb.com/bfs/face/70fba98159d382c91d236289a3294fb2b0c3f258.jpg",
  //   "follower": 5089743,
  //   "is_follow": 0,
  //   "mid": 928123,
  //   "pendant": { "image": "", "name": "", "pid": 0 },
  //   "theme_type": 0,
  //   "uname": "哔哩哔哩番剧",
  //   "verify_type": 3,
  //   "vip_label": {
  //     "label_theme": "ten_annual_vip",
  //     "path": "",
  //     "text": "十年大会员"
  //   },
  //   "vip_status": 1,
  //   "vip_type": 2
  // },
  // "user_status": {
  //   "area_limit": 0,
  //   "ban_area_show": 0,
  //   "follow": 0,
  //   "follow_status": 0,
  //   "login": 0,
  //   "pay": 0,
  //   "pay_pack_paid": 0,
  //   "sponsor": 0
  // }
}

export class BilibiliSeasonStat {
  coins: number;
  danmakus: number;
  favorite: number;
  favorites: number;
  likes: number;
  reply: number;
  share: number;
  views: number;
}

export class BilibiliSeries {
  @IsInt()
  series_id: number;
  @IsNotEmpty()
  series_title: string;
}

export class BilibiliSubtitle {
  id: number;
  id_str: string;
  lan: string;
  lan_doc: string;
  @IsUrl()
  subtitle_url: string;
  type: number;
  ai_type: number;
}

export class BilibiliSubtitles {
  lan: string;
  lan_doc: string;
  @ValidateNested()
  subtitles: BilibiliSubtitle[];
}

export class BilibiliDanmaku {
  closed: boolean;

  // "dm_seg": { "page_size": 360000, "total": 100 },
  // "flag": {
  //   "rec_flag": 3,
  //   "rec_text": "开启后，全站视频将按等级等优化弹幕",
  //   "rec_switch": 1
  // },

  @ValidateNested()
  subtitle: BilibiliSubtitles;
}

export class BilibiliCCJSONItem {
  content: string;
  from: number;
  location: number;
  to: number;
}

export class BilibiliCCJSON {
  @ValidateNested()
  body: BilibiliCCJSONItem[];
}

export enum BilibiliProxyRegion {
  THM = 'thm',
  MAINLAND = 'mainland',
  GLOBAL = 'global',
}
