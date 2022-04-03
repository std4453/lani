import {
  DownloadStatus,
  GetSeasonByIdConfigOnlyQuery,
  GetSeasonByIdEpisodesOnlyQuery,
  MetadataSource,
  UpdateSeasonByIdDocument,
  UpdateSeasonDownloadSourcesDocument,
} from '@/generated/types';
import { ExtractNode, extractNode } from '@/utils/graphql';
import { ProFormInstance } from '@ant-design/pro-form';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { FormItemProps, message } from 'antd';
import dayjs from 'dayjs';
import { MutableRefObject } from 'react';

export type Season = NonNullable<GetSeasonByIdConfigOnlyQuery['seasonById']>;

type SeasonEpisodesOnly = NonNullable<
  GetSeasonByIdEpisodesOnlyQuery['seasonById']
>;
type RawEpisode = NonNullable<
  ExtractNode<SeasonEpisodesOnly['episodesBySeasonId']>
>;
type DownloadJob = NonNullable<
  ExtractNode<RawEpisode['downloadJobsByEpisodeId']>
>;
export type ExtendedDownloadStatus =
  | DownloadStatus
  | 'DOWNLOAD_FAILED'
  | 'NOT_AIRED'
  | 'DATE_UNKNOWN'
  | 'RESOURCE_WAITING';
export type Episode = Omit<RawEpisode, 'downloadJobsByEpisodeId'> & {
  jobStatus: ExtendedDownloadStatus;
};

function calcJobStatus(
  airTime: string | undefined,
  job?: DownloadJob,
): ExtendedDownloadStatus {
  if (job) {
    if (job.isFailed) {
      return 'DOWNLOAD_FAILED';
    }
    return job.status;
  } else {
    if (airTime) {
      if (dayjs(airTime).isBefore(dayjs())) {
        return 'RESOURCE_WAITING';
      } else {
        return 'NOT_AIRED';
      }
    } else {
      return 'DATE_UNKNOWN';
    }
  }
}

export function mapEpisode({
  downloadJobsByEpisodeId,
  ...episode
}: RawEpisode): Episode {
  const jobs = extractNode(downloadJobsByEpisodeId) ?? [];
  return {
    ...episode,
    jobStatus: calcJobStatus(episode.airTime, jobs[0]),
  };
}

export interface DownloadSource {
  id: number;
  pattern: string;
}

export interface FormValues {
  isMonitoring: boolean;
  jellyfinId: string;
  mikanAnimeId: string;
  jellyfinFolderId: number | null;
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
}

export function queryToFormValues({
  isMonitoring,
  jellyfinId,
  mikanAnimeId,
  jellyfinFolderId,
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
}: Season): FormValues {
  return {
    isMonitoring,
    jellyfinId,
    mikanAnimeId,
    jellyfinFolderId: jellyfinFolderId ?? null,
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
    downloadSources: extractNode(downloadSourcesBySeasonId) ?? [],
    infoSource,
    episodesSource,
  };
}

export function useOnFinish(id: number, reloadConfig: () => Promise<void>) {
  const client = useApolloClient();

  return useMemoizedFn(
    async ({
      isMonitoring,
      jellyfinId,
      mikanAnimeId,
      jellyfinFolderId,
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
              jellyfinFolderId: jellyfinFolderId ?? null,
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
            },
          },
        });
        await client.mutate({
          mutation: UpdateSeasonDownloadSourcesDocument,
          variables: {
            input: {
              seasonId: id,
              sources: downloadSources,
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
