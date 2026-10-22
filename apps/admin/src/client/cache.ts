import {
  InMemoryCache,
  StoreObject,
  FieldFunctionOptions,
} from '@apollo/client';

export function createCache() {
  return new InMemoryCache({
    typePolicies: {
      TaskStepSummary: { keyFields: false },
      TaskStatusSummary: { keyFields: false },
      Task: {
        fields: {
          statusSummary: {
            // 慢请求不能用旧版本覆盖快速轮询已经读到的新流程。
            merge(
              existing: StoreObject | undefined,
              incoming: StoreObject | null,
              { readField }: FieldFunctionOptions,
            ) {
              if (
                existing &&
                incoming &&
                (readField<number>('version', existing) ?? -1) >
                  (readField<number>('version', incoming) ?? -1)
              )
                return existing;
              return incoming;
            },
          },
        },
      },
    },
  });
}
