import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
  LocalAxiosService,
} from '@/common/axios.service';
import { BigIntScalar } from '@/common/bigint.scalar';
import { PrismaService } from '@/common/prisma.service';
import { S3ServiceProvider } from '@/common/s3.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    GlobalAxiosService,
    HKAxiosService,
    ChinaAxiosService,
    LocalAxiosService,
    BigIntScalar,
    PrismaService,
    S3ServiceProvider,
  ],
  exports: [
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
