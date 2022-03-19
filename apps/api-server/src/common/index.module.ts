import { PrismaService } from '@/common/prisma.service';
import { ConfigType } from '@/config';
import { BigIntScalar } from '@/scalars/bigint.scalar';
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import createHttpsProxyAgent from 'https-proxy-agent';

@Injectable()
export class CommonService {
  constructor(private configService: ConfigService<ConfigType>) {}

  hk1Agent = createHttpsProxyAgent(this.configService.get<string>('proxy'));
}

@Module({
  imports: [ConfigModule],
  providers: [CommonService, BigIntScalar, PrismaService],
  exports: [CommonService, BigIntScalar, PrismaService],
})
export class CommonModule {}
