import { S3Service } from '@/common/s3.service';
import { PrismaService } from '@/common/prisma.service';
import config from '@/config';
import { getIdFromNodeId } from '@/utils/graphile';
import {
  Args,
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
import { ImageThumbnailService } from '@/image-thumbnail/index.service';

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

  constructor(
    private s3: S3Service,
    private prisma: PrismaService,
    private thumbnails: ImageThumbnailService,
  ) {}

  @ResolveField(() => String)
  async downloadPath(
    @Parent() { nodeId }: { nodeId: string },
    @Args('thumbnail', { type: () => Boolean, defaultValue: false })
    thumbnail = false,
  ) {
    const id = getIdFromNodeId(nodeId);
    const image = await this.prisma.image.findUnique({
      where: { id },
      rejectOnNotFound: false,
    });
    if (!image?.cosPath) {
      return undefined;
    }
    const cosPath = thumbnail
      ? await this.thumbnails.path(image)
      : image.cosPath;
    // 绝对过期时间让直连模式也能缓存，且不会从临近签名到期的请求重新计时一小时。
    const expires = new Date(Math.floor(Date.now() / 1000) * 1000 + 3600_000);
    const url = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: config.s3.bucket,
      Key: cosPath,
      Expires: 3600,
      ResponseCacheControl: 'private',
      ResponseExpires: expires,
    });
    this.logger.verbose(`Resolving image #${id}`);
    return imageDownloadPath(url, cosPath, config.s3);
  }
}
