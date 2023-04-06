import { isApolloError, throwServerError } from '@apollo/client';
import { message } from 'antd';

export class LaniError extends Error {
  public constructor(message: string) {
    super(message);
  }
}

export function throwLaniError(message: string) {
  throw new LaniError(message);
}

export function isLaniError(error: Error) {
  return error instanceof LaniError;
}

/**
 * 解析报错，以人类可读的方式展示，同时打到log
 */
export function parseError(error: unknown) {
  if (!error || typeof error !== 'object' || !(error instanceof Error)) {
    console.error('未知错误🔥', error);
    return '未知错误，请联系管理员';
  }
  if (isLaniError(error)) {
    // 业务错误，不打到console
    return error.message;
  } else if (isApolloError(error)) {
    // if (error) console.error(error);
    if (error.networkError) {
      console.error('网络错误🔥', error.networkError);
      return '网络错误，请稍后再试';
    } else if (error.graphQLErrors[0]) {
      const graphqlError = error.graphQLErrors[0];
      const code = graphqlError.extensions?.code;
      if (code === 'LANI_ERROR') {
        // 后端业务错误
        return graphqlError.message;
      } else {
        console.error('GraphQL错误🔥', graphqlError);
        return '服务内部错误';
      }
    } else {
      return '未知错误，请联系管理员';
    }
  }
}

export function handleError(error: unknown, situation?: string) {
  void message.error(
    `${situation ? `${situation}：` : ''}${parseError(error)}`,
  );
}

/**
 * 仍然抛出Error，但将Error信息归一到人类可读的格式
 */
export function normalizeError(error: unknown) {
  throw new Error(parseError(error));
}
