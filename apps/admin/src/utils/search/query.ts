import { ExtractNode, extractNode } from '@/utils/graphql';
import { ApolloQueryResult } from '@apollo/client';

export function processApolloQueryResult<
  T extends {
    data?:
      | {
          edges: (
            | {
                node?: unknown | null;
              }
            | undefined
            | null
          )[];
          totalCount: number;
        }
      | null
      | undefined;
  },
>(
  result: ApolloQueryResult<T>,
):
  | {
      success: false;
    }
  | {
      success: true;
      data: ExtractNode<T['data']>[];
      total: number;
    } {
  const { data, error } = result;
  if (error) {
    console.error(error);
    return {
      success: false,
    };
  }
  const queryResult: T['data'] = data.data;
  if (!queryResult) {
    return {
      success: false,
    };
  }
  const nodes = extractNode(queryResult);
  if (!nodes) {
    return {
      success: false,
    };
  }
  return {
    data: nodes,
    success: true,
    total: queryResult.totalCount,
  };
}
