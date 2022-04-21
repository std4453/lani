/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlbumInfoRemoteSearchQuery } from '../models/AlbumInfoRemoteSearchQuery';
import type { ArtistInfoRemoteSearchQuery } from '../models/ArtistInfoRemoteSearchQuery';
import type { BookInfoRemoteSearchQuery } from '../models/BookInfoRemoteSearchQuery';
import type { BoxSetInfoRemoteSearchQuery } from '../models/BoxSetInfoRemoteSearchQuery';
import type { ExternalIdInfo } from '../models/ExternalIdInfo';
import type { MovieInfoRemoteSearchQuery } from '../models/MovieInfoRemoteSearchQuery';
import type { MusicVideoInfoRemoteSearchQuery } from '../models/MusicVideoInfoRemoteSearchQuery';
import type { PersonLookupInfoRemoteSearchQuery } from '../models/PersonLookupInfoRemoteSearchQuery';
import type { RemoteSearchResult } from '../models/RemoteSearchResult';
import type { SeriesInfoRemoteSearchQuery } from '../models/SeriesInfoRemoteSearchQuery';
import type { TrailerInfoRemoteSearchQuery } from '../models/TrailerInfoRemoteSearchQuery';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ItemLookupService {

    /**
     * Get the item's external id info.
     * @param itemId Item id.
     * @returns ExternalIdInfo External id info retrieved.
     * @throws ApiError
     */
    public static getExternalIdInfos(
        itemId: string,
    ): CancelablePromise<Array<ExternalIdInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/ExternalIdInfos',
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
     * Applies search criteria to an item and refreshes metadata.
     * @param itemId Item id.
     * @param requestBody The remote search result.
     * @param replaceAllImages Optional. Whether or not to replace all images. Default: True.
     * @returns void
     * @throws ApiError
     */
    public static applySearchCriteria(
        itemId: string,
        requestBody: RemoteSearchResult,
        replaceAllImages: boolean = true,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Apply/{itemId}',
            path: {
                'itemId': itemId,
            },
            query: {
                'replaceAllImages': replaceAllImages,
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
     * Get book remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Book remote search executed.
     * @throws ApiError
     */
    public static getBookRemoteSearchResults(
        requestBody: BookInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Book',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get box set remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Box set remote search executed.
     * @throws ApiError
     */
    public static getBoxSetRemoteSearchResults(
        requestBody: BoxSetInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/BoxSet',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get movie remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Movie remote search executed.
     * @throws ApiError
     */
    public static getMovieRemoteSearchResults(
        requestBody: MovieInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Movie',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get music album remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Music album remote search executed.
     * @throws ApiError
     */
    public static getMusicAlbumRemoteSearchResults(
        requestBody: AlbumInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/MusicAlbum',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get music artist remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Music artist remote search executed.
     * @throws ApiError
     */
    public static getMusicArtistRemoteSearchResults(
        requestBody: ArtistInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/MusicArtist',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get music video remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Music video remote search executed.
     * @throws ApiError
     */
    public static getMusicVideoRemoteSearchResults(
        requestBody: MusicVideoInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/MusicVideo',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get person remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Person remote search executed.
     * @throws ApiError
     */
    public static getPersonRemoteSearchResults(
        requestBody: PersonLookupInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Person',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get series remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Series remote search executed.
     * @throws ApiError
     */
    public static getSeriesRemoteSearchResults(
        requestBody: SeriesInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Series',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get trailer remote search.
     * @param requestBody Remote search query.
     * @returns RemoteSearchResult Trailer remote search executed.
     * @throws ApiError
     */
    public static getTrailerRemoteSearchResults(
        requestBody: TrailerInfoRemoteSearchQuery,
    ): CancelablePromise<Array<RemoteSearchResult>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/RemoteSearch/Trailer',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }

}