import { S3Service } from '@/common/s3.service';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { getIdFromNodeId } from '@/utils/graphile';
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
export class Image {
  @Field(() => ID)
  @Directive('@external')
  nodeId: string;

  @Field({ nullable: true })
  downloadPath?: string;
}

@Resolver(() => Image)
export class ImageResolver {
  constructor(private s3: S3Service, private prisma: PrismaService) {}

  @ResolveField(() => String)
  async downloadPath(@Parent() { nodeId }: { nodeId: string }) {
    const id = getIdFromNodeId(nodeId);
    const { cosPath } = await this.prisma.image.findUnique({
      where: { id },
    });
    if (!cosPath) {
      return undefined;
    }
    const url = this.s3.getSignedUrl('getObject', {
      Bucket: config.s3.bucket,
      Key: cosPath,
    });
    console.log(url);
    return url;
  }
}
