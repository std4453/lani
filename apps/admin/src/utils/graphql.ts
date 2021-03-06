// eslint-disable-next-line @typescript-eslint/ban-types
export type ExcludeTypename<T> = T extends Function
  ? T
  : T extends object
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
  const nonNullEdges = excludeNullAndUndefined(data.edges);
  const nonNullNodes = excludeNullAndUndefined(
    nonNullEdges.map(({ node }) => node),
  );
  return nonNullNodes.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ __typename, ...node }: any) => node,
  ) as ExtractNode<T>[];
}
