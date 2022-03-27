/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class VideoAttachmentsService {

    /**
     * Get video attachment.
     * @param videoId Video ID.
     * @param mediaSourceId Media Source ID.
     * @param index Attachment Index.
     * @returns binary Attachment retrieved.
     * @throws ApiError
     */
    public static getAttachment(
        videoId: string,
        mediaSourceId: string,
        index: number,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/Videos/{videoId}/{mediaSourceId}/Attachments/{index}',
            path: {
                'videoId': videoId,
                'mediaSourceId': mediaSourceId,
                'index': index,
            },
            errors: {
                404: `Video or attachment not found.`,
            },
        });
    }

}