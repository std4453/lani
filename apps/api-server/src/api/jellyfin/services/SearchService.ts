/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SearchHintResult } from '../models/SearchHintResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SearchService {

    /**
     * Gets the search hint result.
     * @param searchTerm The search term to filter on.
     * @param startIndex Optional. The record index to start at. All items with a lower index will be dropped from the results.
     * @param limit Optional. The maximum number of records to return.
     * @param userId Optional. Supply a user id to search within a user's library or omit to search all.
     * @param includeItemTypes If specified, only results with the specified item types are returned. This allows multiple, comma delimeted.
     * @param excludeItemTypes If specified, results with these item types are filtered out. This allows multiple, comma delimeted.
     * @param mediaTypes If specified, only results with the specified media types are returned. This allows multiple, comma delimeted.
     * @param parentId If specified, only children of the parent are returned.
     * @param isMovie Optional filter for movies.
     * @param isSeries Optional filter for series.
     * @param isNews Optional filter for news.
     * @param isKids Optional filter for kids.
     * @param isSports Optional filter for sports.
     * @param includePeople Optional filter whether to include people.
     * @param includeMedia Optional filter whether to include media.
     * @param includeGenres Optional filter whether to include genres.
     * @param includeStudios Optional filter whether to include studios.
     * @param includeArtists Optional filter whether to include artists.
     * @returns SearchHintResult Search hint returned.
     * @throws ApiError
     */
    public static get(
        searchTerm: string,
        startIndex?: number | null,
        limit?: number | null,
        userId?: string | null,
        includeItemTypes?: Array<string> | null,
        excludeItemTypes?: Array<string> | null,
        mediaTypes?: Array<string> | null,
        parentId?: string | null,
        isMovie?: boolean | null,
        isSeries?: boolean | null,
        isNews?: boolean | null,
        isKids?: boolean | null,
        isSports?: boolean | null,
        includePeople: boolean = true,
        includeMedia: boolean = true,
        includeGenres: boolean = true,
        includeStudios: boolean = true,
        includeArtists: boolean = true,
    ): CancelablePromise<SearchHintResult> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Search/Hints',
            query: {
                'startIndex': startIndex,
                'limit': limit,
                'userId': userId,
                'searchTerm': searchTerm,
                'includeItemTypes': includeItemTypes,
                'excludeItemTypes': excludeItemTypes,
                'mediaTypes': mediaTypes,
                'parentId': parentId,
                'isMovie': isMovie,
                'isSeries': isSeries,
                'isNews': isNews,
                'isKids': isKids,
                'isSports': isSports,
                'includePeople': includePeople,
                'includeMedia': includeMedia,
                'includeGenres': includeGenres,
                'includeStudios': includeStudios,
                'includeArtists': includeArtists,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}