import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
  LocalAxiosService,
} from '@/common/axios.service';
import { BigIntScalar } from '@/common/bigint.scalar';
import { InjectBangumiAxiosService } from '@/common/InjectBangumiAxios.service';
import { InjectJellyfinAxiosService } from '@/common/InjectJellyfinAxios.service';
import { PrismaService } from '@/common/prisma.service';
import { S3ServiceProvider } from '@/common/s3.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaOperations } from './media-operations';

@Module({
  imports: [ConfigModule],
  providers: [
    MediaOperations,
    GlobalAxiosService,
    HKAxiosService,
    ChinaAxiosService,
    LocalAxiosService,
    BigIntScalar,
    PrismaService,
    S3ServiceProvider,
    InjectBangumiAxiosService,
    InjectJellyfinAxiosService,
  ],
  exports: [
    MediaOperations,
    GlobalAxiosService,
    HKAxiosService,
    ChinaAxiosService,
    LocalAxiosService,
    BigIntScalar,
    PrismaService,
    S3ServiceProvider,
  ],
})
export class CommonModule {}
