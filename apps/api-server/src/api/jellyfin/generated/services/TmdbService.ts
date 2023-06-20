/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConfigImageTypes } from '../models/ConfigImageTypes';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TmdbService {

  /**
   * Gets the TMDb image configuration options.
   * @returns ConfigImageTypes Success
   * @throws ApiError
   */
  public static tmdbClientConfiguration(): CancelablePromise<ConfigImageTypes> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/Tmdb/ClientConfiguration',
      errors: {
        401: `Unauthorized`,
        403: `Forbidden`,
      },
    });
  }

}