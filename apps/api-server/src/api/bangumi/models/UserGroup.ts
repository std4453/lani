/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 用户组 - 1 = 管理员 - 2 = Bangumi 管理猿 - 3 = 天窗管理猿 - 4 = 禁言用户 - 5 = 禁止访问用户 - 8 = 人物管理猿 - 9 = 维基条目管理猿 - 10 = 用户 - 11 = 维基人
 */
export enum UserGroup {
  Admin = 1,
  BangumiAdmin = 2,
  DoujinAdmin = 3,
  MutedUser = 4,
  BlockedUser = 5,
  PersonAdmin = 8,
  WikiAdmin = 9,
  User = 10,
  WikiUser = 11,
}