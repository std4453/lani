import { GraphQLError } from 'graphql';

/**
 * 一切可预见的错误都应该使用 LaniError，其他 assert 性质的使用普通Error；
 * 具有 HTTP/GraphQL 语义的错误应当使用标准错误类型
 */
export class LaniError extends GraphQLError {
  public constructor(
    /**
     * 用户可读报错信息，可能会直接传到前端，不应包含高度敏感信息（如 apiKey）。
     * 建议的格式：`<错误原因> (<简单的详情>)`
     */
    message: string,
    /**
     * 错误处理中会打印到 log，但不会在请求中返回，可以传任意对象，打印时会使用 util.inspect
     * 转成 string
     */
    public internalInfo: Record<string, any> = {},
    /**
     * 根错误，如果传入的是 LaniError，会 merge internalInfo，提取根报错。
     * 注意不要将 AxiosError 传入 originalError，因为它非常大，且包含很多不必要的信息，应当
     * 从 AxiosError 中提取关键信息，写入 internalInfo
     */
    originalError?: Error,
  ) {
    super(
      message,
      undefined,
      undefined,
      undefined,
      undefined,
      isLaniError(originalError) && originalError.originalError
        ? originalError.originalError
        : originalError,
      {
        code: 'LANI_ERROR',
      },
    );
    if (isLaniError(originalError) && originalError.originalError) {
      this.internalInfo = {
        ...originalError.internalInfo,
        ...this.internalInfo,
      };
    }
  }
}

export function isLaniError(error: any): error is LaniError {
  return typeof error === 'object' && error instanceof LaniError;
}
