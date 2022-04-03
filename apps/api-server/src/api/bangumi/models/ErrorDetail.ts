/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type ErrorDetail = {
  title: string;
  description: string;
  detail: {
    /**
     * error message
     */
    error?: string;
    /**
     * request path
     */
    path?: string;
  };
};
