import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { getIdFromNodeId } from '@/utils/graphile';
import { mapPath } from '@/utils/path';
import {
  Directive,
  Field,
  ID,
  ObjectType,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "nodeId")')
export class JellyfinFolder {
  @Field(() => ID)
  @Directive('@external')
  nodeId: string;

  @Field({ nullable: true })
  mappedLocation?: string;
}

@Resolver(() => JellyfinFolder)
export class JellyfinFolderResolver {
  constructor(private prisma: PrismaService) {}

  @ResolveField(() => String)
  async mappedLocation(@Parent() { nodeId }: { nodeId: string }) {
    const id = getIdFromNodeId(nodeId);
    const { location } = await this.prisma.jellyfinFolder.findUnique({
      where: { id },
    });
    if (!location) {
      return undefined;
    }
    return mapPath(config.jellyfin.pathMapping, location);
  }
}
