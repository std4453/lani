/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BaseItemDtoQueryResult } from '../models/BaseItemDtoQueryResult';
import type { ImageType } from '../models/ImageType';
import type { ItemFields } from '../models/ItemFields';
import type { ItemFilter } from '../models/ItemFilter';
import type { LocationType } from '../models/LocationType';
import type { SeriesStatus } from '../models/SeriesStatus';
import type { SortOrder } from '../models/SortOrder';
import type { VideoType } from '../models/VideoType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ItemsService {

    /**
     * Gets items based on a query.
     * @param userId The user id supplied as query parameter.
     * @param maxOfficialRating Optional filter by maximum official rating (PG, PG-13, TV-MA, etc).
     * @param hasThemeSong Optional filter by items with theme songs.
     * @param hasThemeVideo Optional filter by items with theme videos.
     * @param hasSubtitles Optional filter by items with subtitles.
     * @param hasSpecialFeature Optional filter by items with special features.
     * @param hasTrailer Optional filter by items with trailers.
     * @param adjacentTo Optional. Return items that are siblings of a supplied item.
     * @param parentIndexNumber Optional filter by parent index number.
     * @param hasParentalRating Optional filter by items that have or do not have a parental rating.
     * @param isHd Optional filter by items that are HD or not.
     * @param is4K Optional filter by items that are 4K or not.
     * @param locationTypes Optional. If specified, results will be filtered based on LocationType. This allows multiple, comma delimited.
     * @param excludeLocationTypes Optional. If specified, results will be filtered based on the LocationType. This allows multiple, comma delimited.
     * @param isMissing Optional filter by items that are missing episodes or not.
     * @param isUnaired Optional filter by items that are unaired episodes or not.
     * @param minCommunityRating Optional filter by minimum community rating.
     * @param minCriticRating Optional filter by minimum critic rating.
     * @param minPremiereDate Optional. The minimum premiere date. Format = ISO.
     * @param minDateLastSaved Optional. The minimum last saved date. Format = ISO.
     * @param minDateLastSavedForUser Optional. The minimum last saved date for the current user. Format = ISO.
     * @param maxPremiereDate Optional. The maximum premiere date. Format = ISO.
     * @param hasOverview Optional filter by items that have an overview or not.
     * @param hasImdbId Optional filter by items that have an imdb id or not.
     * @param hasTmdbId Optional filter by items that have a tmdb id or not.
     * @param hasTvdbId Optional filter by items that have a tvdb id or not.
     * @param excludeItemIds Optional. If specified, results will be filtered by excluding item ids. This allows multiple, comma delimited.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param recursive When searching within folders, this determines whether or not the search will be recursive. true/false.
     * @param searchTerm Optional. Filter based on a search term.
     * @param sortOrder Sort Order - Ascending,Descending.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines.
     * @param excludeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param includeItemTypes Optional. If specified, results will be filtered based on the item type. This allows multiple, comma delimited.
     * @param filters Optional. Specify additional filters to apply. This allows multiple, comma delimited. Options: IsFolder, IsNotFolder, IsUnplayed, IsPlayed, IsFavorite, IsResumable, Likes, Dislikes.
     * @param isFavorite Optional filter by items that are marked as favorite, or not.
     * @param mediaTypes Optional filter by MediaType. Allows multiple, comma delimited.
     * @param imageTypes Optional. If specified, results will be filtered based on those containing image types. This allows multiple, comma delimited.
     * @param sortBy Optional. Specify one or more sort orders, comma delimited. Options: Album, AlbumArtist, Artist, Budget, CommunityRating, CriticRating, DateCreated, DatePlayed, PlayCount, PremiereDate, ProductionYear, SortName, Random, Revenue, Runtime.
     * @param isPlayed Optional filter by items that are played, or not.
     * @param genres Optional. If specified, results will be filtered based on genre. This allows multiple, pipe delimited.
     * @param officialRatings Optional. If specified, results will be filtered based on OfficialRating. This allows multiple, pipe delimited.
     * @param tags Optional. If specified, results will be filtered based on tag. This allows multiple, pipe delimited.
     * @param years Optional. If specified, results will be filtered based on production year. This allows multiple, comma delimited.
     * @param enableUserData Optional, include user data.
     * @param imageTypeLimit Optional, the max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param person Optional. If specified, results will be filtered to include only those containing the specified person.
     * @param personIds Optional. If specified, results will be filtered to include only those containing the specified person id.
     * @param personTypes Optional. If specified, along with Person, results will be filtered to include only those containing the specified person and PersonType. Allows multiple, comma-delimited.
     * @param studios Optional. If specified, results will be filtered based on studio. This allows multiple, pipe delimited.
     * @param artists Optional. If specified, results will be filtered based on artists. This allows multiple, pipe delimited.
     * @param excludeArtistIds Optional. If specified, results will be filtered based on artist id. This allows multiple, pipe delimited.
     * @param artistIds Optional. If specified, results will be filtered to include only those containing the specified artist id.
     * @param albumArtistIds Optional. If specified, results will be filtered to include only those containing the specified album artist id.
     * @param contributingArtistIds Optional. If specified, results will be filtered to include only those containing the specified contributing artist id.
     * @param albums Optional. If specified, results will be filtered based on album. This allows multiple, pipe delimited.
     * @param albumIds Optional. If specified, results will be filtered based on album id. This allows multiple, pipe delimited.
     * @param ids Optional. If specific items are needed, specify a list of item id's to retrieve. This allows multiple, comma delimited.
     * @param videoTypes Optional filter by VideoType (videofile, dvd, bluray, iso). Allows multiple, comma delimited.
     * @param minOfficialRating Optional filter by minimum official rating (PG, PG-13, TV-MA, etc).
     * @param isLocked Optional filter by items that are locked.
     * @param isPlaceHolder Optional filter by items that are placeholders.
     * @param hasOfficialRating Optional filter by items that have official ratings.
     * @param collapseBoxSetItems Whether or not to hide items behind their boxsets.
     * @param minWidth Optional. Filter by the minimum width of the item.
     * @param minHeight Optional. Filter by the minimum height of the item.
     * @param maxWidth Optional. Filter by the maximum width of the item.
     * @param maxHeight Optional. Filter by the maximum height of the item.
     * @param is3D Optional filter by items that are 3D, or not.
     * @param seriesStatus Optional filter by Series Status. Allows multiple, comma delimited.
     * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
     * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
     * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
     * @param studioIds Optional. If specified, results will be filtered based on studio id. This allows multiple, pipe delimited.
     * @param genreIds Optional. If specified, results will be filtered based on genre id. This allows multiple, pipe delimited.
     * @param enableTotalRecordCount Optional. Enable the total record count.
     * @param enableImages Optional, include image information in output.
     * @returns BaseItemDtoQueryResult Success
     * @throws ApiError
     */
    public static getItems(
        userId?: string | null,
        maxOfficialRating?: string | null,
        hasThemeSong?: boolean | null,
        hasThemeVideo?: boolean | null,
        hasSubtitles?: boolean | null,
        hasSpecialFeature?: boolean | null,
        hasTrailer?: boolean | null,
        adjacentTo?: string | null,
        parentIndexNumber?: number | null,
        hasParentalRating?: boolean | null,
        isHd?: boolean | null,
        is4K?: boolean | null,
        locationTypes?: Array<LocationType> | null,
        excludeLocationTypes?: Array<LocationType> | null,
        isMissing?: boolean | null,
        isUnaired?: boolean | null,
        minCommunityRating?: number | null,
        minCriticRating?: number | null,
        minPremiereDate?: string | null,
        minDateLastSaved?: string | null,
        minDateLastSavedForUser?: string | null,
        maxPremiereDate?: string | null,
        hasOverview?: boolean | null,
        hasImdbId?: boolean | null,
        hasTmdbId?: boolean | null,
        hasTvdbId?: boolean | null,
        excludeItemIds?: Array<string> | null,
        startIndex?: number | null,
        limit?: number | null,
        recursive?: boolean | null,
        searchTerm?: string | null,
        sortOrder?: Array<SortOrder> | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        filters?: Array<ItemFilter> | null,
        isFavorite?: boolean | null,
        mediaTypes?: Array<string> | null,
        imageTypes?: Array<ImageType> | null,
        sortBy?: Array<string> | null,
        isPlayed?: boolean | null,
        genres?: Array<string> | null,
        officialRatings?: Array<string> | null,
        tags?: Array<string> | null,
        years?: Array<number> | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        person?: string | null,
        personIds?: Array<string> | null,
        personTypes?: Array<string> | null,
        studios?: Array<string> | null,
        artists?: Array<string> | null,
        excludeArtistIds?: Array<string> | null,
        artistIds?: Array<string> | null,
        albumArtistIds?: Array<string> | null,
        contributingArtistIds?: Array<string> | null,
        albums?: Array<string> | null,
        albumIds?: Array<string> | null,
        ids?: Array<string> | null,
        videoTypes?: Array<VideoType> | null,
        minOfficialRating?: string | null,
        isLocked?: boolean | null,
        isPlaceHolder?: boolean | null,
        hasOfficialRating?: boolean | null,
        collapseBoxSetItems?: boolean | null,
        minWidth?: number | null,
        minHeight?: number | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        is3D?: boolean | null,
        seriesStatus?: Array<SeriesStatus> | null,
        nameStartsWithOrGreater?: string | null,
        nameStartsWith?: string | null,
        nameLessThan?: string | null,
        studioIds?: Array<string> | null,
        genreIds?: Array<string> | null,
        enableTotalRecordCount: boolean = true,
        enableImages: boolean | null = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items',
            query: {
                'userId': userId,
                'maxOfficialRating': maxOfficialRating,
                'hasThemeSong': hasThemeSong,
                'hasThemeVideo': hasThemeVideo,
                'hasSubtitles': hasSubtitles,
                'hasSpecialFeature': hasSpecialFeature,
                'hasTrailer': hasTrailer,
                'adjacentTo': adjacentTo,
                'parentIndexNumber': parentIndexNumber,
                'hasParentalRating': hasParentalRating,
                'isHd': isHd,
                'is4K': is4K,
                'locationTypes': locationTypes,
                'excludeLocationTypes': excludeLocationTypes,
                'isMissing': isMissing,
                'isUnaired': isUnaired,
                'minCommunityRating': minCommunityRating,
                'minCriticRating': minCriticRating,
                'minPremiereDate': minPremiereDate,
                'minDateLastSaved': minDateLastSaved,
                'minDateLastSavedForUser': minDateLastSavedForUser,
                'maxPremiereDate': maxPremiereDate,
                'hasOverview': hasOverview,
                'hasImdbId': hasImdbId,
                'hasTmdbId': hasTmdbId,
                'hasTvdbId': hasTvdbId,
                'excludeItemIds': excludeItemIds,
                'startIndex': startIndex,
                'limit': limit,
                'recursive': recursive,
                'searchTerm': searchTerm,
                'sortOrder': sortOrder,
                'parentId': parentId,
                'fields': fields,
                'excludeItemTypes': excludeItemTypes,
                'includeItemTypes': includeItemTypes,
                'filters': filters,
                'isFavorite': isFavorite,
                'mediaTypes': mediaTypes,
                'imageTypes': imageTypes,
                'sortBy': sortBy,
                'isPlayed': isPlayed,
                'genres': genres,
                'officialRatings': officialRatings,
                'tags': tags,
                'years': years,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'person': person,
                'personIds': personIds,
                'personTypes': personTypes,
                'studios': studios,
                'artists': artists,
                'excludeArtistIds': excludeArtistIds,
                'artistIds': artistIds,
                'albumArtistIds': albumArtistIds,
                'contributingArtistIds': contributingArtistIds,
                'albums': albums,
                'albumIds': albumIds,
                'ids': ids,
                'videoTypes': videoTypes,
                'minOfficialRating': minOfficialRating,
                'isLocked': isLocked,
                'isPlaceHolder': isPlaceHolder,
                'hasOfficialRating': hasOfficialRating,
                'collapseBoxSetItems': collapseBoxSetItems,
                'minWidth': minWidth,
                'minHeight': minHeight,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'is3D': is3D,
                'seriesStatus': seriesStatus,
                'nameStartsWithOrGreater': nameStartsWithOrGreater,
                'nameStartsWith': nameStartsWith,
                'nameLessThan': nameLessThan,
                'studioIds': studioIds,
                'genreIds': genreIds,
                'enableTotalRecordCount': enableTotalRecordCount,
                'enableImages': enableImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets items based on a query.
     * @param userId The user id supplied as query parameter.
     * @param maxOfficialRating Optional filter by maximum official rating (PG, PG-13, TV-MA, etc).
     * @param hasThemeSong Optional filter by items with theme songs.
     * @param hasThemeVideo Optional filter by items with theme videos.
     * @param hasSubtitles Optional filter by items with subtitles.
     * @param hasSpecialFeature Optional filter by items with special features.
     * @param hasTrailer Optional filter by items with trailers.
     * @param adjacentTo Optional. Return items that are siblings of a supplied item.
     * @param parentIndexNumber Optional filter by parent index number.
     * @param hasParentalRating Optional filter by items that have or do not have a parental rating.
     * @param isHd Optional filter by items that are HD or not.
     * @param is4K Optional filter by items that are 4K or not.
     * @param locationTypes Optional. If specified, results will be filtered based on LocationType. This allows multiple, comma delimeted.
     * @param excludeLocationTypes Optional. If specified, results will be filtered based on the LocationType. This allows multiple, comma delimeted.
     * @param isMissing Optional filter by items that are missing episodes or not.
     * @param isUnaired Optional filter by items that are unaired episodes or not.
     * @param minCommunityRating Optional filter by minimum community rating.
     * @param minCriticRating Optional filter by minimum critic rating.
     * @param minPremiereDate Optional. The minimum premiere date. Format = ISO.
     * @param minDateLastSaved Optional. The minimum last saved date. Format = ISO.
     * @param minDateLastSavedForUser Optional. The minimum last saved date for the current user. Format = ISO.
     * @param maxPremiereDate Optional. The maximum premiere date. Format = ISO.
     * @param hasOverview Optional filter by items that have an overview or not.
     * @param hasImdbId Optional filter by items that have an imdb id or not.
     * @param hasTmdbId Optional filter by items that have a tmdb id or not.
     * @param hasTvdbId Optional filter by items that have a tvdb id or not.
     * @param excludeItemIds Optional. If specified, results will be filtered by exxcluding item ids. This allows multiple, comma delimeted.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param recursive When searching within folders, this determines whether or not the search will be recursive. true/false.
     * @param searchTerm Optional. Filter based on a search term.
     * @param sortOrder Sort Order - Ascending,Descending.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimeted. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines.
     * @param excludeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimeted.
     * @param includeItemTypes Optional. If specified, results will be filtered based on the item type. This allows multiple, comma delimeted.
     * @param filters Optional. Specify additional filters to apply. This allows multiple, comma delimeted. Options: IsFolder, IsNotFolder, IsUnplayed, IsPlayed, IsFavorite, IsResumable, Likes, Dislikes.
     * @param isFavorite Optional filter by items that are marked as favorite, or not.
     * @param mediaTypes Optional filter by MediaType. Allows multiple, comma delimited.
     * @param imageTypes Optional. If specified, results will be filtered based on those containing image types. This allows multiple, comma delimited.
     * @param sortBy Optional. Specify one or more sort orders, comma delimeted. Options: Album, AlbumArtist, Artist, Budget, CommunityRating, CriticRating, DateCreated, DatePlayed, PlayCount, PremiereDate, ProductionYear, SortName, Random, Revenue, Runtime.
     * @param isPlayed Optional filter by items that are played, or not.
     * @param genres Optional. If specified, results will be filtered based on genre. This allows multiple, pipe delimeted.
     * @param officialRatings Optional. If specified, results will be filtered based on OfficialRating. This allows multiple, pipe delimeted.
     * @param tags Optional. If specified, results will be filtered based on tag. This allows multiple, pipe delimeted.
     * @param years Optional. If specified, results will be filtered based on production year. This allows multiple, comma delimeted.
     * @param enableUserData Optional, include user data.
     * @param imageTypeLimit Optional, the max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param person Optional. If specified, results will be filtered to include only those containing the specified person.
     * @param personIds Optional. If specified, results will be filtered to include only those containing the specified person id.
     * @param personTypes Optional. If specified, along with Person, results will be filtered to include only those containing the specified person and PersonType. Allows multiple, comma-delimited.
     * @param studios Optional. If specified, results will be filtered based on studio. This allows multiple, pipe delimeted.
     * @param artists Optional. If specified, results will be filtered based on artists. This allows multiple, pipe delimeted.
     * @param excludeArtistIds Optional. If specified, results will be filtered based on artist id. This allows multiple, pipe delimeted.
     * @param artistIds Optional. If specified, results will be filtered to include only those containing the specified artist id.
     * @param albumArtistIds Optional. If specified, results will be filtered to include only those containing the specified album artist id.
     * @param contributingArtistIds Optional. If specified, results will be filtered to include only those containing the specified contributing artist id.
     * @param albums Optional. If specified, results will be filtered based on album. This allows multiple, pipe delimeted.
     * @param albumIds Optional. If specified, results will be filtered based on album id. This allows multiple, pipe delimeted.
     * @param ids Optional. If specific items are needed, specify a list of item id's to retrieve. This allows multiple, comma delimited.
     * @param videoTypes Optional filter by VideoType (videofile, dvd, bluray, iso). Allows multiple, comma delimeted.
     * @param minOfficialRating Optional filter by minimum official rating (PG, PG-13, TV-MA, etc).
     * @param isLocked Optional filter by items that are locked.
     * @param isPlaceHolder Optional filter by items that are placeholders.
     * @param hasOfficialRating Optional filter by items that have official ratings.
     * @param collapseBoxSetItems Whether or not to hide items behind their boxsets.
     * @param minWidth Optional. Filter by the minimum width of the item.
     * @param minHeight Optional. Filter by the minimum height of the item.
     * @param maxWidth Optional. Filter by the maximum width of the item.
     * @param maxHeight Optional. Filter by the maximum height of the item.
     * @param is3D Optional filter by items that are 3D, or not.
     * @param seriesStatus Optional filter by Series Status. Allows multiple, comma delimeted.
     * @param nameStartsWithOrGreater Optional filter by items whose name is sorted equally or greater than a given input string.
     * @param nameStartsWith Optional filter by items whose name is sorted equally than a given input string.
     * @param nameLessThan Optional filter by items whose name is equally or lesser than a given input string.
     * @param studioIds Optional. If specified, results will be filtered based on studio id. This allows multiple, pipe delimeted.
     * @param genreIds Optional. If specified, results will be filtered based on genre id. This allows multiple, pipe delimeted.
     * @param enableTotalRecordCount Optional. Enable the total record count.
     * @param enableImages Optional, include image information in output.
     * @returns BaseItemDtoQueryResult Success
     * @throws ApiError
     */
    public static getItemsByUserId(
        userId: string,
        maxOfficialRating?: string | null,
        hasThemeSong?: boolean | null,
        hasThemeVideo?: boolean | null,
        hasSubtitles?: boolean | null,
        hasSpecialFeature?: boolean | null,
        hasTrailer?: boolean | null,
        adjacentTo?: string | null,
        parentIndexNumber?: number | null,
        hasParentalRating?: boolean | null,
        isHd?: boolean | null,
        is4K?: boolean | null,
        locationTypes?: Array<LocationType> | null,
        excludeLocationTypes?: Array<LocationType> | null,
        isMissing?: boolean | null,
        isUnaired?: boolean | null,
        minCommunityRating?: number | null,
        minCriticRating?: number | null,
        minPremiereDate?: string | null,
        minDateLastSaved?: string | null,
        minDateLastSavedForUser?: string | null,
        maxPremiereDate?: string | null,
        hasOverview?: boolean | null,
        hasImdbId?: boolean | null,
        hasTmdbId?: boolean | null,
        hasTvdbId?: boolean | null,
        excludeItemIds?: Array<string> | null,
        startIndex?: number | null,
        limit?: number | null,
        recursive?: boolean | null,
        searchTerm?: string | null,
        sortOrder?: Array<SortOrder> | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        filters?: Array<ItemFilter> | null,
        isFavorite?: boolean | null,
        mediaTypes?: Array<string> | null,
        imageTypes?: Array<ImageType> | null,
        sortBy?: Array<string> | null,
        isPlayed?: boolean | null,
        genres?: Array<string> | null,
        officialRatings?: Array<string> | null,
        tags?: Array<string> | null,
        years?: Array<number> | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        person?: string | null,
        personIds?: Array<string> | null,
        personTypes?: Array<string> | null,
        studios?: Array<string> | null,
        artists?: Array<string> | null,
        excludeArtistIds?: Array<string> | null,
        artistIds?: Array<string> | null,
        albumArtistIds?: Array<string> | null,
        contributingArtistIds?: Array<string> | null,
        albums?: Array<string> | null,
        albumIds?: Array<string> | null,
        ids?: Array<string> | null,
        videoTypes?: Array<VideoType> | null,
        minOfficialRating?: string | null,
        isLocked?: boolean | null,
        isPlaceHolder?: boolean | null,
        hasOfficialRating?: boolean | null,
        collapseBoxSetItems?: boolean | null,
        minWidth?: number | null,
        minHeight?: number | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        is3D?: boolean | null,
        seriesStatus?: Array<SeriesStatus> | null,
        nameStartsWithOrGreater?: string | null,
        nameStartsWith?: string | null,
        nameLessThan?: string | null,
        studioIds?: Array<string> | null,
        genreIds?: Array<string> | null,
        enableTotalRecordCount: boolean = true,
        enableImages: boolean | null = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items',
            path: {
                'userId': userId,
            },
            query: {
                'maxOfficialRating': maxOfficialRating,
                'hasThemeSong': hasThemeSong,
                'hasThemeVideo': hasThemeVideo,
                'hasSubtitles': hasSubtitles,
                'hasSpecialFeature': hasSpecialFeature,
                'hasTrailer': hasTrailer,
                'adjacentTo': adjacentTo,
                'parentIndexNumber': parentIndexNumber,
                'hasParentalRating': hasParentalRating,
                'isHd': isHd,
                'is4K': is4K,
                'locationTypes': locationTypes,
                'excludeLocationTypes': excludeLocationTypes,
                'isMissing': isMissing,
                'isUnaired': isUnaired,
                'minCommunityRating': minCommunityRating,
                'minCriticRating': minCriticRating,
                'minPremiereDate': minPremiereDate,
                'minDateLastSaved': minDateLastSaved,
                'minDateLastSavedForUser': minDateLastSavedForUser,
                'maxPremiereDate': maxPremiereDate,
                'hasOverview': hasOverview,
                'hasImdbId': hasImdbId,
                'hasTmdbId': hasTmdbId,
                'hasTvdbId': hasTvdbId,
                'excludeItemIds': excludeItemIds,
                'startIndex': startIndex,
                'limit': limit,
                'recursive': recursive,
                'searchTerm': searchTerm,
                'sortOrder': sortOrder,
                'parentId': parentId,
                'fields': fields,
                'excludeItemTypes': excludeItemTypes,
                'includeItemTypes': includeItemTypes,
                'filters': filters,
                'isFavorite': isFavorite,
                'mediaTypes': mediaTypes,
                'imageTypes': imageTypes,
                'sortBy': sortBy,
                'isPlayed': isPlayed,
                'genres': genres,
                'officialRatings': officialRatings,
                'tags': tags,
                'years': years,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'person': person,
                'personIds': personIds,
                'personTypes': personTypes,
                'studios': studios,
                'artists': artists,
                'excludeArtistIds': excludeArtistIds,
                'artistIds': artistIds,
                'albumArtistIds': albumArtistIds,
                'contributingArtistIds': contributingArtistIds,
                'albums': albums,
                'albumIds': albumIds,
                'ids': ids,
                'videoTypes': videoTypes,
                'minOfficialRating': minOfficialRating,
                'isLocked': isLocked,
                'isPlaceHolder': isPlaceHolder,
                'hasOfficialRating': hasOfficialRating,
                'collapseBoxSetItems': collapseBoxSetItems,
                'minWidth': minWidth,
                'minHeight': minHeight,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'is3D': is3D,
                'seriesStatus': seriesStatus,
                'nameStartsWithOrGreater': nameStartsWithOrGreater,
                'nameStartsWith': nameStartsWith,
                'nameLessThan': nameLessThan,
                'studioIds': studioIds,
                'genreIds': genreIds,
                'enableTotalRecordCount': enableTotalRecordCount,
                'enableImages': enableImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Gets items based on a query.
     * @param userId The user id.
     * @param startIndex The start index.
     * @param limit The item limit.
     * @param searchTerm The search term.
     * @param parentId Specify this to localize the search to a specific item or folder. Omit to use the root.
     * @param fields Optional. Specify additional fields of information to return in the output. This allows multiple, comma delimited. Options: Budget, Chapters, DateCreated, Genres, HomePageUrl, IndexOptions, MediaStreams, Overview, ParentId, Path, People, ProviderIds, PrimaryImageAspectRatio, Revenue, SortName, Studios, Taglines.
     * @param mediaTypes Optional. Filter by MediaType. Allows multiple, comma delimited.
     * @param enableUserData Optional. Include user data.
     * @param imageTypeLimit Optional. The max number of images to return, per image type.
     * @param enableImageTypes Optional. The image types to include in the output.
     * @param excludeItemTypes Optional. If specified, results will be filtered based on item type. This allows multiple, comma delimited.
     * @param includeItemTypes Optional. If specified, results will be filtered based on the item type. This allows multiple, comma delimited.
     * @param enableTotalRecordCount Optional. Enable the total record count.
     * @param enableImages Optional. Include image information in output.
     * @returns BaseItemDtoQueryResult Items returned.
     * @throws ApiError
     */
    public static getResumeItems(
        userId: string,
        startIndex?: number | null,
        limit?: number | null,
        searchTerm?: string | null,
        parentId?: string | null,
        fields?: Array<ItemFields> | null,
        mediaTypes?: Array<string> | null,
        enableUserData?: boolean | null,
        imageTypeLimit?: number | null,
        enableImageTypes?: Array<ImageType> | null,
        excludeItemTypes?: Array<string> | null,
        includeItemTypes?: Array<string> | null,
        enableTotalRecordCount: boolean = true,
        enableImages: boolean | null = true,
    ): CancelablePromise<BaseItemDtoQueryResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Items/Resume',
            path: {
                'userId': userId,
            },
            query: {
                'startIndex': startIndex,
                'limit': limit,
                'searchTerm': searchTerm,
                'parentId': parentId,
                'fields': fields,
                'mediaTypes': mediaTypes,
                'enableUserData': enableUserData,
                'imageTypeLimit': imageTypeLimit,
                'enableImageTypes': enableImageTypes,
                'excludeItemTypes': excludeItemTypes,
                'includeItemTypes': includeItemTypes,
                'enableTotalRecordCount': enableTotalRecordCount,
                'enableImages': enableImages,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}