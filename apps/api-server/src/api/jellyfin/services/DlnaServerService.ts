/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DlnaServerService {

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getConnectionManager(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ConnectionManager',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getConnectionManager2(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ConnectionManager/ConnectionManager',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getConnectionManager3(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ConnectionManager/ConnectionManager.xml',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Process a connection manager control request.
     * @param serverId Server UUID.
     * @returns binary Request processed.
     * @throws ApiError
     */
    public static processConnectionManagerControlRequest(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Dlna/{serverId}/ConnectionManager/Control',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna content directory xml.
     * @param serverId Server UUID.
     * @returns binary Dlna content directory returned.
     * @throws ApiError
     */
    public static getContentDirectory(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ContentDirectory',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna content directory xml.
     * @param serverId Server UUID.
     * @returns binary Dlna content directory returned.
     * @throws ApiError
     */
    public static getContentDirectory2(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ContentDirectory/ContentDirectory',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna content directory xml.
     * @param serverId Server UUID.
     * @returns binary Dlna content directory returned.
     * @throws ApiError
     */
    public static getContentDirectory3(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/ContentDirectory/ContentDirectory.xml',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Process a content directory control request.
     * @param serverId Server UUID.
     * @returns binary Request processed.
     * @throws ApiError
     */
    public static processContentDirectoryControlRequest(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Dlna/{serverId}/ContentDirectory/Control',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Get Description Xml.
     * @param serverId Server UUID.
     * @returns binary Description xml returned.
     * @throws ApiError
     */
    public static getDescriptionXml(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/description',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Get Description Xml.
     * @param serverId Server UUID.
     * @returns binary Description xml returned.
     * @throws ApiError
     */
    public static getDescriptionXml2(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/description.xml',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets a server icon.
     * @param serverId Server UUID.
     * @param fileName The icon filename.
     * @returns binary Request processed.
     * @throws ApiError
     */
    public static getIconId(
        serverId: string,
        fileName: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/icons/{fileName}',
            path: {
                'serverId': serverId,
                'fileName': fileName,
            },
            errors: {
                404: `Not Found.`,
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getMediaReceiverRegistrar(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/MediaReceiverRegistrar',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Process a media receiver registrar control request.
     * @param serverId Server UUID.
     * @returns binary Request processed.
     * @throws ApiError
     */
    public static processMediaReceiverRegistrarControlRequest(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/Dlna/{serverId}/MediaReceiverRegistrar/Control',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getMediaReceiverRegistrar2(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/MediaReceiverRegistrar/MediaReceiverRegistrar',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets Dlna media receiver registrar xml.
     * @param serverId Server UUID.
     * @returns binary Dlna media receiver registrar xml returned.
     * @throws ApiError
     */
    public static getMediaReceiverRegistrar3(
        serverId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/{serverId}/MediaReceiverRegistrar/MediaReceiverRegistrar.xml',
            path: {
                'serverId': serverId,
            },
            errors: {
                503: `DLNA is disabled.`,
            },
        });
    }

    /**
     * Gets a server icon.
     * @param fileName The icon filename.
     * @returns binary Request processed.
     * @throws ApiError
     */
    public static getIcon(
        fileName: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Dlna/icons/{fileName}',
            path: {
                'fileName': fileName,
            },
            errors: {
                404: `Not Found.`,
                503: `DLNA is disabled.`,
            },
        });
    }

}