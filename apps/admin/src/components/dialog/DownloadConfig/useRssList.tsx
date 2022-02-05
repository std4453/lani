import { ProFormInstance } from '@ant-design/pro-form';
import { useMemoizedFn } from 'ahooks';
import { MutableRefObject, useEffect } from 'react';
import { useRequest } from 'umi';
import { FormValues } from './types';

async function fetchRssItems(
  bangumiId: string,
  publishGroupId: string,
): Promise<string[]> {
  return [];
}

export default function useRssList(
  animeBangumiId: string,
  formRef: MutableRefObject<ProFormInstance<FormValues> | undefined>,
) {
  const { run, loading, data } = useRequest(
    async () => {
      const finalBangumiId =
        formRef.current?.getFieldValue('bangumiId') || animeBangumiId;
      if (!finalBangumiId) {
        return {
          data: [],
        };
      }
      const publishGroupId = formRef.current?.getFieldValue('publishGroupId');
      if (!publishGroupId) {
        return {
          data: [],
        };
      }
      return {
        data: await fetchRssItems(finalBangumiId, publishGroupId),
      };
    },
    {
      debounceInterval: 300,
      manual: true,
    },
  );
  useEffect(() => {
    void run();
  }, [animeBangumiId]);

  const onChange = useMemoizedFn(() => {
    void run();
  });

  return { onChange, loading, data };
}
