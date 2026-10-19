import {
  Directive,
  Field,
  ID,
  Int,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLScalarType, valueFromASTUntyped } from 'graphql';
import { torrentSubtitleInfo, TorrentSubtitleSource } from './torrent-subtitle';

export const TorrentJson = new GraphQLScalarType({
  name: 'JSON',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (node, variables) => valueFromASTUntyped(node, variables),
});

@ObjectType('Torrent')
@Directive('@extends')
@Directive('@key(fields: "nodeId")')
export class Torrent implements TorrentSubtitleSource {
  @Field(() => ID)
  @Directive('@external')
  nodeId: string;

  @Field(() => Int, { nullable: true })
  @Directive('@external')
  parseVersion?: number | null;

  @Field(() => TorrentJson, { nullable: true })
  @Directive('@external')
  parseResult?: unknown;

  @Field(() => TorrentJson, { nullable: true })
  @Directive('@external')
  metadata?: unknown;

  @Field(() => Boolean)
  @Directive('@external')
  subtitleHasChs: boolean;

  @Field(() => Boolean)
  @Directive('@external')
  subtitleHasCht: boolean;

  @Field(() => Boolean)
  @Directive('@external')
  subtitleHasJp: boolean;

  @Field(() => String, { nullable: true })
  @Directive('@external')
  subtitleType?: string | null;
}

@Resolver(() => Torrent)
export class TorrentSubtitleResolver {
  // Gateway 在原有列表查询中读取这些列并传入，不逐行查询数据库。
  @ResolveField(() => TorrentJson, { nullable: true })
  @Directive(
    '@requires(fields: "parseVersion parseResult metadata subtitleHasChs subtitleHasCht subtitleHasJp subtitleType")',
  )
  subtitleInfo(@Parent() source: Torrent) {
    return torrentSubtitleInfo(source);
  }
}
