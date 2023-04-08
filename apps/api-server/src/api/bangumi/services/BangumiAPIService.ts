/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacterDetail } from '../models/CharacterDetail';
import type { CharacterPerson } from '../models/CharacterPerson';
import type { CharacterRevision } from '../models/CharacterRevision';
import type { DetailedRevision } from '../models/DetailedRevision';
import type { EpisodeCollectionType } from '../models/EpisodeCollectionType';
import type { EpisodeDetail } from '../models/EpisodeDetail';
import type { EpType } from '../models/EpType';
import type { Index } from '../models/Index';
import type { IndexBasicInfo } from '../models/IndexBasicInfo';
import type { IndexSubjectAddInfo } from '../models/IndexSubjectAddInfo';
import type { IndexSubjectEditInfo } from '../models/IndexSubjectEditInfo';
import type { Legacy_SubjectLarge } from '../models/Legacy_SubjectLarge';
import type { Legacy_SubjectMedium } from '../models/Legacy_SubjectMedium';
import type { Legacy_SubjectSmall } from '../models/Legacy_SubjectSmall';
import type { Legacy_SubjectType } from '../models/Legacy_SubjectType';
import type { Page } from '../models/Page';
import type { Paged_Episode } from '../models/Paged_Episode';
import type { Paged_Revision } from '../models/Paged_Revision';
import type { Paged_UserCollection } from '../models/Paged_UserCollection';
import type { PersonCharacter } from '../models/PersonCharacter';
import type { PersonDetail } from '../models/PersonDetail';
import type { PersonRevision } from '../models/PersonRevision';
import type { RelatedCharacter } from '../models/RelatedCharacter';
import type { RelatedPerson } from '../models/RelatedPerson';
import type { Subject } from '../models/Subject';
import type { SubjectCollectionType } from '../models/SubjectCollectionType';
import type { SubjectID } from '../models/SubjectID';
import type { SubjectRevision } from '../models/SubjectRevision';
import type { SubjectTags } from '../models/SubjectTags';
import type { SubjectType } from '../models/SubjectType';
import type { User } from '../models/User';
import type { UserEpisodeCollection } from '../models/UserEpisodeCollection';
import type { UserSubjectCollection } from '../models/UserSubjectCollection';
import type { v0_RelatedSubject } from '../models/v0_RelatedSubject';
import type { v0_subject_relation } from '../models/v0_subject_relation';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BangumiAPIService {

  /**
   * 每日放送
   * @returns any 每日放送
   * @throws ApiError
   */
  public static getCalendar(): CancelablePromise<Array<{
    weekday?: {
      en?: string;
      cn?: string;
      ja?: string;
      id?: number;
    };
    items?: Array<Legacy_SubjectSmall>;
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/calendar',
    });
  }

  /**
   * 条目搜索
   * @param keywords 关键词 <br> 需要 URL Encode
   * @param type 条目类型，参考 [SubjectType](#model-Legacy_SubjectType)
   * @param responseGroup 返回数据大小 <br> 默认为 small
   * @param start 开始条数
   * @param maxResults 每页条数 <br> 最多 25
   * @returns any 搜索结果
   * @throws ApiError
   */
  public static searchSubjectByKeywords(
    keywords: string,
    type?: Legacy_SubjectType,
    responseGroup: 'small' | 'medium' | 'large' = 'small',
    start?: number,
    maxResults?: number,
  ): CancelablePromise<({
    /**
     * 总条数
     */
    results?: number;
    /**
     * 结果列表
     */
    list?: Array<Legacy_SubjectSmall>;
  } | {
    /**
     * 总条数
     */
    results?: number;
    /**
     * 结果列表
     */
    list?: Array<Legacy_SubjectMedium>;
  } | {
    /**
     * 总条数
     */
    results?: number;
    /**
     * 结果列表
     */
    list?: Array<Legacy_SubjectLarge>;
  })> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/search/subject/{keywords}',
      path: {
        'keywords': keywords,
      },
      query: {
        'type': type,
        'responseGroup': responseGroup,
        'start': start,
        'max_results': maxResults,
      },
    });
  }

  /**
   * 条目搜索
   * ## 实验性 API， 本 schema 和实际的 API 行为都可能随时发生改动
   *
   * 目前支持的筛选条件包括:
   * - `type`: 条目类型，参照 `SubjectType` enum， `或`。
   * - `tag`: 标签，可以多次出现。`且` 关系。
   * - `airdate`: 播出日期/发售日期。`且` 关系。
   * - `rating`: 用于搜索指定评分的条目。`且` 关系。
   * - `rank`: 用于搜索指定排名的条目。`且` 关系。
   * - `nsfw`: 使用 `include` 包含NSFW搜索结果。默认排除搜索NSFW条目。无权限情况下忽略此选项，不会返回NSFW条目。
   *
   * 不同筛选条件之间为 `且`
   *
   *
   * 由于目前 meilisearch 的一些问题，条目排名更新并不会触发搜索数据更新，所以条目排名可能是过期数据。
   *
   * 希望未来版本的 meilisearch 能解决相关的问题。
   *
   * @param limit 分页参数
   * @param offset 分页参数
   * @param requestBody
   * @returns any 返回搜索结果
   * @throws ApiError
   */
  public static searchSubjects(
    limit?: number,
    offset?: number,
    requestBody?: {
      keyword: string;
      /**
       * 排序规则
       *
       * - `match` meilisearch 的默认排序，按照匹配程度
       * - `heat` 收藏人数
       * - `rank` 排名由高到低
       * - `score` 评分
       *
       */
      sort?: 'match' | 'heat' | 'rank' | 'score';
      /**
       * 不同条件之间是 `且` 的关系
       */
      filter?: {
        /**
         * 条目类型，参照 `SubjectType` enum，多值之间为 `或` 的关系。
         */
        type?: Array<SubjectType>;
        /**
         * 标签，可以多次出现。多值之间为 `且` 关系。
         */
        tag?: Array<string>;
        /**
         * 播出日期/发售日期，日期必需为 `YYYY-MM-DD` 格式。多值之间为 `且` 关系。
         */
        air_date?: Array<string>;
        /**
         * 用于搜索指定评分的条目，多值之间为 `且` 关系。
         */
        rating?: Array<string>;
        /**
         * 用于搜索指定排名的条目，多值之间为 `且` 关系。
         */
        rank?: Array<string>;
        /**
         * 无权限的用户会直接忽略此字段，不会返回R18条目。
         *
         * 默认或者 `null` 会返回包含 R18 的所有搜索结果。
         *
         * `true` 只会返回 R18 条目。
         *
         * `false` 只会返回非 R18 条目。
         *
         */
        nsfw?: boolean;
      };
    },
  ): CancelablePromise<{
    /**
     * 搜索结果数量
     */
    total?: number;
    /**
     * 当前分页参数
     */
    limit?: number;
    /**
     * 当前分页参数
     */
    offset?: number;
    data?: Array<{
      /**
       * 条目ID
       */
      id: number;
      type?: SubjectType;
      /**
       * 上映/开播/连载开始日期，可能为空字符串
       */
      date: string;
      /**
       * 封面
       */
      image: string;
      /**
       * 条目描述
       */
      summary: string;
      /**
       * 条目原名
       */
      name: string;
      /**
       * 条目中文名
       */
      name_cn: string;
      tags: SubjectTags;
      /**
       * 评分
       */
      score: number;
      /**
       * 排名
       */
      rank: number;
    }>;
  }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v0/search/subjects',
      query: {
        'limit': limit,
        'offset': offset,
      },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  /**
   * 获取条目
   * cache with 300s
   * @param subjectId 条目 ID
   * @returns Subject Successful Response
   * @throws ApiError
   */
  public static getSubjectById(
    subjectId: SubjectID,
  ): CancelablePromise<Subject> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/subjects/{subject_id}',
      path: {
        'subject_id': subjectId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Subject Image
   * @param subjectId 条目 ID
   * @param type 枚举值 {small|grid|large|medium|common}
   * @returns void
   * @throws ApiError
   */
  public static getSubjectImageById(
    subjectId: SubjectID,
    type: string,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/subjects/{subject_id}/image',
      path: {
        'subject_id': subjectId,
      },
      query: {
        'type': type,
      },
      errors: {
        302: `Successful Response`,
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Subject Persons
   * @param subjectId 条目 ID
   * @returns RelatedPerson Successful Response
   * @throws ApiError
   */
  public static getRelatedPersonsBySubjectId(
    subjectId: SubjectID,
  ): CancelablePromise<Array<RelatedPerson>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/subjects/{subject_id}/persons',
      path: {
        'subject_id': subjectId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Subject Characters
   * @param subjectId 条目 ID
   * @returns RelatedCharacter Successful Response
   * @throws ApiError
   */
  public static getRelatedCharactersBySubjectId(
    subjectId: SubjectID,
  ): CancelablePromise<Array<RelatedCharacter>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/subjects/{subject_id}/characters',
      path: {
        'subject_id': subjectId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Subject Relations
   * @param subjectId 条目 ID
   * @returns v0_subject_relation Successful Response
   * @throws ApiError
   */
  public static getRelatedSubjectsBySubjectId(
    subjectId: SubjectID,
  ): CancelablePromise<Array<v0_subject_relation>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/subjects/{subject_id}/subjects',
      path: {
        'subject_id': subjectId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Episodes
   * @param subjectId 条目 ID
   * @param type 参照章节的`type`
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_Episode Successful Response
   * @throws ApiError
   */
  public static getEpisodes(
    subjectId: SubjectID,
    type?: EpType,
    limit: number = 100,
    offset?: number,
  ): CancelablePromise<Paged_Episode> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/episodes',
      query: {
        'subject_id': subjectId,
        'type': type,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Episode
   * @param episodeId 章节 ID
   * @returns EpisodeDetail Successful Response
   * @throws ApiError
   */
  public static getEpisodeById(
    episodeId: number,
  ): CancelablePromise<EpisodeDetail> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/episodes/{episode_id}',
      path: {
        'episode_id': episodeId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Character Detail
   * cache with 60s
   * @param characterId 角色 ID
   * @returns CharacterDetail Successful Response
   * @throws ApiError
   */
  public static getCharacterById(
    characterId: number,
  ): CancelablePromise<CharacterDetail> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/characters/{character_id}',
      path: {
        'character_id': characterId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Character Image
   * @param characterId 角色 ID
   * @param type 枚举值 {small|grid|large|medium}
   * @returns void
   * @throws ApiError
   */
  public static getCharacterImageById(
    characterId: number,
    type: string,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/characters/{character_id}/image',
      path: {
        'character_id': characterId,
      },
      query: {
        'type': type,
      },
      errors: {
        302: `Successful Response`,
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * get character related subjects
   * @param characterId 角色 ID
   * @returns v0_RelatedSubject Successful Response
   * @throws ApiError
   */
  public static getRelatedSubjectsByCharacterId(
    characterId: number,
  ): CancelablePromise<Array<v0_RelatedSubject>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/characters/{character_id}/subjects',
      path: {
        'character_id': characterId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * get character related persons
   * @param characterId 角色 ID
   * @returns CharacterPerson Successful Response
   * @throws ApiError
   */
  public static getRelatedPersonsByCharacterId(
    characterId: number,
  ): CancelablePromise<Array<CharacterPerson>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/characters/{character_id}/persons',
      path: {
        'character_id': characterId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Person
   * cache with 60s
   * @param personId 人物 ID
   * @returns PersonDetail Successful Response
   * @throws ApiError
   */
  public static getPersonById(
    personId: number,
  ): CancelablePromise<PersonDetail> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/persons/{person_id}',
      path: {
        'person_id': personId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Person Image
   * @param personId 人物 ID
   * @param type 枚举值 {small|grid|large|medium}
   * @returns void
   * @throws ApiError
   */
  public static getPersonImageById(
    personId: number,
    type: string,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/persons/{person_id}/image',
      path: {
        'person_id': personId,
      },
      query: {
        'type': type,
      },
      errors: {
        302: `Successful Response`,
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * get person related subjects
   * @param personId 人物 ID
   * @returns v0_RelatedSubject Successful Response
   * @throws ApiError
   */
  public static getRelatedSubjectsByPersonId(
    personId: number,
  ): CancelablePromise<Array<v0_RelatedSubject>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/persons/{person_id}/subjects',
      path: {
        'person_id': personId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * get person related characters
   * @param personId 人物 ID
   * @returns PersonCharacter Successful Response
   * @throws ApiError
   */
  public static getRelatedCharactersByPersonId(
    personId: number,
  ): CancelablePromise<Array<PersonCharacter>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/persons/{person_id}/characters',
      path: {
        'person_id': personId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get User by name
   * 获取用户信息
   * @param username 设置了用户名之后无法使用 UID。
   * @returns User Successful Response
   * @throws ApiError
   */
  public static getUserByName(
    username: string,
  ): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/{username}',
      path: {
        'username': username,
      },
      errors: {
        400: `username 太长`,
        404: `对应用户不存在`,
      },
    });
  }

  /**
   * Get User Avatar by name
   * 获取用户头像，302 重定向至头像地址，设置了 username 之后无法使用 UID 查询。
   * @param username 设置了用户名之后无法使用 UID。
   * @param type 枚举值 {small|large|medium}
   * @returns void
   * @throws ApiError
   */
  public static getUserAvatarByName(
    username: string,
    type: string,
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/{username}/avatar',
      path: {
        'username': username,
      },
      query: {
        'type': type,
      },
      errors: {
        302: `Successful Response`,
        400: `username 太长`,
        404: `对应用户不存在`,
      },
    });
  }

  /**
   * Get User
   * 返回当前 Access Token 对应的用户信息
   * @returns User Successful Response
   * @throws ApiError
   */
  public static getMyself(): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/me',
      errors: {
        403: `unauthorized`,
      },
    });
  }

  /**
   * 获取用户收藏
   * 获取对应用户的收藏，查看私有收藏需要access token。
   * @param username 设置了用户名之后无法使用 UID。
   * @param subjectType 条目类型，默认为全部
   *
   * 具体含义见 [SubjectType](#model-SubjectType)
   * @param type 收藏类型，默认为全部
   *
   * 具体含义见 [CollectionType](#model-CollectionType)
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_UserCollection Successful Response
   * @throws ApiError
   */
  public static getUserCollectionsByUsername(
    username: string,
    subjectType?: SubjectType,
    type?: SubjectCollectionType,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_UserCollection> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/{username}/collections',
      path: {
        'username': username,
      },
      query: {
        'subject_type': subjectType,
        'type': type,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
        404: `用户不存在`,
      },
    });
  }

  /**
   * 获取用户单个收藏
   * 获取对应用户的收藏，查看私有收藏需要access token。
   * @param username 设置了用户名之后无法使用 UID。
   * @param subjectId 条目 ID
   * @returns UserSubjectCollection Successful Response
   * @throws ApiError
   */
  public static getUserCollection(
    username: string,
    subjectId: SubjectID,
  ): CancelablePromise<UserSubjectCollection> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/{username}/collections/{subject_id}',
      path: {
        'username': username,
        'subject_id': subjectId,
      },
      errors: {
        400: `Validation Error`,
        404: `用户不存在或者条目未收藏，或者条目为私有收藏`,
      },
    });
  }

  /**
   * 修改用户单个收藏
   * 修改条目收藏状态
   *
   * 由于直接修改剧集条目的完成度可能会引起意料之外效果，只能用于修改书籍类条目的完成度。
   *
   * PATCH 方法的所有请求体字段均可选
   *
   * @param subjectId 条目 ID
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static patchUserCollection(
    subjectId: SubjectID,
    requestBody?: {
      /**
       * 修改条目收藏类型
       */
      type?: SubjectCollectionType;
      /**
       * 评分，`0` 表示删除评分
       */
      rate?: number;
      /**
       * 只能用于修改书籍条目进度
       */
      ep_status?: number;
      /**
       * 只能用于修改书籍条目进度
       */
      vol_status?: number;
      /**
       * 评价
       */
      comment?: string;
      /**
       * 仅自己可见
       */
      private?: boolean;
      /**
       * 不传或者 `null` 都会被忽略，传 `[]` 则会删除所有 tag。
       */
      tags?: Array<string>;
    },
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v0/users/-/collections/{subject_id}',
      path: {
        'subject_id': subjectId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Validation Error`,
        401: `Unauthorized`,
        404: `用户不存在或者条目未收藏`,
      },
    });
  }

  /**
   * 章节收藏信息
   * @param subjectId 条目 ID
   * @param offset 分页参数
   * @param limit 分页参数
   * @param episodeType 章节类型，不传则不按照章节进行筛选
   * @returns any Successful Response
   * @throws ApiError
   */
  public static getUserSubjectEpisodeCollection(
    subjectId: SubjectID,
    offset?: number,
    limit: number = 100,
    episodeType?: EpType,
  ): CancelablePromise<(Page & {
    data?: Array<UserEpisodeCollection>;
  })> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/-/collections/{subject_id}/episodes',
      path: {
        'subject_id': subjectId,
      },
      query: {
        'offset': offset,
        'limit': limit,
        'episode_type': episodeType,
      },
      errors: {
        400: `Bad Request`,
        401: `not authorized`,
        404: `条目不存在`,
      },
    });
  }

  /**
   * 章节收藏信息
   * 同时会重新计算条目的完成度
   *
   * @param subjectId 条目 ID
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static patchUserSubjectEpisodeCollection(
    subjectId: SubjectID,
    requestBody?: {
      episode_id: Array<number>;
      type: EpisodeCollectionType;
    },
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'PATCH',
      url: '/v0/users/-/collections/{subject_id}/episodes',
      path: {
        'subject_id': subjectId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `not authorized`,
        404: `条目不存在`,
      },
    });
  }

  /**
   * 章节收藏信息
   * @param episodeId 章节 ID
   * @returns UserEpisodeCollection Successful Response
   * @throws ApiError
   */
  public static getUserEpisodeCollection(
    episodeId: number,
  ): CancelablePromise<UserEpisodeCollection> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/users/-/collections/-/episodes/{episode_id}',
      path: {
        'episode_id': episodeId,
      },
      errors: {
        400: `episode ID not valid`,
        401: `not authorized`,
        404: `条目或者章节不存在`,
      },
    });
  }

  /**
   * 更新章节收藏信息
   * @param episodeId 章节 ID
   * @param requestBody
   * @returns void
   * @throws ApiError
   */
  public static putUserEpisodeCollection(
    episodeId: number,
    requestBody?: {
      type: EpisodeCollectionType;
    },
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v0/users/-/collections/-/episodes/{episode_id}',
      path: {
        'episode_id': episodeId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `episode ID not valid or subject not collected`,
        401: `not authorized`,
        404: `条目或者章节不存在`,
      },
    });
  }

  /**
   * Get Person Revisions
   * @param personId 角色 ID
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_Revision Successful Response
   * @throws ApiError
   */
  public static getPersonRevisions(
    personId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/persons',
      query: {
        'person_id': personId,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
      },
    });
  }

  /**
   * Get Person Revision
   * @param revisionId 历史版本 ID
   * @returns PersonRevision Successful Response
   * @throws ApiError
   */
  public static getPersonRevisionByRevisionId(
    revisionId: number,
  ): CancelablePromise<PersonRevision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/persons/{revision_id}',
      path: {
        'revision_id': revisionId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Character Revisions
   * @param characterId 角色 ID
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_Revision Successful Response
   * @throws ApiError
   */
  public static getCharacterRevisions(
    characterId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/characters',
      query: {
        'character_id': characterId,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
      },
    });
  }

  /**
   * Get Character Revision
   * @param revisionId 版本 ID
   * @returns CharacterRevision Successful Response
   * @throws ApiError
   */
  public static getCharacterRevisionByRevisionId(
    revisionId: number,
  ): CancelablePromise<CharacterRevision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/characters/{revision_id}',
      path: {
        'revision_id': revisionId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Subject Revisions
   * @param subjectId 条目 ID
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_Revision Successful Response
   * @throws ApiError
   */
  public static getSubjectRevisions(
    subjectId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/subjects',
      query: {
        'subject_id': subjectId,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
      },
    });
  }

  /**
   * Get Subject Revision
   * @param revisionId 版本 ID
   * @returns SubjectRevision Successful Response
   * @throws ApiError
   */
  public static getSubjectRevisionByRevisionId(
    revisionId: number,
  ): CancelablePromise<SubjectRevision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/subjects/{revision_id}',
      path: {
        'revision_id': revisionId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Episode Revisions
   * @param episodeId 章节 ID
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns Paged_Revision Successful Response
   * @throws ApiError
   */
  public static getEpisodeRevisions(
    episodeId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/episodes',
      query: {
        'episode_id': episodeId,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Validation Error`,
      },
    });
  }

  /**
   * Get Episode Revision
   * @param revisionId 版本 ID
   * @returns DetailedRevision Successful Response
   * @throws ApiError
   */
  public static getEpisodeRevisionByRevisionId(
    revisionId: number,
  ): CancelablePromise<DetailedRevision> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/revisions/episodes/{revision_id}',
      path: {
        'revision_id': revisionId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Create a new index
   * @returns Index Successful Response
   * @throws ApiError
   */
  public static newIndex(): CancelablePromise<Index> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v0/indices',
      errors: {
        401: `Unauthorized`,
      },
    });
  }

  /**
   * Get Index By ID
   * @param indexId 目录 ID
   * @returns Index Successful Response
   * @throws ApiError
   */
  public static getIndexById(
    indexId: number,
  ): CancelablePromise<Index> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/indices/{index_id}',
      path: {
        'index_id': indexId,
      },
      errors: {
        404: `Not Found`,
      },
    });
  }

  /**
   * Edit index's information
   * @param indexId 目录 ID
   * @param requestBody
   * @returns Index Successful Response
   * @throws ApiError
   */
  public static editIndexById(
    indexId: number,
    requestBody?: IndexBasicInfo,
  ): CancelablePromise<Index> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v0/indices/{index_id}',
      path: {
        'index_id': indexId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Index Subjects
   * @param indexId 目录 ID
   * @param type 条目类型
   * @param limit 分页参数
   * @param offset 分页参数
   * @returns any Successful Response
   * @throws ApiError
   */
  public static getIndexSubjectsByIndexId(
    indexId: number,
    type?: SubjectType,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/indices/{index_id}/subjects',
      path: {
        'index_id': indexId,
      },
      query: {
        'type': type,
        'limit': limit,
        'offset': offset,
      },
      errors: {
        400: `Bad Request`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Add a subject to Index
   * @param indexId 目录 ID
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public static addSubjectToIndexByIndexId(
    indexId: number,
    requestBody?: IndexSubjectAddInfo,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v0/indices/{index_id}/subjects',
      path: {
        'index_id': indexId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Unauthorized`,
        401: `Bad Request`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Edit subject information in a index
   * 如果条目不存在于目录，会创建该条目
   * @param indexId 目录 ID
   * @param subjectId 条目 ID
   * @param requestBody
   * @returns any Successful Response
   * @throws ApiError
   */
  public static editIndexSubjectsByIndexIdAndSubjectId(
    indexId: number,
    subjectId: SubjectID,
    requestBody?: IndexSubjectEditInfo,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/v0/indices/{index_id}/subjects/{subject_id}',
      path: {
        'index_id': indexId,
        'subject_id': subjectId,
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Delete a subject from a Index
   * @param indexId 目录 ID
   * @param subjectId 条目 ID
   * @returns any Successful Response
   * @throws ApiError
   */
  public static delelteSubjectFromIndexByIndexIdAndSubjectId(
    indexId: number,
    subjectId: SubjectID,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v0/indices/{index_id}/subjects/{subject_id}',
      path: {
        'index_id': indexId,
        'subject_id': subjectId,
      },
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Collect index for current user
   * 为当前用户收藏一条目录
   * @param indexId 目录 ID
   * @returns any Successful Response
   * @throws ApiError
   */
  public static collectIndexByIndexIdAndUserId(
    indexId: number,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/v0/indices/{index_id}/collect',
      path: {
        'index_id': indexId,
      },
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }

  /**
   * Uncollect index for current user
   * 为当前用户取消收藏一条目录
   * @param indexId 目录 ID
   * @returns any Successful Response
   * @throws ApiError
   */
  public static uncollectIndexByIndexIdAndUserId(
    indexId: number,
  ): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/v0/indices/{index_id}/collect',
      path: {
        'index_id': indexId,
      },
      errors: {
        401: `Unauthorized`,
        404: `Not Found`,
        500: `Internal Server Error`,
      },
    });
  }

}