import { useApolloClient } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { RequestData } from '@ant-design/pro-table';

export type ExcludeTypename<T> = T extends object
  ? Omit<ExcludeTypenameObject<T>, '__typename'>
  : T extends Array<infer U>
  ? ExcludeTypename<U>
  : T;
type ExcludeTypenameObject<T> = {
  [key in keyof T]: ExcludeTypename<T[key]>;
};

export type ExtractNode<T> = T extends {
  edges: (
    | {
        node?: infer U | null;
      }
    | null
    | undefined
  )[];
}
  ? ExcludeTypename<U>
  : never;

function excludeNullAndUndefined<T>(arr: (T | null | undefined)[]) {
  return arr.filter((item) => item !== null && item !== undefined) as Array<T>;
}

export function extractNode<
  T extends {
    edges: (
      | {
          node?: unknown | null;
        }
      | null
      | undefined
    )[];
  },
>(data: T | null | undefined): ExtractNode<T>[] | undefined {
  if (!data) {
    return;
  }
  const nonNullEdges = excludeNullAndUndefined(data['edges']);
  const nonNullNodes = excludeNullAndUndefined(
    nonNullEdges.map(({ node }) => node),
  );
  return nonNullNodes as ExtractNode<T>[];
}

export function useProTableRequest<
  TQuery,
  TResult extends {
    totalCount: number;
    edges: (
      | {
          node?: unknown | null;
        }
      | null
      | undefined
    )[];
  },
  TVariables extends {
    count: number;
    offset: number;
  },
  TNode = ExtractNode<TResult>,
>(
  document: TypedDocumentNode<TQuery, TVariables>,
  extract: (query: TQuery) => TResult | null | undefined,
) {
  const client = useApolloClient();
  return useMemoizedFn(
    async ({
      pageSize = 10,
      current = 0,
      ...variables
    }: {
      pageSize?: number;
      current?: number;
    } & Omit<TVariables, 'count' | 'offset'>): Promise<
      Partial<RequestData<TNode>>
    > => {
      const { data, error } = await client.query({
        query: document,
        variables: {
          count: pageSize,
          offset: pageSize * (current - 1),
          // unsafe if
          ...variables,
        } as TVariables,
      });
      if (error) {
        console.error(error);
        return {
          success: false,
        };
      }
      const result = extract(data);
      if (!result) {
        return {
          success: false,
        };
      }
      return {
        data: extractNode<any>(result) as any,
        success: true,
        total: (result as any).totalCount,
      };
    },
  );
}
