/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CharacterDetail } from '../models/CharacterDetail';
import type { CharacterPerson } from '../models/CharacterPerson';
import type { CollectionStatus } from '../models/CollectionStatus';
import type { CollectionStatusType } from '../models/CollectionStatusType';
import type { CollectionType } from '../models/CollectionType';
import type { DetailedRevision } from '../models/DetailedRevision';
import type { EpisodeDetail } from '../models/EpisodeDetail';
import type { EpStatusId } from '../models/EpStatusId';
import type { EpStatusName } from '../models/EpStatusName';
import type { EpStatusType } from '../models/EpStatusType';
import type { EpType } from '../models/EpType';
import type { Index } from '../models/Index';
import type { Me } from '../models/Me';
import type { Paged_Episode_ } from '../models/Paged_Episode_';
import type { Paged_IndexSubject_ } from '../models/Paged_IndexSubject_';
import type { Paged_Revision_ } from '../models/Paged_Revision_';
import type { Paged_UserCollection_ } from '../models/Paged_UserCollection_';
import type { PersonCharacter } from '../models/PersonCharacter';
import type { PersonDetail } from '../models/PersonDetail';
import type { PersonRevision } from '../models/PersonRevision';
import type { pol__api__v0__models__RelatedSubject } from '../models/pol__api__v0__models__RelatedSubject';
import type { pol__api__v0__models__subject__RelatedSubject } from '../models/pol__api__v0__models__subject__RelatedSubject';
import type { RelatedCharacter } from '../models/RelatedCharacter';
import type { RelatedPerson } from '../models/RelatedPerson';
import type { ResponseGroup } from '../models/ResponseGroup';
import type { StatusCode } from '../models/StatusCode';
import type { Subject1 } from '../models/Subject1';
import type { SubjectBase } from '../models/SubjectBase';
import type { SubjectCollection } from '../models/SubjectCollection';
import type { SubjectSmall } from '../models/SubjectSmall';
import type { SubjectType } from '../models/SubjectType';
import type { SubjectType1 } from '../models/SubjectType1';
import type { SubjectTypeName } from '../models/SubjectTypeName';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BangumiAPIService {

  /**
   * 用户信息
   * @param username 用户名 <br> 也可使用 UID
   * @returns User 返回用户基础信息
   * @throws ApiError
   */
  public static getUser(
    username: string,
  ): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/{username}',
      path: {
        'username': username,
      },
    });
  }

  /**
   * @deprecated
   * 用户收藏
   * @param username 用户名 <br> 也可使用 UID
   * @param cat 收藏类型 <br> watching = 在看的动画与三次元条目 <br> all_watching = 在看的动画三次元与书籍条目
   * @param ids 收藏条目 ID <br> 批量查询收藏状态，将条目 ID 以半角逗号分隔，如 1,2,4,6
   * @param responseGroup medium / small <br> 默认为 medium。small 时不返回条目详细信息
   * @returns any 获取用户收藏列表，默认为在看
   * @throws ApiError
   */
  public static getUserCollection(
    username: string,
    cat: 'watching' | 'all_watching',
    ids?: string,
    responseGroup: 'small' | 'medium' = 'medium',
  ): CancelablePromise<Array<{
    /**
     * 番剧标题
     */
    name?: string;
    /**
     * 章节 ID
     */
    subject_id?: number;
    /**
     * 完成话数
     */
    ep_status?: number;
    /**
     * 完成卷数（书籍）
     */
    vol_status?: any;
    /**
     * 上次更新时间
     */
    lasttouch?: number;
    subject?: (SubjectBase & {
      /**
       * 话数
       */
      eps?: number;
      /**
       * 话数
       */
      eps_count?: number;
      collection?: SubjectCollection;
    });
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/{username}/collection',
      path: {
        'username': username,
      },
      query: {
        'cat': cat,
        'ids': ids,
        'responseGroup': responseGroup,
      },
    });
  }

  /**
   * @deprecated
   * 用户收藏概览
   * @param username 用户名 <br> 也可使用 UID
   * @param subjectType 条目类型，详见 [SubjectTypeName](#model-SubjectTypeName)
   * @param appId [https://bgm.tv/dev/app](https://bgm.tv/dev/app) 申请到的 App ID
   * @param maxResults 显示条数 <br> 最多 25
   * @returns any 获取用户指定类型的收藏概览，固定返回最近更新的收藏，不支持翻页
   * @throws ApiError
   */
  public static getUserCollections(
    username: string,
    subjectType: SubjectTypeName,
    appId: string,
    maxResults?: number,
  ): CancelablePromise<Array<{
    type?: SubjectType;
    name?: SubjectTypeName;
    /**
     * 条目类型中文名
     */
    name_cn?: string;
    /**
     * 收藏列表
     */
    collects?: Array<{
      status?: CollectionStatus;
      count?: number;
      list?: Array<{
        /**
         * 条目 ID
         */
        subject_id?: string;
        subject?: SubjectBase;
      }>;
    }>;
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/{username}/collections/{subject_type}',
      path: {
        'username': username,
        'subject_type': subjectType,
      },
      query: {
        'app_id': appId,
        'max_results': maxResults,
      },
    });
  }

  /**
   * @deprecated
   * 用户收藏统计
   * @param username 用户名 <br> 也可使用 UID
   * @param appId [https://bgm.tv/dev/app](https://bgm.tv/dev/app) 申请到的 App ID
   * @returns any 获取用户所有收藏信息
   * @throws ApiError
   */
  public static getUserCollectionsStatus(
    username: string,
    appId: string,
  ): CancelablePromise<Array<{
    type?: SubjectType;
    name?: SubjectTypeName;
    /**
     * 条目类型中文名
     */
    name_cn?: string;
    /**
     * 收藏列表
     */
    collects?: Array<{
      status?: CollectionStatus;
      count?: number;
    }>;
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/{username}/collections/status',
      path: {
        'username': username,
      },
      query: {
        'app_id': appId,
      },
    });
  }

  /**
   * @deprecated
   * 用户收视进度
   * @param username 用户名 <br> 也可使用 UID
   * @param subjectId 条目 ID <br> 获取指定条目收视进度
   * @returns any 返回用户收视进度
   * @throws ApiError
   */
  public static getUserProgress(
    username: string,
    subjectId?: number,
  ): CancelablePromise<Array<{
    /**
     * 条目 ID
     */
    subject_id?: number;
    /**
     * 章节列表
     */
    eps?: Array<{
      /**
       * 章节 ID
       */
      id?: number;
      status?: {
        id?: EpStatusId;
        css_name?: string;
        url_name?: EpStatusType;
        cn_name?: EpStatusName;
      };
    }>;
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/user/{username}/progress',
      path: {
        'username': username,
      },
      query: {
        'subject_id': subjectId,
      },
      errors: {
        401: `未授权`,
      },
    });
  }

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
    items?: Array<SubjectSmall>;
  }>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/calendar',
    });
  }

  /**
   * 条目搜索
   * @param keywords 关键词 <br> 需要 URL Encode
   * @param type 条目类型，参考 [SubjectType](#model-SubjectType)
   * @param responseGroup 返回数据大小，参考 [ResponseGroup](#model-ResponseGroup) <br> 默认为 small
   * @param start 开始条数
   * @param maxResults 每页条数 <br> 最多 25
   * @returns any 搜索结果
   * @throws ApiError
   */
  public static getSearchSubject(
    keywords: string,
    type?: SubjectType,
    responseGroup?: ResponseGroup,
    start?: number,
    maxResults?: number,
  ): CancelablePromise<{
    /**
     * 总条数
     */
    results?: number;
    /**
     * 结果列表
     */
    list?: Array<SubjectSmall>;
  }> {
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
   * 更新收视进度
   * @param id 章节 ID
   * @param status 收视类型，参考 [EpStatusType](#model-EpStatusType)
   * @returns StatusCode 成功
   * @throws ApiError
   */
  public static getEpStatus(
    id: number,
    status: EpStatusType,
  ): CancelablePromise<StatusCode> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/ep/{id}/status/{status}',
      path: {
        'id': id,
        'status': status,
      },
      errors: {
        401: `未授权`,
      },
    });
  }

  /**
   * 更新收视进度
   * @param id 章节 ID
   * @param status 收视类型，参考 [EpStatusType](#model-EpStatusType)
   * @param epId 使用 POST 批量更新 <br> 将章节以半角逗号分隔，如 `3697,3698,3699`。请求时 URL 中的 ep_id 为最后一个章节 ID
   * @returns StatusCode 成功
   * @throws ApiError
   */
  public static postEpStatus(
    id: number,
    status: EpStatusType,
    epId?: string,
  ): CancelablePromise<StatusCode> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/ep/{id}/status/{status}',
      path: {
        'id': id,
        'status': status,
      },
      query: {
        'ep_id': epId,
      },
      errors: {
        401: `未授权`,
      },
    });
  }

  /**
   * 批量更新收视进度
   * @param subjectId 条目 ID
   * @param watchedEps 如看到 123 话则 POST `123` <br> 书籍条目传 watched_eps 与 watched_vols 至少其一
   * @param watchedVols 如看到第 3 卷则 POST `3`, 仅对书籍条目有效
   * @returns StatusCode 成功
   * @throws ApiError
   */
  public static postSubjectUpdateWatchedEps(
    subjectId: number,
    watchedEps: string,
    watchedVols?: string,
  ): CancelablePromise<StatusCode> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/subject/{subject_id}/update/watched_eps',
      path: {
        'subject_id': subjectId,
      },
      query: {
        'watched_eps': watchedEps,
        'watched_vols': watchedVols,
      },
      errors: {
        401: `未授权`,
      },
    });
  }

  /**
   * 获取指定条目收藏信息
   * @param subjectId 条目 ID
   * @returns any 条目收藏信息
   * @throws ApiError
   */
  public static getCollection(
    subjectId: number,
  ): CancelablePromise<{
    status?: CollectionStatus;
    /**
     * 评分
     */
    rating?: number;
    /**
     * 评论
     */
    comment?: string;
    /**
     * 收藏隐私
     */
    private?: 0 | 1;
    /**
     * 标签
     */
    tag?: Array<string>;
    /**
     * 完成话数
     */
    ep_status?: number;
    /**
     * 上次更新时间
     */
    lasttouch?: number;
    user?: User;
  }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/collection/{subject_id}',
      path: {
        'subject_id': subjectId,
      },
      errors: {
        400: `用户未收藏该条目`,
        401: `未授权`,
      },
    });
  }

  /**
   * 管理收藏
   * 管理收藏。Content-type必须为multipart/form-data或application/x-www-form-urlencoded，参数都得放在body里。
   * @param subjectId 条目 ID
   * @param action 收藏动作 <br> create = 添加收藏 <br> update = 更新收藏 <br> 可以统一使用 `update`，系统会自动判断需要新建还是更新收藏
   * @param formData 必须是content-type对应的形式，不能采用Raw
   * @returns any 条目收藏信息
   * @throws ApiError
   */
  public static postCollection(
    subjectId: number,
    action: 'create' | 'update',
    formData: {
      /**
       * 收藏状态，参考 [CollectionStatusType](#model-CollectionStatusType)
       */
      status: CollectionStatusType;
      /**
       * 简评
       */
      comment?: string;
      /**
       * 标签 <br> 以半角空格分割
       */
      tags?: string;
      /**
       * 评分 <br> 1-10 <br> 不填默认重置为未评分
       */
      rating?: number;
      /**
       * 收藏隐私 <br> 0 = 公开 <br> 1 = 私密 <br> 不填默认为0
       */
      privacy?: number;
    },
  ): CancelablePromise<{
    status?: CollectionStatus;
    /**
     * 评分
     */
    rating?: number;
    /**
     * 评论
     */
    comment?: string;
    /**
     * 收藏隐私
     */
    private?: 0 | 1;
    /**
     * 标签
     */
    tag?: Array<string>;
    /**
     * 完成话数
     */
    ep_status?: number;
    /**
     * 上次更新时间
     */
    lasttouch?: number;
    user?: User;
  }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/collection/{subject_id}/{action}',
      path: {
        'subject_id': subjectId,
        'action': action,
      },
      formData: formData,
      mediaType: 'application/x-www-form-urlencoded',
      errors: {
        401: `未授权`,
      },
    });
  }

  /**
   * 获取条目
   * cache with 300s
   * @param subjectId
   * @returns Subject1 Successful Response
   * @throws ApiError
   */
  public static getSubjectByIdV0SubjectsSubjectIdGet(
    subjectId: number,
  ): CancelablePromise<Subject1> {
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
   * Get Subject Persons
   * @param subjectId
   * @returns RelatedPerson Successful Response
   * @throws ApiError
   */
  public static getSubjectPersonsV0SubjectsSubjectIdPersonsGet(
    subjectId: number,
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
   * @param subjectId
   * @returns RelatedCharacter Successful Response
   * @throws ApiError
   */
  public static getSubjectCharactersV0SubjectsSubjectIdCharactersGet(
    subjectId: number,
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
   * @param subjectId
   * @returns pol__api__v0__models__subject__RelatedSubject Successful Response
   * @throws ApiError
   */
  public static getSubjectRelationsV0SubjectsSubjectIdSubjectsGet(
    subjectId: number,
  ): CancelablePromise<Array<pol__api__v0__models__subject__RelatedSubject>> {
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
   * @param subjectId
   * @param type 参照章节的`type`
   * @param limit
   * @param offset
   * @returns Paged_Episode_ Successful Response
   * @throws ApiError
   */
  public static getEpisodesV0EpisodesGet(
    subjectId: number,
    type?: EpType,
    limit: number = 100,
    offset?: number,
  ): CancelablePromise<Paged_Episode_> {
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
   * @param episodeId
   * @returns EpisodeDetail Successful Response
   * @throws ApiError
   */
  public static getEpisodeV0EpisodesEpisodeIdGet(
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
   * @param characterId
   * @returns CharacterDetail Successful Response
   * @throws ApiError
   */
  public static getCharacterDetailV0CharactersCharacterIdGet(
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
   * get character related subjects
   * @param characterId
   * @returns pol__api__v0__models__RelatedSubject Successful Response
   * @throws ApiError
   */
  public static getPersonSubjectsV0CharactersCharacterIdSubjectsGet(
    characterId: number,
  ): CancelablePromise<Array<pol__api__v0__models__RelatedSubject>> {
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
   * @param characterId
   * @returns CharacterPerson Successful Response
   * @throws ApiError
   */
  public static getCharacterPersonsV0CharactersCharacterIdPersonsGet(
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
   * @param personId
   * @returns PersonDetail Successful Response
   * @throws ApiError
   */
  public static getPersonV0PersonsPersonIdGet(
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
   * get person related subjects
   * @param personId
   * @returns pol__api__v0__models__RelatedSubject Successful Response
   * @throws ApiError
   */
  public static getPersonSubjectsV0PersonsPersonIdSubjectsGet(
    personId: number,
  ): CancelablePromise<Array<pol__api__v0__models__RelatedSubject>> {
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
   * @param personId
   * @returns PersonCharacter Successful Response
   * @throws ApiError
   */
  public static getPersonCharactersV0PersonsPersonIdCharactersGet(
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
   * Get User
   * 返回当前 Access Token 对应的用户信息
   * @returns Me Successful Response
   * @throws ApiError
   */
  public static getUserV0MeGet(): CancelablePromise<Me> {
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
   * @param username 设置了 username 后无法使用UID
   * @param subjectType 条目类型，默认为全部
   *
   * 具体含义见 [SubjectType](#model-SubjectType)
   * @param type 收藏类型，默认为全部
   *
   * 具体含义见 [CollectionType](#model-CollectionType)
   * @param limit
   * @param offset
   * @returns Paged_UserCollection_ Successful Response
   * @throws ApiError
   */
  public static getUserCollectionV0UsersUsernameCollectionsGet(
    username: string,
    subjectType?: SubjectType1,
    type?: CollectionType,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_UserCollection_> {
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
   * Get Person Revisions
   * @param personId
   * @param limit
   * @param offset
   * @returns Paged_Revision_ Successful Response
   * @throws ApiError
   */
  public static getPersonRevisionsV0RevisionsPersonsGet(
    personId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision_> {
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
   * @param revisionId
   * @returns PersonRevision Successful Response
   * @throws ApiError
   */
  public static getPersonRevisionV0RevisionsPersonsRevisionIdGet(
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
   * @param characterId
   * @param limit
   * @param offset
   * @returns Paged_Revision_ Successful Response
   * @throws ApiError
   */
  public static getCharacterRevisionsV0RevisionsCharactersGet(
    characterId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision_> {
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
   * @param revisionId
   * @returns DetailedRevision Successful Response
   * @throws ApiError
   */
  public static getCharacterRevisionV0RevisionsCharactersRevisionIdGet(
    revisionId: number,
  ): CancelablePromise<DetailedRevision> {
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
   * @param subjectId
   * @param limit
   * @param offset
   * @returns Paged_Revision_ Successful Response
   * @throws ApiError
   */
  public static getSubjectRevisionsV0RevisionsSubjectsGet(
    subjectId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision_> {
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
   * @param revisionId
   * @returns DetailedRevision Successful Response
   * @throws ApiError
   */
  public static getSubjectRevisionV0RevisionsSubjectsRevisionIdGet(
    revisionId: number,
  ): CancelablePromise<DetailedRevision> {
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
   * @param episodeId
   * @param limit
   * @param offset
   * @returns Paged_Revision_ Successful Response
   * @throws ApiError
   */
  public static getEpisodeRevisionsV0RevisionsEpisodesGet(
    episodeId: number,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_Revision_> {
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
   * @param revisionId
   * @returns DetailedRevision Successful Response
   * @throws ApiError
   */
  public static getEpisodeRevisionV0RevisionsEpisodesRevisionIdGet(
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
   * Get Index By Id
   * @param indexId
   * @returns Index Successful Response
   * @throws ApiError
   */
  public static getIndexByIdV0IndicesIndexIdGet(
    indexId: number,
  ): CancelablePromise<Index> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/v0/indices/{index_id}',
      path: {
        'index_id': indexId,
      },
      errors: {
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

  /**
   * Get Index Subjects
   * @param indexId
   * @param type
   * @param limit
   * @param offset
   * @returns Paged_IndexSubject_ Successful Response
   * @throws ApiError
   */
  public static getIndexSubjectsV0IndicesIndexIdSubjectsGet(
    indexId: number,
    type?: SubjectType1,
    limit: number = 30,
    offset?: number,
  ): CancelablePromise<Paged_IndexSubject_> {
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
        400: `Validation Error`,
        404: `Not Found`,
      },
    });
  }

}