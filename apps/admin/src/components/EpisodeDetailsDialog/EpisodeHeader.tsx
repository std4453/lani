import { GetEpisodeByIdQuery } from '@/generated/types';
import ProDescriptions from '@ant-design/pro-descriptions';
import { Typography } from 'antd';
import useMobile from '@/utils/useMobile';
type Episode = NonNullable<GetEpisodeByIdQuery['episodeById']>;
export default function EpisodeHeader({ episode }: { episode?: Episode }) {
  const mobile = useMobile();
  return (
    <ProDescriptions<Episode>
      dataSource={episode ?? undefined}
      colon={false}
      column={mobile ? 1 : 2}
    >
      <ProDescriptions.Item dataIndex={['id']} label="全局ID" copyable />
      <ProDescriptions.Item
        label="季度"
        dataIndex={['seasonBySeasonId']}
        render={(_, e) => {
          const episode = e as Episode;
          return episode.seasonBySeasonId ? (
            <Typography.Link
              href={`/season/${episode.seasonBySeasonId?.id}`}
              target="_blank"
            >
              {episode.seasonBySeasonId.title} (#
              {episode.seasonBySeasonId.id})
            </Typography.Link>
          ) : (
            '-'
          );
        }}
      />
      <ProDescriptions.Item
        dataIndex={['rawAirTime']}
        label="原始放送时间"
        valueType="dateTime"
      />
      <ProDescriptions.Item
        dataIndex={['airTime']}
        label="开始下载时间"
        valueType="dateTime"
      />
      <ProDescriptions.Item span={2} dataIndex={['description']} label="描述" />
    </ProDescriptions>
  );
}
