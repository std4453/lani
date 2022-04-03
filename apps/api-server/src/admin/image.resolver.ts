import { COSService } from '@/common/cos.service';
import { PrismaService } from '@/common/prisma.service';
import { ConfigType, COSBucket } from '@/config';
import { getIdFromNodeId } from '@/utils/graphile';
import { ConfigService } from '@nestjs/config';
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
  constructor(
    private cos: COSService,
    private config: ConfigService<ConfigType, true>,
    private prisma: PrismaService,
  ) {}

  @ResolveField(() => String)
  async downloadPath(@Parent() { nodeId }: { nodeId: string }) {
    const id = getIdFromNodeId(nodeId);
    const { cosPath } = await this.prisma.image.findUnique({
      where: { id },
    });
    if (!cosPath) {
      return undefined;
    }
    const bucket = this.config.get<COSBucket>('imagesBucket');
    const url = this.cos.getObjectUrl(
      {
        Bucket: bucket.bucket,
        Region: bucket.region,
        Key: cosPath,
      },
      // COS的Node.js SDK类型标注有问题，非得要第二个参数，但其实是同步调用
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
    return url;
  }
}
