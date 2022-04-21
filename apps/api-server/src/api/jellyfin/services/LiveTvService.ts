/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ChannelMappingOptionsDto } from '../models/ChannelMappingOptionsDto';
import type { ChannelType } from '../models/ChannelType';
import type { GetProgramsDto } from '../models/GetProgramsDto';
import type { GuideInfo } from '../models/GuideInfo';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { ListingsProviderInfo } from '../models/ListingsProviderInfo';
import type { LiveTvInfo } from '../models/LiveTvInfo';
import type { NameIdPair } from '../models/NameIdPair';
import type { RecordingStatus } from '../models/RecordingStatus';
import type { SeriesTimerInfoDto } from '../models/SeriesTimerInfoDto';
import type { SeriesTimerInfoDtoQueryResult } from '../models/SeriesTimerInfoDtoQueryResult';
import type { SetChannelMappingDto } from '../models/SetChannelMappingDto';
import type { SortOrder } from '../models/SortOrder';
import type { TimerInfoDto } from '../models/TimerInfoDto';
import type { TimerInfoDtoQueryResult } from '../models/TimerInfoDtoQueryResult';
import type { TunerChannelMapping } from '../models/TunerChannelMapping';
import type { TunerHostInfo } from '../models/TunerHostInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LiveTvService {

    /**
     * Get channel mapping options.
     * @param providerId Provider id.
     * @returns ChannelMappingOptionsDto Channel mapping options returned.
     * @throws ApiError
     */
    public static getChannelMappingOptions(
        providerId?: string | null,
    ): CancelablePromise<ChannelMappingOptionsDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/ChannelMappingOptions',
            query: {
                'providerId': providerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Set channel mappings.
     * @param requestBody The set channel mapping dto.
     * @returns TunerChannelMapping Created channel mapping returned.
     * @throws ApiError
     */
    public static setChannelMapping(
        requestBody: SetChannelMappingDto,
    ): CancelablePromise<TunerChannelMapping> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/ChannelMappings',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available live tv channels.
     * @param type Optional. Filter by channel type.
     * @param userId Optional. Filter by user and attach user data.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param isMovie Optional. Filter for movies.
     * @param isSeries Optional. Filter for series.
     * @param isNews Optional. Filter for news.
     * @param isKids Optional. Filter for kids.
     * @param isSports Optional. Filter for sports.
     * @param limit Optional. The maximum number of records to return.
     * @param isFavorite Optional. Filter by channels that are favorites, or not.
     * @param isLiked Optional. Filter by channels that are liked, or not.
     * @param isDisliked Optional. Filter by channels that are disliked, or not.
     * @param enableImages Optional. Include image information in output.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes "Optional. The image types to include in the output.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableUserData Optional. Include user data.
     * @param sortBy Optional. Key to sort by.
     * @param sortOrder Optional. Sort order.
     * @param enableFavoriteSorting Optional. Incorporate favorite and like status into channel sorting.
     * @param addCurrentProgram Optional. Adds current program info to each channel.
     * @returns BaseItemDtoQueryResult Available live tv channels returned.
     * @throws ApiError
     */
    public static getLiveTvChannels(
        type?: ChannelType | null,
        userId?: string | null,
        startIndex?: number | null,
        isMovie?: boolean | null,
        isSeries?: boolean | null,
        isNews?: boolean | null,
        isKids?: boolean | null,
        isSports?: boolean | null,
        limit?: number | null,
        isFavorite?: boolean | null,
        isLiked?: boolean | null,
        isDisliked?: boolean | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        fields?: Array<ItemFields> | null,
        enableUserData?: boolean | null,
        sortBy?: Array<string> | null,
        sortOrder?: SortOrder | null,
        enableFavoriteSorting: boolean = false,
        addCurrentProgram: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Channels',
            query: {
                'type': type,
                'userId': userId,
                'startIndex': startIndex,
                'isMovie': isMovie,
                'isSeries': isSeries,
                'isNews': isNews,
                'isKids': isKids,
                'isSports': isSports,
                'limit': limit,
                'isFavorite': isFavorite,
                'isLiked': isLiked,
                'isDisliked': isDisliked,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'fields': fields,
                'enableUserData': enableUserData,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
                'enableFavoriteSorting': enableFavoriteSorting,
                'addCurrentProgram': addCurrentProgram,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a live tv channel.
     * @param channelId Channel id.
     * @param userId Optional. Attach user data.
     * @returns BaseItemDto Live tv channel returned.
     * @throws ApiError
     */
    public static getChannel(
        channelId: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Channels/{channelId}',
            path: {
                'channelId': channelId,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get guid info.
     * @returns GuideInfo Guid info returned.
     * @throws ApiError
     */
    public static getGuideInfo(): CancelablePromise<GuideInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/GuideInfo',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available live tv services.
     * @returns LiveTvInfo Available live tv services returned.
     * @throws ApiError
     */
    public static getLiveTvInfo(): CancelablePromise<LiveTvInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Info',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds a listings provider.
     * @param pw Password.
     * @param validateListings Validate listings.
     * @param validateLogin Validate login.
     * @param requestBody New listings info.
     * @returns ListingsProviderInfo Created listings provider returned.
     * @throws ApiError
     */
    public static addListingProvider(
        pw?: string | null,
        validateListings: boolean = false,
        validateLogin: boolean = false,
        requestBody?: ListingsProviderInfo | null,
    ): CancelablePromise<ListingsProviderInfo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/ListingProviders',
            query: {
                'pw': pw,
                'validateListings': validateListings,
                'validateLogin': validateLogin,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Delete listing provider.
     * @param id Listing provider id.
     * @returns void
     * @throws ApiError
     */
    public static deleteListingProvider(
        id?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/LiveTv/ListingProviders',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets default listings provider info.
     * @returns ListingsProviderInfo Default listings provider info returned.
     * @throws ApiError
     */
    public static getDefaultListingProvider(): CancelablePromise<ListingsProviderInfo> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/ListingProviders/Default',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available lineups.
     * @param id Provider id.
     * @param type Provider type.
     * @param location Location.
     * @param country Country.
     * @returns NameIdPair Available lineups returned.
     * @throws ApiError
     */
    public static getLineups(
        id?: string | null,
        type?: string | null,
        location?: string | null,
        country?: string | null,
    ): CancelablePromise<Array<NameIdPair>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/ListingProviders/Lineups',
            query: {
                'id': id,
                'type': type,
                'location': location,
                'country': country,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available countries.
     * @returns binary Available countries returned.
     * @throws ApiError
     */
    public static getSchedulesDirectCountries(): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/ListingProviders/SchedulesDirect/Countries',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a live tv recording stream.
     * @param recordingId Recording id.
     * @returns binary Recording stream returned.
     * @throws ApiError
     */
    public static getLiveRecordingFile(
        recordingId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/LiveRecordings/{recordingId}/stream',
            path: {
                'recordingId': recordingId,
            },
            errors: {
                404: `Recording not found.`,
            },
        });
    }

    /**
     * Gets a live tv channel stream.
     * @param streamId Stream id.
     * @param container Container type.
     * @returns binary Stream returned.
     * @throws ApiError
     */
    public static getLiveStreamFile(
        streamId: string,
        container: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/LiveStreamFiles/{streamId}/stream.{container}',
            path: {
                'streamId': streamId,
                'container': container,
            },
            errors: {
                404: `Stream not found.`,
            },
        });
    }

    /**
     * Gets available live tv epgs.
     * @param channelIds The channels to return guide information for.
     * @param userId Optional. Filter by user id.
     * @param minStartDate Optional. The minimum premiere start date.
     * @param hasAired Optional. Filter by programs that have completed airing, or not.
     * @param isAiring Optional. Filter by programs that are currently airing, or not.
     * @param maxStartDate Optional. The maximum premiere start date.
     * @param minEndDate Optional. The minimum premiere end date.
     * @param maxEndDate Optional. The maximum premiere end date.
     * @param isMovie Optional. Filter for movies.
     * @param isSeries Optional. Filter for series.
     * @param isNews Optional. Filter for news.
     * @param isKids Optional. Filter for kids.
     * @param isSports Optional. Filter for sports.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param sortBy Optional. Specify one or more sort orders, comma delimited. Options: Name, StartDate.
     * @param sortOrder Sort Order - Ascending,Descending.
     * @param genres The genres to return guide information for.
     * @param genreIds The genre ids to return guide information for.
     * @param enableImages Optional. Include image information in output.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param enableUserData Optional. Include user data.
     * @param seriesTimerId Optional. Filter by series timer id.
     * @param librarySeriesId Optional. Filter by library series id.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableTotalRecordCount Retrieve total record count.
     * @returns BaseItemDtoQueryResult Live tv epgs returned.
     * @throws ApiError
     */
    public static getLiveTvPrograms(
        channelIds?: Array<string> | null,
        userId?: string | null,
        minStartDate?: string | null,
        hasAired?: boolean | null,
        isAiring?: boolean | null,
        maxStartDate?: string | null,
        minEndDate?: string | null,
        maxEndDate?: string | null,
        isMovie?: boolean | null,
        isSeries?: boolean | null,
        isNews?: boolean | null,
        isKids?: boolean | null,
        isSports?: boolean | null,
        startIndex?: number | null,
        limit?: number | null,
        sortBy?: Array<string> | null,
        sortOrder?: Array<SortOrder> | null,
        genres?: Array<string> | null,
        genreIds?: Array<string> | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        enableUserData?: boolean | null,
        seriesTimerId?: string | null,
        librarySeriesId?: string | null,
        fields?: Array<ItemFields> | null,
        enableTotalRecordCount: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Programs',
            query: {
                'channelIds': channelIds,
                'userId': userId,
                'minStartDate': minStartDate,
                'hasAired': hasAired,
                'isAiring': isAiring,
                'maxStartDate': maxStartDate,
                'minEndDate': minEndDate,
                'maxEndDate': maxEndDate,
                'isMovie': isMovie,
                'isSeries': isSeries,
                'isNews': isNews,
                'isKids': isKids,
                'isSports': isSports,
                'startIndex': startIndex,
                'limit': limit,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
                'genres': genres,
                'genreIds': genreIds,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'enableUserData': enableUserData,
                'seriesTimerId': seriesTimerId,
                'librarySeriesId': librarySeriesId,
                'fields': fields,
                'enableTotalRecordCount': enableTotalRecordCount,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets available live tv epgs.
     * @param requestBody Request body.
     * @returns BaseItemDtoQueryResult Live tv epgs returned.
     * @throws ApiError
     */
    public static getPrograms(
        requestBody?: GetProgramsDto | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/Programs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a live tv program.
     * @param programId Program id.
     * @param userId Optional. Attach user data.
     * @returns BaseItemDto Program returned.
     * @throws ApiError
     */
    public static getProgram(
        programId: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Programs/{programId}',
            path: {
                'programId': programId,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets recommended live tv epgs.
     * @param userId Optional. filter by user id.
     * @param limit Optional. The maximum number of records to return.
     * @param isAiring Optional. Filter by programs that are currently airing, or not.
     * @param hasAired Optional. Filter by programs that have completed airing, or not.
     * @param isSeries Optional. Filter for series.
     * @param isMovie Optional. Filter for movies.
     * @param isNews Optional. Filter for news.
     * @param isKids Optional. Filter for kids.
     * @param isSports Optional. Filter for sports.
     * @param enableImages Optional. Include image information in output.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param genreIds The genres to return guide information for.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableUserData Optional. include user data.
     * @param enableTotalRecordCount Retrieve total record count.
     * @returns BaseItemDtoQueryResult Recommended epgs returned.
     * @throws ApiError
     */
    public static getRecommendedPrograms(
        userId?: string | null,
        limit?: number | null,
        isAiring?: boolean | null,
        hasAired?: boolean | null,
        isSeries?: boolean | null,
        isMovie?: boolean | null,
        isNews?: boolean | null,
        isKids?: boolean | null,
        isSports?: boolean | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        genreIds?: Array<string> | null,
        fields?: Array<ItemFields> | null,
        enableUserData?: boolean | null,
        enableTotalRecordCount: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Programs/Recommended',
            query: {
                'userId': userId,
                'limit': limit,
                'isAiring': isAiring,
                'hasAired': hasAired,
                'isSeries': isSeries,
                'isMovie': isMovie,
                'isNews': isNews,
                'isKids': isKids,
                'isSports': isSports,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'genreIds': genreIds,
                'fields': fields,
                'enableUserData': enableUserData,
                'enableTotalRecordCount': enableTotalRecordCount,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets live tv recordings.
     * @param channelId Optional. Filter by channel id.
     * @param userId Optional. Filter by user and attach user data.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param status Optional. Filter by recording status.
     * @param isInProgress Optional. Filter by recordings that are in progress, or not.
     * @param seriesTimerId Optional. Filter by recordings belonging to a series timer.
     * @param enableImages Optional. Include image information in output.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableUserData Optional. Include user data.
     * @param isMovie Optional. Filter for movies.
     * @param isSeries Optional. Filter for series.
     * @param isKids Optional. Filter for kids.
     * @param isSports Optional. Filter for sports.
     * @param isNews Optional. Filter for news.
     * @param isLibraryItem Optional. Filter for is library item.
     * @param enableTotalRecordCount Optional. Return total record count.
     * @returns BaseItemDtoQueryResult Live tv recordings returned.
     * @throws ApiError
     */
    public static getRecordings(
        channelId?: string | null,
        userId?: string | null,
        startIndex?: number | null,
        limit?: number | null,
        status?: RecordingStatus | null,
        isInProgress?: boolean | null,
        seriesTimerId?: string | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        fields?: Array<ItemFields> | null,
        enableUserData?: boolean | null,
        isMovie?: boolean | null,
        isSeries?: boolean | null,
        isKids?: boolean | null,
        isSports?: boolean | null,
        isNews?: boolean | null,
        isLibraryItem?: boolean | null,
        enableTotalRecordCount: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings',
            query: {
                'channelId': channelId,
                'userId': userId,
                'startIndex': startIndex,
                'limit': limit,
                'status': status,
                'isInProgress': isInProgress,
                'seriesTimerId': seriesTimerId,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'fields': fields,
                'enableUserData': enableUserData,
                'isMovie': isMovie,
                'isSeries': isSeries,
                'isKids': isKids,
                'isSports': isSports,
                'isNews': isNews,
                'isLibraryItem': isLibraryItem,
                'enableTotalRecordCount': enableTotalRecordCount,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a live tv recording.
     * @param recordingId Recording id.
     * @param userId Optional. Attach user data.
     * @returns BaseItemDto Recording returned.
     * @throws ApiError
     */
    public static getRecording(
        recordingId: string,
        userId?: string | null,
    ): CancelablePromise<BaseItemDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings/{recordingId}',
            path: {
                'recordingId': recordingId,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Deletes a live tv recording.
     * @param recordingId Recording id.
     * @returns void
     * @throws ApiError
     */
    public static deleteRecording(
        recordingId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/LiveTv/Recordings/{recordingId}',
            path: {
                'recordingId': recordingId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets recording folders.
     * @param userId Optional. Filter by user and attach user data.
     * @returns BaseItemDtoQueryResult Recording folders returned.
     * @throws ApiError
     */
    public static getRecordingFolders(
        userId?: string | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings/Folders',
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Gets live tv recording groups.
     * @param userId Optional. Filter by user and attach user data.
     * @returns BaseItemDtoQueryResult Recording groups returned.
     * @throws ApiError
     */
    public static getRecordingGroups(
        userId?: string | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings/Groups',
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * @deprecated
     * Get recording group.
     * @param groupId Group id.
     * @returns void
     * @throws ApiError
     */
    public static getRecordingGroup(
        groupId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings/Groups/{groupId}',
            path: {
                'groupId': groupId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
            },
        });
    }

    /**
     * @deprecated
     * Gets live tv recording series.
     * @param channelId Optional. Filter by channel id.
     * @param userId Optional. Filter by user and attach user data.
     * @param groupId Optional. Filter by recording group.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param status Optional. Filter by recording status.
     * @param isInProgress Optional. Filter by recordings that are in progress, or not.
     * @param seriesTimerId Optional. Filter by recordings belonging to a series timer.
     * @param enableImages Optional. Include image information in output.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param fields Optional. Specify additional fields of information to return in the output.
     * @param enableUserData Optional. Include user data.
     * @param enableTotalRecordCount Optional. Return total record count.
     * @returns BaseItemDtoQueryResult Live tv recordings returned.
     * @throws ApiError
     */
    public static getRecordingsSeries(
        channelId?: string | null,
        userId?: string | null,
        groupId?: string | null,
        startIndex?: number | null,
        limit?: number | null,
        status?: RecordingStatus | null,
        isInProgress?: boolean | null,
        seriesTimerId?: string | null,
        enableImages?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        fields?: Array<ItemFields> | null,
        enableUserData?: boolean | null,
        enableTotalRecordCount: boolean = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Recordings/Series',
            query: {
                'channelId': channelId,
                'userId': userId,
                'groupId': groupId,
                'startIndex': startIndex,
                'limit': limit,
                'status': status,
                'isInProgress': isInProgress,
                'seriesTimerId': seriesTimerId,
                'enableImages': enableImages,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'fields': fields,
                'enableUserData': enableUserData,
                'enableTotalRecordCount': enableTotalRecordCount,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets live tv series timers.
     * @param sortBy Optional. Sort by SortName or Priority.
     * @param sortOrder Optional. Sort in Ascending or Descending order.
     * @returns SeriesTimerInfoDtoQueryResult Timers returned.
     * @throws ApiError
     */
    public static getSeriesTimers(
        sortBy?: string | null,
        sortOrder?: SortOrder | null,
    ): CancelablePromise<SeriesTimerInfoDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/SeriesTimers',
            query: {
                'sortBy': sortBy,
                'sortOrder': sortOrder,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates a live tv series timer.
     * @param requestBody New series timer info.
     * @returns void
     * @throws ApiError
     */
    public static createSeriesTimer(
        requestBody?: SeriesTimerInfoDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/SeriesTimers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a live tv series timer.
     * @param timerId Timer id.
     * @returns SeriesTimerInfoDto Series timer returned.
     * @throws ApiError
     */
    public static getSeriesTimer(
        timerId: string,
    ): CancelablePromise<SeriesTimerInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/SeriesTimers/{timerId}',
            path: {
                'timerId': timerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Series timer not found.`,
            },
        });
    }

    /**
     * Cancels a live tv series timer.
     * @param timerId Timer id.
     * @returns void
     * @throws ApiError
     */
    public static cancelSeriesTimer(
        timerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/LiveTv/SeriesTimers/{timerId}',
            path: {
                'timerId': timerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates a live tv series timer.
     * @param timerId Timer id.
     * @param requestBody New series timer info.
     * @returns void
     * @throws ApiError
     */
    public static updateSeriesTimer(
        timerId: string,
        requestBody?: SeriesTimerInfoDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/SeriesTimers/{timerId}',
            path: {
                'timerId': timerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the live tv timers.
     * @param channelId Optional. Filter by channel id.
     * @param seriesTimerId Optional. Filter by timers belonging to a series timer.
     * @param isActive Optional. Filter by timers that are active.
     * @param isScheduled Optional. Filter by timers that are scheduled.
     * @returns TimerInfoDtoQueryResult Success
     * @throws ApiError
     */
    public static getTimers(
        channelId?: string | null,
        seriesTimerId?: string | null,
        isActive?: boolean | null,
        isScheduled?: boolean | null,
    ): CancelablePromise<TimerInfoDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Timers',
            query: {
                'channelId': channelId,
                'seriesTimerId': seriesTimerId,
                'isActive': isActive,
                'isScheduled': isScheduled,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Creates a live tv timer.
     * @param requestBody New timer info.
     * @returns void
     * @throws ApiError
     */
    public static createTimer(
        requestBody?: TimerInfoDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/Timers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a timer.
     * @param timerId Timer id.
     * @returns TimerInfoDto Timer returned.
     * @throws ApiError
     */
    public static getTimer(
        timerId: string,
    ): CancelablePromise<TimerInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Timers/{timerId}',
            path: {
                'timerId': timerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Cancels a live tv timer.
     * @param timerId Timer id.
     * @returns void
     * @throws ApiError
     */
    public static cancelTimer(
        timerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/LiveTv/Timers/{timerId}',
            path: {
                'timerId': timerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Updates a live tv timer.
     * @param timerId Timer id.
     * @param requestBody New timer info.
     * @returns void
     * @throws ApiError
     */
    public static updateTimer(
        timerId: string,
        requestBody?: TimerInfoDto | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/Timers/{timerId}',
            path: {
                'timerId': timerId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the default values for a new timer.
     * @param programId Optional. To attach default values based on a program.
     * @returns SeriesTimerInfoDto Default values returned.
     * @throws ApiError
     */
    public static getDefaultTimer(
        programId?: string | null,
    ): CancelablePromise<SeriesTimerInfoDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Timers/Defaults',
            query: {
                'programId': programId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Adds a tuner host.
     * @param requestBody New tuner host.
     * @returns TunerHostInfo Created tuner host returned.
     * @throws ApiError
     */
    public static addTunerHost(
        requestBody?: TunerHostInfo | null,
    ): CancelablePromise<TunerHostInfo> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/TunerHosts',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Deletes a tuner host.
     * @param id Tuner host id.
     * @returns void
     * @throws ApiError
     */
    public static deleteTunerHost(
        id?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/LiveTv/TunerHosts',
            query: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get tuner host types.
     * @returns NameIdPair Tuner host types returned.
     * @throws ApiError
     */
    public static getTunerHostTypes(): CancelablePromise<Array<NameIdPair>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/TunerHosts/Types',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Resets a tv tuner.
     * @param tunerId Tuner id.
     * @returns void
     * @throws ApiError
     */
    public static resetTuner(
        tunerId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/LiveTv/Tuners/{tunerId}/Reset',
            path: {
                'tunerId': tunerId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Discover tuners.
     * @param newDevicesOnly Only discover new tuners.
     * @returns TunerHostInfo Tuners returned.
     * @throws ApiError
     */
    public static discoverTuners(
        newDevicesOnly: boolean = false,
    ): CancelablePromise<Array<TunerHostInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Tuners/Discover',
            query: {
                'newDevicesOnly': newDevicesOnly,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Discover tuners.
     * @param newDevicesOnly Only discover new tuners.
     * @returns TunerHostInfo Tuners returned.
     * @throws ApiError
     */
    public static discvoverTuners(
        newDevicesOnly: boolean = false,
    ): CancelablePromise<Array<TunerHostInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/LiveTv/Tuners/Discvover',
            query: {
                'newDevicesOnly': newDevicesOnly,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}