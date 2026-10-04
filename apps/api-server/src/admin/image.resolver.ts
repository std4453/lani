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
import { Logger } from '@nestjs/common';
import { imageDownloadPath } from './image-url';

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
  private readonly logger = new Logger(ImageResolver.name);

  constructor(private s3: S3Service, private prisma: PrismaService) {}

  @ResolveField(() => String)
  async downloadPath(@Parent() { nodeId }: { nodeId: string }) {
    const id = getIdFromNodeId(nodeId);
    const image = await this.prisma.image.findUnique({
      where: { id },
      rejectOnNotFound: false,
    });
    if (!image?.cosPath) {
      return undefined;
    }
    const { cosPath } = image;
    const url = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: config.s3.bucket,
      Key: cosPath,
    });
    this.logger.verbose(`Resolving image #${id}`);
    return imageDownloadPath(url, cosPath, config.s3);
  }
}
