import { PrismaService } from '@/common/prisma.service';
import { getIdFromNodeId } from '@/utils/graphile';
import {
  Context,
  Directive,
  Field,
  ID,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';
import { torrentSubtitleInfo } from './torrent-subtitle';

export const TorrentJson = new GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (node, variables) => valueFromASTUntyped(node, variables),
});

@ObjectType('Torrent')
@Directive('@extends')
@Directive('@key(fields: "nodeId")')
export class Torrent {
  @Field(() => ID)
  @Directive('@external')
  nodeId: string;
}

@Resolver(() => Torrent)
export class TorrentSubtitleResolver {
  // 同一 GraphQL 请求内批量查询并复用结果；请求结束后不保留缓存。
  private readonly loaders = new WeakMap<
    object,
    DataLoader<number, ReturnType<typeof torrentSubtitleInfo>>
  >();

  constructor(private readonly prisma: PrismaService) {}

  private loader(context: object) {
    let loader = this.loaders.get(context);
    if (!loader) {
      loader = new DataLoader<number, ReturnType<typeof torrentSubtitleInfo>>(
        async (ids) => {
          const rows = await this.prisma.torrent.findMany({
            where: { id: { in: [...ids] } },
            select: {
              id: true,
              parseVersion: true,
              parseResult: true,
              metadata: true,
              subtitleHasCHS: true,
              subtitleHasCHT: true,
              subtitleHasJP: true,
              subtitleType: true,
            },
          });
          const results = new Map(
            rows.map((row) => [
              row.id,
              torrentSubtitleInfo({
                ...row,
                subtitleHasChs: row.subtitleHasCHS,
                subtitleHasCht: row.subtitleHasCHT,
                subtitleHasJp: row.subtitleHasJP,
              }),
            ]),
          );
          // 查询结果不保证顺序；种子在两次读取间删除时返回空值。
          return ids.map((id) => results.get(id) ?? null);
        },
      );
      this.loaders.set(context, loader);
    }
    return loader;
  }

  @ResolveField(() => TorrentJson, { nullable: true })
  subtitleInfo(@Parent() { nodeId }: Torrent, @Context() context: object) {
    const id = getIdFromNodeId(nodeId);
    return this.loader(context).load(id);
  }
}
