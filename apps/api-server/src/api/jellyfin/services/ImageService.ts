/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImageFormat } from '../models/ImageFormat';
import type { ImageInfo } from '../models/ImageInfo';
import type { ImageType } from '../models/ImageType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ImageService {

    /**
     * Get artist image by name.
     * @param name Artist name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getArtistImage(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Artists/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get artist image by name.
     * @param name Artist name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headArtistImage(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Artists/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get genre image by name.
     * @param name Genre name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getGenreImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Genres/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get genre image by name.
     * @param name Genre name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headGenreImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Genres/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get genre image by name.
     * @param name Genre name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getGenreImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Genres/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get genre image by name.
     * @param name Genre name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headGenreImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Genres/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get item image infos.
     * @param itemId Item id.
     * @returns ImageInfo Item images returned.
     * @throws ApiError
     */
    public static getItemImageInfos(
        itemId: string,
    ): CancelablePromise<Array<ImageInfo>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Images',
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
     * Delete an item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex The image index.
     * @returns void
     * @throws ApiError
     */
    public static deleteItemImage(
        itemId: string,
        imageType: ImageType,
        imageIndex?: number | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Items/{itemId}/Images/{imageType}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
            },
            query: {
                'imageIndex': imageIndex,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Set item image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static setItemImage(
        itemId: string,
        imageType: ImageType,
        requestBody?: Blob,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/Images/{imageType}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
            },
            body: requestBody,
            mediaType: 'image/*',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param format Optional. The MediaBrowser.Model.Drawing.ImageFormat of the returned image.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getItemImage(
        itemId: string,
        imageType: ImageType,
        maxWidth?: number | null,
        maxHeight?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        tag?: string | null,
        cropWhitespace?: boolean | null,
        format?: ImageFormat | null,
        addPlayedIndicator?: boolean | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Images/{imageType}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
            },
            query: {
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'tag': tag,
                'cropWhitespace': cropWhitespace,
                'format': format,
                'addPlayedIndicator': addPlayedIndicator,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param format Optional. The MediaBrowser.Model.Drawing.ImageFormat of the returned image.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headItemImage(
        itemId: string,
        imageType: ImageType,
        maxWidth?: number | null,
        maxHeight?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        tag?: string | null,
        cropWhitespace?: boolean | null,
        format?: ImageFormat | null,
        addPlayedIndicator?: boolean | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Items/{itemId}/Images/{imageType}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
            },
            query: {
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'tag': tag,
                'cropWhitespace': cropWhitespace,
                'format': format,
                'addPlayedIndicator': addPlayedIndicator,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Delete an item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex The image index.
     * @returns void
     * @throws ApiError
     */
    public static deleteItemImageByIndex(
        itemId: string,
        imageType: ImageType,
        imageIndex: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Set item image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex (Unused) Image index.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static setItemImageByIndex(
        itemId: string,
        imageType: ImageType,
        imageIndex: number,
        requestBody?: Blob,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            body: requestBody,
            mediaType: 'image/*',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param format Optional. The MediaBrowser.Model.Drawing.ImageFormat of the returned image.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getItemImageByIndex(
        itemId: string,
        imageType: ImageType,
        imageIndex: number,
        maxWidth?: number | null,
        maxHeight?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        tag?: string | null,
        cropWhitespace?: boolean | null,
        format?: ImageFormat | null,
        addPlayedIndicator?: boolean | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'tag': tag,
                'cropWhitespace': cropWhitespace,
                'format': format,
                'addPlayedIndicator': addPlayedIndicator,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param format Optional. The MediaBrowser.Model.Drawing.ImageFormat of the returned image.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headItemImageByIndex(
        itemId: string,
        imageType: ImageType,
        imageIndex: number,
        maxWidth?: number | null,
        maxHeight?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        tag?: string | null,
        cropWhitespace?: boolean | null,
        format?: ImageFormat | null,
        addPlayedIndicator?: boolean | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'tag': tag,
                'cropWhitespace': cropWhitespace,
                'format': format,
                'addPlayedIndicator': addPlayedIndicator,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param imageIndex Image index.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getItemImage2(
        itemId: string,
        imageType: ImageType,
        maxWidth: number,
        maxHeight: number,
        tag: string,
        format: ImageFormat,
        percentPlayed: number,
        unplayedCount: number,
        imageIndex: number,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}/{tag}/{format}/{maxWidth}/{maxHeight}/{percentPlayed}/{unplayedCount}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'tag': tag,
                'format': format,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'imageIndex': imageIndex,
            },
            query: {
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Gets the item's image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param imageIndex Image index.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headItemImage2(
        itemId: string,
        imageType: ImageType,
        maxWidth: number,
        maxHeight: number,
        tag: string,
        format: ImageFormat,
        percentPlayed: number,
        unplayedCount: number,
        imageIndex: number,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}/{tag}/{format}/{maxWidth}/{maxHeight}/{percentPlayed}/{unplayedCount}',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'tag': tag,
                'format': format,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'imageIndex': imageIndex,
            },
            query: {
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Updates the index for an item image.
     * @param itemId Item id.
     * @param imageType Image type.
     * @param imageIndex Old image index.
     * @param newIndex New image index.
     * @returns void
     * @throws ApiError
     */
    public static updateItemImageIndex(
        itemId: string,
        imageType: ImageType,
        imageIndex: number,
        newIndex: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Items/{itemId}/Images/{imageType}/{imageIndex}/Index',
            path: {
                'itemId': itemId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'newIndex': newIndex,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get music genre image by name.
     * @param name Music genre name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getMusicGenreImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/MusicGenres/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get music genre image by name.
     * @param name Music genre name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headMusicGenreImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/MusicGenres/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get music genre image by name.
     * @param name Music genre name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getMusicGenreImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/MusicGenres/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get music genre image by name.
     * @param name Music genre name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headMusicGenreImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/MusicGenres/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get person image by name.
     * @param name Person name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getPersonImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Persons/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get person image by name.
     * @param name Person name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headPersonImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Persons/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get person image by name.
     * @param name Person name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getPersonImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Persons/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get person image by name.
     * @param name Person name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headPersonImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Persons/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get studio image by name.
     * @param name Studio name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getStudioImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Studios/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get studio image by name.
     * @param name Studio name.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headStudioImage(
        name: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Studios/{name}/Images/{imageType}',
            path: {
                'name': name,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get studio image by name.
     * @param name Studio name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getStudioImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Studios/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get studio image by name.
     * @param name Studio name.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headStudioImageByIndex(
        name: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Studios/{name}/Images/{imageType}/{imageIndex}',
            path: {
                'name': name,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Sets the user image.
     * @param userId User Id.
     * @param imageType (Unused) Image type.
     * @param index (Unused) Image index.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static postUserImage(
        userId: string,
        imageType: ImageType,
        index?: number | null,
        requestBody?: Blob,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Images/{imageType}',
            path: {
                'userId': userId,
                'imageType': imageType,
            },
            query: {
                'index': index,
            },
            body: requestBody,
            mediaType: 'image/*',
            errors: {
                401: `Unauthorized`,
                403: `User does not have permission to delete the image.`,
            },
        });
    }

    /**
     * Delete the user's image.
     * @param userId User Id.
     * @param imageType (Unused) Image type.
     * @param index (Unused) Image index.
     * @returns void
     * @throws ApiError
     */
    public static deleteUserImage(
        userId: string,
        imageType: ImageType,
        index?: number | null,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/Images/{imageType}',
            path: {
                'userId': userId,
                'imageType': imageType,
            },
            query: {
                'index': index,
            },
            errors: {
                401: `Unauthorized`,
                403: `User does not have permission to delete the image.`,
            },
        });
    }

    /**
     * Get user profile image.
     * @param userId User id.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getUserImage(
        userId: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Images/{imageType}',
            path: {
                'userId': userId,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get user profile image.
     * @param userId User id.
     * @param imageType Image type.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @param imageIndex Image index.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headUserImage(
        userId: string,
        imageType: ImageType,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
        imageIndex?: number | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Users/{userId}/Images/{imageType}',
            path: {
                'userId': userId,
                'imageType': imageType,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
                'imageIndex': imageIndex,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get user profile image.
     * @param userId User id.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static getUserImageByIndex(
        userId: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Users/{userId}/Images/{imageType}/{imageIndex}',
            path: {
                'userId': userId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Get user profile image.
     * @param userId User id.
     * @param imageType Image type.
     * @param imageIndex Image index.
     * @param tag Optional. Supply the cache tag from the item object to receive strong caching headers.
     * @param format Determines the output format of the image - original,gif,jpg,png.
     * @param maxWidth The maximum image width to return.
     * @param maxHeight The maximum image height to return.
     * @param percentPlayed Optional. Percent to render for the percent played overlay.
     * @param unplayedCount Optional. Unplayed count overlay to render.
     * @param width The fixed image width to return.
     * @param height The fixed image height to return.
     * @param quality Optional. Quality setting, from 0-100. Defaults to 90 and should suffice in most cases.
     * @param fillWidth Width of box to fill.
     * @param fillHeight Height of box to fill.
     * @param cropWhitespace Optional. Specify if whitespace should be cropped out of the image. True/False. If unspecified, whitespace will be cropped from logos and clear art.
     * @param addPlayedIndicator Optional. Add a played indicator.
     * @param blur Optional. Blur image.
     * @param backgroundColor Optional. Apply a background color for transparent images.
     * @param foregroundLayer Optional. Apply a foreground layer on top of the image.
     * @returns binary Image stream returned.
     * @throws ApiError
     */
    public static headUserImageByIndex(
        userId: string,
        imageType: ImageType,
        imageIndex: number,
        tag?: string | null,
        format?: ImageFormat | null,
        maxWidth?: number | null,
        maxHeight?: number | null,
        percentPlayed?: number | null,
        unplayedCount?: number | null,
        width?: number | null,
        height?: number | null,
        quality?: number | null,
        fillWidth?: number | null,
        fillHeight?: number | null,
        cropWhitespace?: boolean | null,
        addPlayedIndicator?: boolean | null,
        blur?: number | null,
        backgroundColor?: string | null,
        foregroundLayer?: string | null,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'HEAD',
            url: '/Users/{userId}/Images/{imageType}/{imageIndex}',
            path: {
                'userId': userId,
                'imageType': imageType,
                'imageIndex': imageIndex,
            },
            query: {
                'tag': tag,
                'format': format,
                'maxWidth': maxWidth,
                'maxHeight': maxHeight,
                'percentPlayed': percentPlayed,
                'unplayedCount': unplayedCount,
                'width': width,
                'height': height,
                'quality': quality,
                'fillWidth': fillWidth,
                'fillHeight': fillHeight,
                'cropWhitespace': cropWhitespace,
                'addPlayedIndicator': addPlayedIndicator,
                'blur': blur,
                'backgroundColor': backgroundColor,
                'foregroundLayer': foregroundLayer,
            },
            errors: {
                404: `Item not found.`,
            },
        });
    }

    /**
     * Sets the user image.
     * @param userId User Id.
     * @param imageType (Unused) Image type.
     * @param index (Unused) Image index.
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static postUserImageByIndex(
        userId: string,
        imageType: ImageType,
        index: number,
        requestBody?: Blob,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Users/{userId}/Images/{imageType}/{index}',
            path: {
                'userId': userId,
                'imageType': imageType,
                'index': index,
            },
            body: requestBody,
            mediaType: 'image/*',
            errors: {
                401: `Unauthorized`,
                403: `User does not have permission to delete the image.`,
            },
        });
    }

    /**
     * Delete the user's image.
     * @param userId User Id.
     * @param imageType (Unused) Image type.
     * @param index (Unused) Image index.
     * @returns void
     * @throws ApiError
     */
    public static deleteUserImageByIndex(
        userId: string,
        imageType: ImageType,
        index: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/Users/{userId}/Images/{imageType}/{index}',
            path: {
                'userId': userId,
                'imageType': imageType,
                'index': index,
            },
            errors: {
                401: `Unauthorized`,
                403: `User does not have permission to delete the image.`,
            },
        });
    }

}