/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ClientLogDocumentResponseDto } from '../models/ClientLogDocumentResponseDto';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ClientLogService {

  /**
   * Upload a document.
   * @param requestBody
   * @returns ClientLogDocumentResponseDto Document saved.
   * @throws ApiError
   */
  public static logFile(
    requestBody?: Blob,
  ): CancelablePromise<ClientLogDocumentResponseDto> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/ClientLog/Document',
      body: requestBody,
      mediaType: 'text/plain',
      errors: {
        401: `Unauthorized`,
        403: `Event logging disabled.`,
        413: `Upload size too large.`,
      },
    });
  }

}