import { BilibiliBangumiCCResolver } from '@/bilibili-bangumi-cc/index.resolver';
import { BilibiliBangumiCCService } from '@/bilibili-bangumi-cc/index.service';
import { CommonModule } from '@/common/index.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

/**
 * TODO: 添加log，重启bilibili下载字幕&弹幕能力
 */
@Module({
  imports: [CommonModule, ConfigModule],
  providers: [BilibiliBangumiCCService, BilibiliBangumiCCResolver],
  exports: [BilibiliBangumiCCService],
})
export class BilibiliBangumiCCModule {}
