/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * 响应状态（HTTP 状态码都为 200）
 */
export type StatusCode = {
  /**
   * 当前请求的地址
   */
  request?: string;
  /**
   * 状态码 <br> 200 OK <br> 202 Accepted <br> 304 Not Modified <br> 30401 Not Modified: Collection already exists <br> 400 Bad Request <br> 40001 Error: Nothing found with that ID <br> 401 Unauthorized <br> 40101 Error: Auth failed over 5 times <br> 40102 Error: Username is not an Email address <br> 405 Method Not Allowed <br> 404 Not Found
   */
  code?: StatusCode.code;
  /**
   * 状态信息
   */
  error?: string;
};

export namespace StatusCode {

  /**
   * 状态码 <br> 200 OK <br> 202 Accepted <br> 304 Not Modified <br> 30401 Not Modified: Collection already exists <br> 400 Bad Request <br> 40001 Error: Nothing found with that ID <br> 401 Unauthorized <br> 40101 Error: Auth failed over 5 times <br> 40102 Error: Username is not an Email address <br> 405 Method Not Allowed <br> 404 Not Found
   */
  export enum code {
    '_200' = 200,
    '_202' = 202,
    '_304' = 304,
    '_30401' = 30401,
    '_400' = 400,
    '_40001' = 40001,
    '_401' = 401,
    '_40101' = 40101,
    '_40102' = 40102,
    '_405' = 405,
    '_404' = 404,
  }


}
