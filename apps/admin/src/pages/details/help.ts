import {
  GetAnimeDataByIdQuery,
  SeasonEnum,
  UpdateAnimeDataDocument,
} from '@/generated/types';
import { useApolloClient } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import { message } from 'antd';

export interface FormValues {
  bangumiId: string;
  bilibiliMainlandSsid: string;
  bilibiliThmSsid: string;
  jellyfinSeasonId: string;
  mikanAnimeId: string;
  sonarrInfo: [number | null | undefined, number];
  uniformName: string;
  semester: [number | null | undefined, SeasonEnum | null | undefined];
}

export function mapDataToValues(
  data: GetAnimeDataByIdQuery,
): FormValues | undefined {
  if (!data.animeMetadatumById) {
    void message.error('请求的元数据条目不存在或已被删除');
    return;
  }

  const {
    bangumiId,
    bilibiliMainlandSsid,
    bilibiliThmSsid,
    jellyfinSeasonId,
    mikanAnimeId,
    sonarrSeason,
    sonarrSeries,
    uniformName,
    season,
    year,
  } = data.animeMetadatumById;

  return {
    bangumiId,
    bilibiliMainlandSsid,
    bilibiliThmSsid,
    jellyfinSeasonId,
    mikanAnimeId,
    sonarrInfo: [sonarrSeries, sonarrSeason ?? 1],
    uniformName,
    semester: [year, season],
  };
}

export function useOnFinish(id: number) {
  const client = useApolloClient();

  return useMemoizedFn(
    async ({
      bangumiId,
      bilibiliMainlandSsid,
      bilibiliThmSsid,
      jellyfinSeasonId,
      mikanAnimeId,
      semester: [year, season],
      sonarrInfo: [sonarrSeries, sonarrSeason],
      uniformName,
    }: FormValues) => {
      try {
        await client.mutate({
          mutation: UpdateAnimeDataDocument,
          variables: {
            id,
            animeMetadatumPatch: {
              bangumiId,
              bilibiliMainlandSsid,
              bilibiliThmSsid,
              jellyfinSeasonId,
              mikanAnimeId,
              season,
              year,
              sonarrSeries,
              sonarrSeason,
              uniformName,
            },
          },
        });
        void message.success('保存成功');
        return true;
      } catch (e) {
        console.error(e);
        void message.error('保存失败');
        return false;
      }
    },
  );
}
