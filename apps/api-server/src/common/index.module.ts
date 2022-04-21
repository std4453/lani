import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
  LocalAxiosService,
} from '@/common/axios.service';
import { BigIntScalar } from '@/common/bigint.scalar';
import { COSService } from '@/common/cos.service';
import { PrismaService } from '@/common/prisma.service';
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
    COSService,
  ],
  exports: [
    GlobalAxiosService,
    HKAxiosService,
    ChinaAxiosService,
    LocalAxiosService,
    BigIntScalar,
    PrismaService,
    COSService,
  ],
})
export class CommonModule {}
