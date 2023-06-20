/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ErrorDetail = {
  title: string;
  description: string;
  details?: (string | {
    /**
     * error message
     */
    error?: string;
    /**
     * request path
     */
    path?: string;
  });
};
