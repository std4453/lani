import { calcEpisodeStatus, EpisodeStatus } from '@/constants/download-status';
import {
  DisplayImageFieldsFragment,
  GetSeasonByIdConfigOnlyQuery,
  GetSeasonByIdDocument,
  GetSeasonByIdEpisodesOnlyQuery,
  MetadataSource,
  SeasonConfigFieldsFragment,
  SyncEpisodeDataDocument,
  SyncMetadataDocument,
  UpdateSeasonByIdDocument,
  UpdateSeasonDownloadSourcesDocument,
} from '@/generated/types';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
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

export type Season = NonNullable<GetSeasonByIdConfigOnlyQuery['seasonById']>;

type SeasonEpisodesOnly = NonNullable<
  GetSeasonByIdEpisodesOnlyQuery['seasonById']
>;
type RawEpisode = NonNullable<
  ExtractNode<SeasonEpisodesOnly['episodesBySeasonId']>
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
  jellyfinId: string;
  mikanAnimeId: string;
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
  episodesLastSync: Date | null;
  needDownloadCc: boolean;
  notifyMissing: boolean;
  notifyPublish: boolean;
}

export function queryToFormValues({
  isMonitoring,
  jellyfinId,
  mikanAnimeId,
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
  episodesLastSync,
  needDownloadCc,
  notifyMissing,
  notifyPublish,
}: Season): FormValues {
  return {
    isMonitoring,
    jellyfinId,
    mikanAnimeId,
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
    episodesLastSync: episodesLastSync ?? null,
    needDownloadCc,
    notifyMissing,
    notifyPublish,
  };
}

export function useOnFinish(id: number, reloadConfig: () => Promise<void>) {
  const client = useApolloClient();

  return useMemoizedFn(
    async ({
      isMonitoring,
      jellyfinId,
      mikanAnimeId,
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
    }: // 这种只能同步的字段暂时不允许前端修改
    // tags,
    // description,
    FormValues) => {
      try {
        await client.mutate({
          mutation: UpdateSeasonByIdDocument,
          variables: {
            id,
            seasonPatch: {
              isMonitoring,
              jellyfinId,
              mikanAnimeId,
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
            },
          },
        });
        await client.mutate({
          mutation: UpdateSeasonDownloadSourcesDocument,
          variables: {
            input: {
              seasonId: id,
              sources: downloadSources.map(({ offset, ...source }) => ({
                ...source,
                offset,
              })),
            },
          },
        });
        void message.success('保存成功');
        void reloadConfig();
        return true;
      } catch (error) {
        console.error(error);
        void message.error('保存失败');
        return false;
      }
    },
  );
}

export const formItemProps: FormItemProps = {
  labelCol: {
    md: 5,
    lg: 4,
    xl: 3,
    xxl: 1,
  },
  wrapperCol: {
    md: 19,
    lg: 20,
    xl: 21,
    xxl: 23,
  },
  labelAlign: 'left',
};

export type FormRef = MutableRefObject<ProFormInstance<FormValues> | undefined>;

export interface SeasonPageContextValues {
  id: number;
  episodes: Episode[];
  reloadConfig: () => Promise<void>;
  reloadEpisodes: () => Promise<void>;
  syncMetadataAndEpisodes: () => Promise<void>;
  syncEpisodes: () => Promise<void>;
  formRef: FormRef;
}

export const SeasonPageContext = createContext<SeasonPageContextValues>({
  id: 0,
  episodes: [],
  async reloadConfig() {},
  async reloadEpisodes() {},
  async syncMetadataAndEpisodes() {},
  async syncEpisodes() {},
  formRef: {
    current: undefined,
  },
});

export function useSeasonPageContext() {
  return useContext(SeasonPageContext);
}

export function useSeasonId() {
  return useSeasonPageContext().id;
}

export function useLoad(id: number) {
  const client = useApolloClient();

  const formRef = useRef<ProFormInstance<FormValues>>();

  const [initialValues, setInitialValues] = useState<FormValues | undefined>(
    undefined,
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);

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
      if (data.seasonById.id) {
        setInitialValues(queryToFormValues(data.seasonById));
        formRef.current?.resetFields();
      }
      if (data.seasonById.episodesBySeasonId) {
        setEpisodes(
          (extractNode(data.seasonById.episodesBySeasonId) ?? []).map(
            mapEpisode,
          ),
        );
      }
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
      console.error(error);
      void message.error('同步元数据失败');
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
      console.error(error);
      void message.error('同步剧集信息失败');
    } finally {
      setLoading(false);
    }
  });

  const values: SeasonPageContextValues = useMemo(
    () => ({
      id,
      episodes,
      reloadConfig,
      reloadEpisodes,
      syncMetadataAndEpisodes,
      syncEpisodes,
      formRef,
    }),
    [
      id,
      episodes,
      reloadConfig,
      reloadEpisodes,
      syncMetadataAndEpisodes,
      syncEpisodes,
    ],
  );

  return {
    initialValues,
    loading,
    formRef,
    values,
  };
}
