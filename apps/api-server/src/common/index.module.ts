import {
  ChinaAxiosService,
  GlobalAxiosService,
  HKAxiosService,
  LocalAxiosService,
} from '@/common/axios.service';
import { PrismaService } from '@/common/prisma.service';
import { BigIntScalar } from '@/scalars/bigint.scalar';
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
  ],
  exports: [
    GlobalAxiosService,
    HKAxiosService,
    ChinaAxiosService,
    LocalAxiosService,
    BigIntScalar,
    PrismaService,
  ],
})
export class CommonModule {}
