/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AllThemeMediaResult } from '../models/AllThemeMediaResult';
import type { BaseItemDto } from '../models/BaseItemDto';
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ItemCounts } from '../models/ItemCounts';
import type { ItemFields } from '../models/ItemFields';
import type { LibraryOptionsResultDto } from '../models/LibraryOptionsResultDto';
import type { MediaUpdateInfoDto } from '../models/MediaUpdateInfoDto';
import type { ThemeMediaResult } from '../models/ThemeMediaResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LibraryService {

    /**
     * Deletes items from the library and filesystem.
     * @param ids The item ids.
     * @returns void
     * @throws ApiError
     */
    public static deleteItems(
        ids?: Array<string> | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Items',
            query: {
                'ids': ids,
            },
            errors: {
                401: `Unauthorized access.`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Deletes an item from the library and filesystem.
     * @param itemId The item id.
     * @returns void
     * @throws ApiError
     */
    public static deleteItem(
        itemId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Items/{itemId}',
            path: {
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized access.`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarAlbums(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Albums/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarArtists(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Artists/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets all parents of an item.
     * @param itemId The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @returns BaseItemDto Item parents returned.
     * @throws ApiError
     */
    public static getAncestors(
        itemId: string,
        userId?: string | null,
    ): CancelablePromise<Array<BaseItemDto>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Ancestors',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * @deprecated
     * Gets critic review for an item.
     * @param itemId
     * @returns BaseItemDtoQueryResult Critic reviews returned.
     * @throws ApiError
     */
    public static getCriticReviews(
        itemId: string,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/CriticReviews',
            path: {
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Downloads item media.
     * @param itemId The item id.
     * @returns binary Media downloaded.
     * @throws ApiError
     */
    public static getDownload(
        itemId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Download',
            path: {
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get the original file of an item.
     * @param itemId The item id.
     * @returns binary File stream returned.
     * @throws ApiError
     */
    public static getFile(
        itemId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/File',
            path: {
                'itemId': itemId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarItems(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get theme songs and videos for an item.
     * @param itemId The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param inheritFromParent Optional. Determines whether or not parent items should be searched for theme media.
     * @returns AllThemeMediaResult Theme songs and videos returned.
     * @throws ApiError
     */
    public static getThemeMedia(
        itemId: string,
        userId?: string | null,
        inheritFromParent: boolean = false,
    ): CancelablePromise<AllThemeMediaResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/ThemeMedia',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
                'inheritFromParent': inheritFromParent,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get theme songs for an item.
     * @param itemId The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param inheritFromParent Optional. Determines whether or not parent items should be searched for theme media.
     * @returns ThemeMediaResult Theme songs returned.
     * @throws ApiError
     */
    public static getThemeSongs(
        itemId: string,
        userId?: string | null,
        inheritFromParent: boolean = false,
    ): CancelablePromise<ThemeMediaResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/ThemeSongs',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
                'inheritFromParent': inheritFromParent,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get theme videos for an item.
     * @param itemId The item id.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param inheritFromParent Optional. Determines whether or not parent items should be searched for theme media.
     * @returns ThemeMediaResult Theme videos returned.
     * @throws ApiError
     */
    public static getThemeVideos(
        itemId: string,
        userId?: string | null,
        inheritFromParent: boolean = false,
    ): CancelablePromise<ThemeMediaResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/ThemeVideos',
            path: {
                'itemId': itemId,
            },
            query: {
                'userId': userId,
                'inheritFromParent': inheritFromParent,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get item counts.
     * @param userId Optional. Get counts from a specific user's library.
     * @param isFavorite Optional. Get counts of favorite items.
     * @returns ItemCounts Item counts returned.
     * @throws ApiError
     */
    public static getItemCounts(
        userId?: string | null,
        isFavorite?: boolean | null,
    ): CancelablePromise<ItemCounts> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/Counts',
            query: {
                'userId': userId,
                'isFavorite': isFavorite,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets the library options info.
     * @param libraryContentType Library content type.
     * @param isNewLibrary Whether this is a new library.
     * @returns LibraryOptionsResultDto Library options info returned.
     * @throws ApiError
     */
    public static getLibraryOptionsInfo(
        libraryContentType?: string | null,
        isNewLibrary: boolean = false,
    ): CancelablePromise<LibraryOptionsResultDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Libraries/AvailableOptions',
            query: {
                'libraryContentType': libraryContentType,
                'isNewLibrary': isNewLibrary,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that new movies have been added by an external source.
     * @param requestBody The update paths.
     * @returns void
     * @throws ApiError
     */
    public static postUpdatedMedia(
        requestBody: MediaUpdateInfoDto,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Media/Updated',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets all user media folders.
     * @param isHidden Optional. Filter by folders that are marked hidden, or not.
     * @returns BaseItemDtoQueryResult Media folders returned.
     * @throws ApiError
     */
    public static getMediaFolders(
        isHidden?: boolean | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Library/MediaFolders',
            query: {
                'isHidden': isHidden,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that new movies have been added by an external source.
     * @param tmdbId The tmdbId.
     * @param imdbId The imdbId.
     * @returns void
     * @throws ApiError
     */
    public static postAddedMovies(
        tmdbId?: string | null,
        imdbId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Movies/Added',
            query: {
                'tmdbId': tmdbId,
                'imdbId': imdbId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that new movies have been added by an external source.
     * @param tmdbId The tmdbId.
     * @param imdbId The imdbId.
     * @returns void
     * @throws ApiError
     */
    public static postUpdatedMovies(
        tmdbId?: string | null,
        imdbId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Movies/Updated',
            query: {
                'tmdbId': tmdbId,
                'imdbId': imdbId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets a list of physical paths from virtual folders.
     * @returns string Physical paths returned.
     * @throws ApiError
     */
    public static getPhysicalPaths(): CancelablePromise<Array<string>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Library/PhysicalPaths',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Starts a library scan.
     * @returns void
     * @throws ApiError
     */
    public static refreshLibrary(): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Refresh',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that new episodes of a series have been added by an external source.
     * @param tvdbId The tvdbId.
     * @returns void
     * @throws ApiError
     */
    public static postAddedSeries(
        tvdbId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Series/Added',
            query: {
                'tvdbId': tvdbId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Reports that new episodes of a series have been added by an external source.
     * @param tvdbId The tvdbId.
     * @returns void
     * @throws ApiError
     */
    public static postUpdatedSeries(
        tvdbId?: string | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Library/Series/Updated',
            query: {
                'tvdbId': tvdbId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarMovies(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Movies/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarShows(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Shows/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets similar items.
     * @param itemId The item id.
     * @param excludeArtistIds Exclude artist ids.
     * @param userId Optional. Filter by user id, and attach user data.
     * @param limit Optional. The maximum number of records to return.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines, TrailerUrls.
     * @returns BaseItemDtoQueryResult Similar items returned.
     * @throws ApiError
     */
    public static getSimilarTrailers(
        itemId: string,
        excludeArtistIds?: Array<string> | null,
        userId?: string | null,
        limit?: number | null,
        fields?: Array<ItemFields> | null,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Trailers/{itemId}/Similar',
            path: {
                'itemId': itemId,
            },
            query: {
                'excludeArtistIds': excludeArtistIds,
                'userId': userId,
                'limit': limit,
                'fields': fields,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}