import { ApolloClient } from '@apollo/client';
import {
  SmartDownloadPreviewDocument,
  TorrentMatchStatus,
  TorrentChannel,
} from '@/generated/types';
import { PreviewPage, PreviewRequest } from './cache';
import { formatNumber } from '@/utils/episode';

/** 使用连接的原生游标；首集之前的上下文由同一正序连接取末尾 10 条。 */
export async function fetchPreviewPage(
  client: Pick<ApolloClient<object>, 'query'>,
  seasonId: number,
  request: PreviewRequest,
  signal: AbortSignal,
): Promise<PreviewPage> {
  const { data } = await client.query({
    query: SmartDownloadPreviewDocument,
    variables: {
      first: request.before ? undefined : request.first,
      last: request.before ? request.first : undefined,
      after: request.after,
      filter: {
        matchedSeasonId: { equalTo: seasonId },
        matchStatus: { equalTo: TorrentMatchStatus.Matched },
        createdAt: { lessThanOrEqualTo: request.snapshot },
        publishDate: {
          lessThanOrEqualTo: request.snapshot,
          ...(request.from ? { greaterThanOrEqualTo: request.from } : {}),
          ...(request.before ? { lessThan: request.before } : {}),
        },
        episodeNumberFrom: { isNull: true },
        episodeNumberTo: { isNull: true },
      },
    },
    fetchPolicy: 'no-cache',
    context: { fetchOptions: { signal }, queryDeduplication: false },
  });
  const connection = data.allTorrents!;
  return {
    nodes: connection.nodes.flatMap((torrent) =>
      torrent
        ? [
            {
              ...torrent,
              // GraphQL 编号是定点十进制字符串，先去掉尾零再参与匹配和展示。
              episodeInfo: torrent.episodeInfo && {
                ...torrent.episodeInfo,
                index:
                  typeof torrent.episodeInfo.index === 'string'
                    ? formatNumber(torrent.episodeInfo.index)
                    : torrent.episodeInfo.index,
              },
              ready:
                typeof torrent.parseVersion === 'number' &&
                (torrent.channel !== TorrentChannel.Nyaa ||
                  Boolean(torrent.metadataFetchedAt)),
            },
          ]
        : [],
    ),
    cursor: connection.pageInfo.endCursor ?? null,
    hasMore: request.before
      ? connection.pageInfo.hasPreviousPage
      : connection.pageInfo.hasNextPage,
    excludes: data.config?.smartDownloadTitleExcludes ?? [],
  };
}
