import { calcEpisodeStatus, EpisodeStatus } from '@/constants/download-status';
import {
  DisplayImageFieldsFragment,
  GetJellyfinIdByIdDocument,
  GetSeasonByIdDocument,
  MetadataSource,
  SaveSeasonDocument,
  SeasonConfigFieldsFragment,
  SeasonEpisodesFragment,
  SyncEpisodeDataDocument,
  SyncMetadataDocument,
} from '@/generated/types';
import { handleError } from '@/utils/error';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { useApolloPoll } from '@/utils/useApolloPoll';
import { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient, useQuery } from '@apollo/client';
import { useMemoizedFn, useMount } from 'ahooks';
import { FormItemProps, message } from 'antd';
import {
  createContext,
  MutableRefObject,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

export type Season = SeasonConfigFieldsFragment;

type RawEpisode = NonNullable<
  ExtractNode<SeasonEpisodesFragment['episodesBySeasonId']>
>;
export type Episode = Omit<RawEpisode, 'downloadJobsByEpisodeId'> & {
  jobStatus: EpisodeStatus;
};

export function mapEpisode(episode: RawEpisode): Episode {
  return {
    ...episode,
    jobStatus: calcEpisodeStatus(episode),
  };
}

type DownloadSource = ExtractNode<
  SeasonConfigFieldsFragment['downloadSourcesBySeasonId']
>;

export interface FormValues {
  isMonitoring: boolean;
  jellyfinFolderDesc: string;
  tags: string[];
  title: string;
  tvdbId: string;
  tvdbSeason: number | null;
  weekday: string | null;
  year: number | null;
  semester: string | null;
  airTime: string;
  bangumiId: string;
  bilibiliMainlandId: string;
  bilibiliThmId: string;
  description: string;
  downloadSources: DownloadSource[];
  infoSource: MetadataSource;
  episodesSource: MetadataSource;
  poster: DisplayImageFieldsFragment | null;
  fanart: DisplayImageFieldsFragment | null;
  banner: DisplayImageFieldsFragment | null;
  needDownloadCc: boolean;
  notifyMissing: boolean;
  notifyPublish: boolean;
  episodesAutoSync: boolean;
  downloadOffsetType: 'postpone' | 'advance';
  downloadOffsetDays: number;
  downloadOffsetHours: number;
}

export function queryToFormValues({
  isMonitoring,
  jellyfinFolder,
  tags,
  title,
  tvdbId,
  tvdbSeason,
  weekday,
  yearAndSemester,
  airTime,
  bangumiId,
  bilibiliMainlandId,
  bilibiliThmId,
  description,
  downloadSourcesBySeasonId,
  infoSource,
  episodesSource,
  poster,
  banner,
  fanart,
  needDownloadCc,
  notifyMissing,
  notifyPublish,
  episodesAutoSync,
  downloadOffsetHours,
}: Season): FormValues {
  return {
    isMonitoring,
    jellyfinFolderDesc: jellyfinFolder
      ? `${jellyfinFolder.name} (${jellyfinFolder.location})`
      : '',
    tags: tags.filter((tag): tag is string => Boolean(tag)),
    title,
    tvdbId,
    tvdbSeason: tvdbSeason ?? null,
    weekday: typeof weekday === 'number' ? `${weekday}` : null,
    year: yearAndSemester ? parseInt(yearAndSemester.substring(0, 4)) : null,
    semester: yearAndSemester
      ? `${parseInt(yearAndSemester.substring(4, 6))}`
      : null,
    airTime,
    bangumiId,
    bilibiliMainlandId,
    bilibiliThmId,
    description,
    downloadSources: (extractNode(downloadSourcesBySeasonId) ?? []).map(
      ({ offset, ...source }) => ({
        ...source,
        offset,
      }),
    ),
    infoSource,
    episodesSource,
    poster: poster ?? null,
    banner: banner ?? null,
    fanart: fanart ?? null,
    needDownloadCc,
    notifyMissing,
    notifyPublish,
    episodesAutoSync,
    downloadOffsetType: downloadOffsetHours >= 0 ? 'advance' : 'postpone',
    downloadOffsetDays: Math.floor(Math.abs(downloadOffsetHours) / 24),
    downloadOffsetHours: Math.abs(downloadOffsetHours) % 24,
  };
}

export const formItemProps: FormItemProps = {
  labelCol: {
    md: 5,
    lg: 4,
    xl: 3,
    xxl: 2,
  },
  wrapperCol: {
    md: 19,
    lg: 20,
    xl: 21,
    xxl: 22,
  },
  labelAlign: 'left',
};

export type FormRef = MutableRefObject<ProFormInstance<FormValues> | undefined>;

export type SeasonPageContextValues = ReturnType<
  typeof useSeasonPage
>['values'];

export const SeasonPageContext = createContext<SeasonPageContextValues | null>(
  null,
);

export function useSeasonPageContext() {
  const values = useContext(SeasonPageContext);
  if (values === null) {
    throw new Error(
      'useSeasonPageContext() called outside of SeasonPageContext',
    );
  }
  return values;
}

export function useSeasonId() {
  return useSeasonPageContext().id;
}

function useJellyfinId(id: number) {
  const { data, startPolling, stopPolling, refetch } = useQuery(
    GetJellyfinIdByIdDocument,
    {
      variables: {
        id,
      },
      pollInterval: 2000,
    },
  );
  useApolloPoll({ startPolling, stopPolling, refetch, pollInterval: 2000 });

  return data?.seasonById?.jellyfinId ?? '';
}

export function useSeasonPage(id: number) {
  const client = useApolloClient();

  const formRef = useRef<ProFormInstance<FormValues>>();

  const [initialValues, setInitialValues] = useState<FormValues | undefined>(
    undefined,
  );
  const [episodesLastSync, setEpisodesLastSync] = useState<Date | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState(false);
  const jellyfinId = useJellyfinId(id);

  const updateTouched = useMemoizedFn(() => {
    if (formRef.current) {
      setTouched(formRef.current.isFieldsTouched(false));
    }
  });

  const reset = useMemoizedFn(() => {
    formRef.current?.resetFields();
    updateTouched();
  });

  const setValues = useMemoizedFn(
    (
      values:
        | Season
        | SeasonEpisodesFragment
        | (Season & SeasonEpisodesFragment),
    ) => {
      if ('id' in values) {
        setInitialValues(queryToFormValues(values));
        reset();
      }
      if ('episodesBySeasonId' in values) {
        setEpisodesLastSync(values.episodesLastSync ?? null);
        setEpisodes(
          (extractNode(values.episodesBySeasonId) ?? []).map(mapEpisode),
        );
      }
    },
  );

  const reload = useMemoizedFn(
    async ({
      withConfig = false,
      withEpisodes = false,
    }: {
      withConfig?: boolean;
      withEpisodes?: boolean;
    }) => {
      const { data } = await client.query({
        query: GetSeasonByIdDocument,
        variables: {
          id,
          withConfig,
          withEpisodes,
        },
      });
      if (!data.seasonById) {
        return;
      }
      setValues(data.seasonById);
    },
  );

  useMount(async () => {
    setLoading(true);
    try {
      await reload({ withConfig: true, withEpisodes: true });
    } finally {
      setLoading(false);
    }
  });

  const reloadConfig = useMemoizedFn(async () => {
    setLoading(true);
    try {
      await reload({
        withConfig: true,
      });
    } finally {
      setLoading(false);
    }
  });
  const reloadEpisodes = useMemoizedFn(async () => {
    setLoading(true);
    try {
      await reload({
        withEpisodes: true,
      });
    } finally {
      setLoading(false);
    }
  });
  const reloadAll = useMemoizedFn(async () => {
    setLoading(true);
    try {
      await reload({
        withConfig: true,
        withEpisodes: true,
      });
    } finally {
      setLoading(false);
    }
  });

  const syncMetadataAndEpisodes = useMemoizedFn(async () => {
    try {
      setLoading(true);
      await client.mutate({
        mutation: SyncMetadataDocument,
        variables: {
          seasonId: id,
        },
      });
      await client.mutate({
        mutation: SyncEpisodeDataDocument,
        variables: {
          seasonId: id,
        },
      });
      await reload({
        withConfig: true,
        withEpisodes: true,
      });
      void message.success('同步元数据成功');
    } catch (error) {
      handleError(error, '同步元数据失败');
    } finally {
      setLoading(false);
    }
  });

  const syncEpisodes = useMemoizedFn(async () => {
    try {
      setLoading(true);
      await client.mutate({
        mutation: SyncEpisodeDataDocument,
        variables: {
          seasonId: id,
        },
      });
      await reload({
        withEpisodes: true,
      });
      void message.success('同步剧集信息成功');
    } catch (error) {
      handleError(error, '同步剧集信息失败');
    } finally {
      setLoading(false);
    }
  });

  const submit = useMemoizedFn(
    async ({
      isMonitoring,
      title,
      tvdbId,
      tvdbSeason,
      weekday,
      year,
      semester,
      airTime,
      bangumiId,
      bilibiliMainlandId,
      bilibiliThmId,
      downloadSources,
      infoSource,
      episodesSource,
      needDownloadCc,
      notifyMissing,
      notifyPublish,
      episodesAutoSync,
      downloadOffsetType,
      downloadOffsetDays,
      downloadOffsetHours,
    }: FormValues) => {
      try {
        await client.mutate({
          mutation: SaveSeasonDocument,
          variables: {
            id,
            patch: {
              isMonitoring,
              // jellyfinId,
              title,
              tvdbId,
              tvdbSeason: tvdbSeason ?? null,
              weekday: weekday ? parseInt(weekday) : null,
              yearAndSemester:
                year && semester ? `${year}${semester.padStart(2, '0')}` : '',
              airTime,
              bangumiId,
              bilibiliMainlandId,
              bilibiliThmId,
              // description,
              infoSource,
              episodesSource,
              needDownloadCc,
              notifyMissing,
              notifyPublish,
              episodesAutoSync,
              downloadOffsetHours:
                (downloadOffsetType === 'advance' ? 1 : -1) *
                (downloadOffsetDays * 24 + downloadOffsetHours),
              sources: downloadSources,
            },
          },
        });
        void message.success('保存成功');
        void reloadAll();
        return true;
      } catch (error) {
        handleError(error, '保存失败');
        return false;
      }
    },
  );

  const values = useMemo(
    () => ({
      id,
      episodes,
      reloadConfig,
      reloadEpisodes,
      reloadAll,
      syncMetadataAndEpisodes,
      syncEpisodes,
      submit,
      reset,
      formRef,
      modified: touched,
      jellyfinId,
      episodesLastSync,
      updateTouched,
    }),
    [
      id,
      episodes,
      reloadConfig,
      reloadEpisodes,
      reloadAll,
      syncMetadataAndEpisodes,
      syncEpisodes,
      touched,
      submit,
      reset,
      jellyfinId,
      episodesLastSync,
      updateTouched,
    ],
  );

  return {
    initialValues,
    loading,
    formRef,
    values,
    updateTouched,
  };
}
