import { ListJellyfinFoldersDocument } from './queries.graphql';
import { extractNode } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { Select, SelectProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';

export function useJellyfinFolders(visible: boolean) {
  const { data: foldersData, loading: foldersLoading } = useQuery(
    ListJellyfinFoldersDocument,
  );
  const [folderId, setFolderId] = useState<number | null>(null);
  const animeFolderId = useMemo(
    () =>
      (extractNode(foldersData?.allJellyfinFolders) ?? []).find(
        (folder) => folder.location === 'anime',
      )?.id,
    [foldersData],
  );
  useEffect(() => {
    if (visible) {
      if (animeFolderId) {
        setFolderId(animeFolderId);
      } else {
        setFolderId(null);
      }
    }
  }, [visible, animeFolderId]);

  const foldersSelectProps: SelectProps = {
    loading: foldersLoading,
    value: folderId,
    onChange: setFolderId,
    placeholder: '选择媒体库',
    children: (extractNode(foldersData?.allJellyfinFolders) ?? []).map(
      (folder) => (
        <Select.Option key={folder.id} value={folder.id}>
          {folder.name} ({folder.location})
        </Select.Option>
      ),
    ),
  };

  return { folderId, foldersSelectProps };
}
