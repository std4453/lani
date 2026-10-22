import { InMemoryCache } from '@apollo/client';
import { TaskSummary } from '@lani/workflow';

export function createCache() {
  return new InMemoryCache({
    typePolicies: {
      Task: {
        fields: {
          statusSummary: {
            // JSON 摘要整体替换；慢请求不能覆盖已读到的较新版本。
            merge(
              existing: TaskSummary | undefined,
              incoming: TaskSummary | null,
            ) {
              return existing && incoming && existing.version > incoming.version
                ? existing
                : incoming;
            },
          },
        },
      },
    },
  });
}
