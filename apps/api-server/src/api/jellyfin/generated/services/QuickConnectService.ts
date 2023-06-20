/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuickConnectResult } from '../models/QuickConnectResult';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QuickConnectService {

  /**
   * Authorizes a pending quick connect request.
   * @param code Quick connect code to authorize.
   * @returns boolean Quick connect result authorized successfully.
   * @throws ApiError
   */
  public static authorize(
    code: string,
  ): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/QuickConnect/Authorize',
      query: {
        'code': code,
      },
      errors: {
        401: `Unauthorized`,
        403: `Unknown user id.`,
      },
    });
  }

  /**
   * Attempts to retrieve authentication information.
   * @param secret Secret previously returned from the Initiate endpoint.
   * @returns QuickConnectResult Quick connect result returned.
   * @throws ApiError
   */
  public static connect(
    secret: string,
  ): CancelablePromise<QuickConnectResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/QuickConnect/Connect',
      query: {
        'secret': secret,
      },
      errors: {
        404: `Unknown quick connect secret.`,
      },
    });
  }

  /**
   * Gets the current quick connect state.
   * @returns boolean Quick connect state returned.
   * @throws ApiError
   */
  public static getEnabled(): CancelablePromise<boolean> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/QuickConnect/Enabled',
    });
  }

  /**
   * Initiate a new quick connect request.
   * @returns QuickConnectResult Quick connect request successfully created.
   * @throws ApiError
   */
  public static initiate(): CancelablePromise<QuickConnectResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/QuickConnect/Initiate',
      errors: {
        401: `Quick connect is not active on this server.`,
      },
    });
  }

}